from .. import db
from datetime import datetime, date
import uuid
from enum import Enum

class AnalyticsEventType(Enum):
    TASK_COMPLETED = 'task_completed'
    TASK_CREATED = 'task_created'
    TASK_UPDATED = 'task_updated'
    TASK_DELETED = 'task_deleted'
    SCHEDULE_GENERATED = 'schedule_generated'
    USER_ACTIVITY = 'user_activity'

class AnalyticsEvent(db.Model):
    __tablename__ = 'analytics_events'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    event_type = db.Column(db.Enum(AnalyticsEventType), nullable=False)
    event_data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id, event_type, event_data):
        self.user_id = user_id
        self.event_type = event_type
        self.event_data = event_data
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_type': self.event_type.value,
            'event_data': self.event_data,
            'created_at': self.created_at.isoformat()
        }

class UserAnalytics(db.Model):
    __tablename__ = 'user_analytics'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    total_tasks_completed = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    best_streak = db.Column(db.Integer, default=0)
    total_xp = db.Column(db.Integer, default=0)
    last_active = db.Column(db.Date, default=date.today)
    
    # Weekly metrics (cached for performance)
    week_start_date = db.Column(db.Date)
    tasks_completed_this_week = db.Column(db.Integer, default=0)
    total_scheduled_time = db.Column(db.Integer, default=0)  # in minutes
    
    def __init__(self, user_id):
        self.user_id = user_id
        self.week_start_date = date.today() - timedelta(days=date.today().weekday())
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'total_tasks_completed': self.total_tasks_completed,
            'current_streak': self.current_streak,
            'best_streak': self.best_streak,
            'total_xp': self.total_xp,
            'last_active': self.last_active.isoformat(),
            'week_start_date': self.week_start_date.isoformat(),
            'tasks_completed_this_week': self.tasks_completed_this_week,
            'total_scheduled_time': self.total_scheduled_time
        }

def update_user_analytics(user_id, event_type, event_data=None):
    """Update user analytics based on an event"""
    analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
    today = date.today()
    
    if not analytics:
        analytics = UserAnalytics(user_id=user_id)
        db.session.add(analytics)
    
    # Update last active date and check streak
    if analytics.last_active < today - timedelta(days=1):
        # Reset streak if more than one day has passed
        analytics.current_streak = 1
    elif analytics.last_active < today:
        # Increment streak if user was active yesterday
        analytics.current_streak += 1
        if analytics.current_streak > analytics.best_streak:
            analytics.best_streak = analytics.current_streak
    
    analytics.last_active = today
    
    # Update weekly metrics
    week_start = today - timedelta(days=today.weekday())
    if analytics.week_start_date < week_start:
        # New week, reset weekly metrics
        analytics.week_start_date = week_start
        analytics.tasks_completed_this_week = 0
        analytics.total_scheduled_time = 0
    
    # Handle specific event types
    if event_type == AnalyticsEventType.TASK_COMPLETED:
        analytics.total_tasks_completed += 1
        analytics.tasks_completed_this_week += 1
        if event_data and 'xp' in event_data:
            analytics.total_xp += event_data['xp']
    
    # Create analytics event
    event = AnalyticsEvent(
        user_id=user_id,
        event_type=event_type,
        event_data=event_data or {}
    )
    db.session.add(event)
    db.session.commit()
    
    return analytics

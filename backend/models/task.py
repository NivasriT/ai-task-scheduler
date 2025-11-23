from .. import db
from datetime import datetime, timedelta
import uuid
from enum import Enum

class TaskCategory(Enum):
    WORK = 'Work'
    STUDY = 'Study'
    PERSONAL = 'Personal'
    HEALTH = 'Health'
    OTHER = 'Other'

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.Enum(TaskCategory), default=TaskCategory.OTHER)
    priority = db.Column(db.Integer, default=2)  # 1: Low, 2: Medium, 3: High
    energy_level = db.Column(db.Integer)  # 1-5 scale, 5 being most energy
    estimated_duration = db.Column(db.Integer)  # in minutes
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    xp_value = db.Column(db.Integer, default=10)  # XP points for completing this task
    
    # Relationships
    completions = db.relationship('TaskCompletion', backref='task', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, user_id, title, **kwargs):
        self.user_id = user_id
        self.title = title
        self.description = kwargs.get('description', '')
        self.category = kwargs.get('category', TaskCategory.OTHER)
        self.priority = kwargs.get('priority', 2)
        self.energy_level = kwargs.get('energy_level', 3)
        self.estimated_duration = kwargs.get('estimated_duration', 30)  # Default 30 minutes
        self.due_date = kwargs.get('due_date')
        self.xp_value = self.calculate_xp()
    
    def calculate_xp(self):
        """Calculate XP based on task attributes"""
        xp = 10  # Base XP
        
        # Adjust XP based on priority
        xp += (self.priority - 1) * 5  # +0 for low, +5 for medium, +10 for high
        
        # Adjust XP based on estimated duration (5 XP per estimated hour)
        if self.estimated_duration:
            xp += (self.estimated_duration // 60) * 5
        
        # Adjust XP based on energy level (higher energy tasks give more XP)
        if self.energy_level:
            xp += (self.energy_level - 1) * 2
            
        return max(5, min(xp, 100))  # Cap XP between 5 and 100
    
    def mark_complete(self):
        self.is_completed = True
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        # Create a completion record
        completion = TaskCompletion(
            task_id=self.id,
            completed_at=self.completed_at,
            xp_earned=self.xp_value
        )
        db.session.add(completion)
        
        # Add XP to user
        user = self.user
        user.add_xp(self.xp_value)
        user.update_streak()
        
        db.session.commit()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'category': self.category.value if self.category else None,
            'priority': self.priority,
            'energy_level': self.energy_level,
            'estimated_duration': self.estimated_duration,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_completed': self.is_completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'xp_value': self.xp_value
        }

class TaskCompletion(db.Model):
    __tablename__ = 'task_completions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=False)
    completed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    xp_earned = db.Column(db.Integer, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'completed_at': self.completed_at.isoformat(),
            'xp_earned': self.xp_earned
        }

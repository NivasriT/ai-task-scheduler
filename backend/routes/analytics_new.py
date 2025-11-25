from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
from sqlalchemy import func, extract, and_
from ..models import db, Task, UserAnalytics, AnalyticsEvent, AnalyticsEventType
import numpy as np

bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    """
    Get all metrics needed for the dashboard
    Returns:
        - User stats (streak, xp, level)
        - Today's tasks
        - Weekly completion rate
        - Productivity score
        - Upcoming deadlines
    """
    user_id = get_jwt_identity()
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Get user analytics
    user_analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
    if not user_analytics:
        user_analytics = UserAnalytics(user_id=user_id)
        db.session.add(user_analytics)
        db.session.commit()
    
    # Get today's tasks
    today_tasks = Task.query.filter(
        Task.user_id == user_id,
        Task.due_date >= datetime.combine(today, datetime.min.time()),
        Task.due_date < datetime.combine(today + timedelta(days=1), datetime.min.time())
    ).order_by(Task.priority.desc(), Task.due_date).all()
    
    # Calculate weekly completion
    week_completed = Task.query.filter(
        Task.user_id == user_id,
        Task.is_completed == True,
        Task.completed_at >= week_start,
        Task.completed_at <= week_end + timedelta(days=1)
    ).count()
    
    week_total = Task.query.filter(
        Task.user_id == user_id,
        Task.due_date >= week_start,
        Task.due_date <= week_end
    ).count()
    
    weekly_completion = (week_completed / week_total * 100) if week_total > 0 else 0
    
    # Calculate productivity score (0-100)
    productivity_score = min(100, user_analytics.tasks_completed_this_week * 10)
    
    # Get upcoming deadlines (next 3 days)
    upcoming_deadlines = Task.query.filter(
        Task.user_id == user_id,
        Task.is_completed == False,
        Task.due_date >= datetime.utcnow(),
        Task.due_date <= datetime.utcnow() + timedelta(days=3)
    ).order_by(Task.due_date).limit(5).all()
    
    # Calculate level based on XP (simplified)
    level = int((user_analytics.total_xp // 1000) + 1)
    xp_to_next_level = user_analytics.total_xp % 1000
    
    return jsonify({
        'status': 'success',
        'data': {
            'user_stats': {
                'current_streak': user_analytics.current_streak,
                'best_streak': user_analytics.best_streak,
                'total_xp': user_analytics.total_xp,
                'level': level,
                'xp_to_next_level': xp_to_next_level,
                'level_progress': int((xp_to_next_level / 1000) * 100)
            },
            'today_tasks': [{
                'id': task.id,
                'title': task.title,
                'priority': task.priority,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'is_completed': task.is_completed
            } for task in today_tasks],
            'weekly_completion': round(weekly_completion, 1),
            'productivity_score': productivity_score,
            'upcoming_deadlines': [{
                'id': task.id,
                'title': task.title,
                'due_date': task.due_date.isoformat(),
                'priority': task.priority,
                'days_until_due': (task.due_date.date() - today).days
            } for task in upcoming_deadlines]
        }
    }), 200

@bp.route('/heatmap', methods=['GET'])
@jwt_required()
def get_heatmap_data():
    """
    Get data for the activity heatmap
    Returns 12 weeks of completion data
    """
    user_id = get_jwt_identity()
    end_date = date.today()
    start_date = end_date - timedelta(weeks=11)  # 12 weeks total
    
    # Get completed tasks in this period
    completed_tasks = Task.query.filter(
        Task.user_id == user_id,
        Task.is_completed == True,
        Task.completed_at >= start_date,
        Task.completed_at <= end_date + timedelta(days=1)
    ).all()
    
    # Initialize heatmap data
    heatmap_data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Count tasks completed on this day
        count = sum(1 for task in completed_tasks 
                   if task.completed_at and 
                   task.completed_at.date() == current_date)
        
        heatmap_data.append({
            'date': current_date.isoformat(),
            'count': count,
            'weekday': current_date.weekday(),  # 0 = Monday, 6 = Sunday
            'week_number': int(current_date.strftime('%W'))  # ISO week number
        })
        
        current_date += timedelta(days=1)
    
    return jsonify({
        'status': 'success',
        'data': heatmap_data
    }), 200

@bp.route('/productivity', methods=['GET'])
@jwt_required()
def get_productivity_metrics():
    """
    Get productivity metrics and trends
    """
    user_id = get_jwt_identity()
    today = date.today()
    
    # Get completion data for the last 30 days
    completion_data = []
    for i in range(30):
        day = today - timedelta(days=29-i)
        completed = Task.query.filter(
            Task.user_id == user_id,
            Task.is_completed == True,
            func.date(Task.completed_at) == day
        ).count()
        
        completion_data.append({
            'date': day.isoformat(),
            'completed': completed
        })
    
    # Calculate average tasks per day
    avg_tasks = sum(d['completed'] for d in completion_data) / 30
    
    # Get task distribution by time of day
    time_distribution = db.session.query(
        extract('hour', Task.completed_at).label('hour'),
        func.count(Task.id).label('count')
    ).filter(
        Task.user_id == user_id,
        Task.is_completed == True,
        Task.completed_at >= today - timedelta(days=30)
    ).group_by('hour').order_by('hour').all()
    
    # Format time distribution
    time_data = [0] * 24
    for hour, count in time_distribution:
        time_data[int(hour)] = count
    
    # Get category distribution
    category_distribution = db.session.query(
        Task.category,
        func.count(Task.id).label('count')
    ).filter(
        Task.user_id == user_id,
        Task.is_completed == True,
        Task.completed_at >= today - timedelta(days=30)
    ).group_by(Task.category).all()
    
    return jsonify({
        'status': 'success',
        'data': {
            'completion_trend': completion_data,
            'average_tasks_per_day': round(avg_tasks, 1),
            'time_distribution': time_data,
            'category_distribution': [
                {'category': str(cat), 'count': count} 
                for cat, count in category_distribution
            ]
        }
    }), 200

@bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    """
    Generate AI-powered insights based on user's activity
    """
    user_id = get_jwt_identity()
    
    # Get recent tasks and completions
    recent_tasks = Task.query.filter(
        Task.user_id == user_id,
        Task.due_date >= datetime.utcnow() - timedelta(days=30)
    ).order_by(Task.due_date.desc()).limit(50).all()
    
    if not recent_tasks:
        return jsonify({
            'status': 'success',
            'insights': [
                "You haven't added any tasks yet. Get started by adding your first task!"
            ]
        }), 200
    
    # Analyze task patterns (simplified example)
    insights = []
    
    # Check for overdue tasks
    overdue = [t for t in recent_tasks if t.due_date and t.due_date < datetime.utcnow() and not t.is_completed]
    if overdue:
        insights.append(f"You have {len(overdue)} overdue tasks. Consider rescheduling or prioritizing them.")
    
    # Check for high-priority tasks
    high_priority = [t for t in recent_tasks if t.priority >= 3 and not t.is_completed]
    if high_priority:
        insights.append(f"You have {len(high_priority)} high-priority tasks. Focus on these first!")
    
    # Check for task distribution
    completed = [t for t in recent_tasks if t.is_completed]
    completion_rate = len(completed) / len(recent_tasks) * 100 if recent_tasks else 0
    
    if completion_rate < 50:
        insights.append("Your task completion rate is low. Try breaking tasks into smaller, more manageable pieces.")
    
    # Add more insights based on your specific needs
    
    # If no specific insights, add a general one
    if not insights:
        insights.append("You're doing great! Keep up the good work!")
    
    return jsonify({
        'status': 'success',
        'insights': insights
    }), 200

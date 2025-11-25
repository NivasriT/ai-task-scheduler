from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..models import db, Task
from ..ai.scheduler import Scheduler
import json

bp = Blueprint('scheduler', __name__, url_prefix='/api/scheduler')

def task_to_dict(task):
    """Convert Task model to dictionary"""
    return {
        'id': str(task.id),
        'title': task.title,
        'description': task.description,
        'priority': task.priority,
        'energy_level': task.energy_level,
        'estimated_duration': task.estimated_duration,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'category': task.category.value if task.category else 'OTHER',
        'is_completed': task.is_completed,
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat()
    }

@bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_schedule():
    """
    Generate a smart schedule for the user's tasks
    
    Request body (optional):
    {
        "start_date": "2023-01-01T09:00:00",  // Optional, defaults to now
        "end_date": "2023-01-07T21:00:00",    // Optional, defaults to 7 days from now
        "work_hours": {
            "start": "09:00",                 // Optional, defaults to 9:00
            "end": "21:00"                    // Optional, defaults to 21:00
        },
        "include_completed": false            // Optional, defaults to false
    }
    """
    user_id = get_jwt_identity()
    
    # Parse request data
    data = request.get_json() or {}
    
    # Set date range
    start_date = datetime.fromisoformat(data.get('start_date')) if 'start_date' in data else datetime.utcnow()
    end_date = datetime.fromisoformat(data.get('end_date')) if 'end_date' in data else start_date + timedelta(days=7)
    
    # Get tasks
    query = Task.query.filter_by(user_id=user_id)
    if not data.get('include_completed', False):
        query = query.filter_by(is_completed=False)
    
    tasks = query.all()
    
    if not tasks:
        return jsonify({
            'status': 'success',
            'message': 'No tasks to schedule',
            'schedule': []
        }), 200
    
    # Convert tasks to dict format for scheduler
    tasks_data = [task_to_dict(task) for task in tasks]
    
    # Initialize scheduler
    scheduler = Scheduler(user_id=user_id)
    
    # Generate schedule
    try:
        schedule = scheduler.create_schedule(tasks_data, start_date, end_date)
        
        return jsonify({
            'status': 'success',
            'message': 'Schedule generated successfully',
            'schedule': schedule,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'tasks_scheduled': len([t for day in schedule for t in day if t.get('task_id')])
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error generating schedule: {str(e)}'
        }), 500

@bp.route('/reschedule', methods=['POST'])
@jwt_required()
def reschedule_task():
    """
    Reschedule a specific task to a new time
    
    Request body:
    {
        "task_id": "task-uuid-123",
        "new_start_time": "2023-01-01T14:00:00",
        "current_schedule": [...]  // The current schedule array
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate request
    if not all(key in data for key in ['task_id', 'new_start_time', 'current_schedule']):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields: task_id, new_start_time, current_schedule'
        }), 400
    
    try:
        # Initialize scheduler
        scheduler = Scheduler(user_id=user_id)
        
        # Parse new start time
        new_start_time = datetime.fromisoformat(data['new_start_time'].replace('Z', '+00:00'))
        
        # Reschedule the task
        updated_schedule = scheduler.reschedule_task(
            task_id=data['task_id'],
            current_schedule=data['current_schedule'],
            new_time=new_start_time
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Task rescheduled successfully',
            'updated_schedule': updated_schedule
        }), 200
        
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': f'Invalid date format: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error rescheduling task: {str(e)}'
        }), 500

@bp.route('/suggest', methods=['GET'])
@jwt_required()
def suggest_task():
    """
    Suggest a task to work on now based on current time and energy levels
    """
    user_id = get_jwt_identity()
    current_time = datetime.utcnow()
    
    # Get user's tasks
    tasks = Task.query.filter_by(user_id=user_id, is_completed=False).all()
    
    if not tasks:
        return jsonify({
            'status': 'success',
            'message': 'No tasks to suggest',
            'suggestion': None
        }), 200
    
    # Convert tasks to dict format
    tasks_data = [task_to_dict(task) for task in tasks]
    
    # Sort tasks by priority and due date
    suggested_task = sorted(
        tasks_data,
        key=lambda x: (
            -x.get('priority', 2),
            x.get('due_date', '9999-12-31')  # Tasks without due date go to the end
        )
    )[0]  # Get the highest priority task
    
    return jsonify({
        'status': 'success',
        'message': 'Task suggestion generated',
        'suggestion': {
            'task_id': suggested_task['id'],
            'title': suggested_task['title'],
            'priority': suggested_task['priority'],
            'energy_level': suggested_task['energy_level'],
            'estimated_duration': suggested_task['estimated_duration'],
            'due_date': suggested_task['due_date']
        }
    }), 200

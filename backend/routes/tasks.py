from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import db, Task, TaskCompletion, TaskCategory
from ..ai.nlp_processor import NLPProcessor

bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')
nlp_processor = NLPProcessor()

@bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    tasks = Task.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'tasks': [task.to_dict() for task in tasks]
    }), 200

@bp.route('/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify({
        'task': task.to_dict()
    }), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # If task is in natural language, parse it
    if 'natural_language' in data and data['natural_language']:
        parsed_task = nlp_processor.parse_task(data.get('title', ''))
        data = {**parsed_task, **data}
    
    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    # Create new task
    try:
        task = Task(
            user_id=user_id,
            title=data['title'],
            description=data.get('description', ''),
            category=TaskCategory[data.get('category', 'OTHER').upper()],
            priority=int(data.get('priority', 2)),
            energy_level=int(data.get('energy_level', 3)),
            estimated_duration=int(data.get('estimated_duration', 30)),
            due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': 'Task created successfully',
            'task': task.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    data = request.get_json()
    
    # Update task fields
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'category' in data:
        task.category = TaskCategory[data['category'].upper()]
    if 'priority' in data:
        task.priority = int(data['priority'])
    if 'energy_level' in data:
        task.energy_level = int(data['energy_level'])
    if 'estimated_duration' in data:
        task.estimated_duration = int(data['estimated_duration'])
    if 'due_date' in data:
        task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
    if 'is_completed' in data:
        if data['is_completed'] and not task.is_completed:
            task.mark_complete()
        else:
            task.is_completed = data['is_completed']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Task updated successfully',
            'task': task.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    if task.is_completed:
        return jsonify({'error': 'Task is already completed'}), 400
    
    try:
        task.mark_complete()
        return jsonify({
            'message': 'Task marked as complete',
            'task': task.to_dict(),
            'xp_earned': task.xp_value
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

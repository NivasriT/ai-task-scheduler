import pytest
import json
from datetime import datetime, timedelta

def test_create_task(client, auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    due_date = (datetime.utcnow() + timedelta(days=7)).isoformat()
    
    response = client.post('/api/tasks', json={
        'title': 'Complete project',
        'description': 'Finish the AI task scheduler',
        'priority': 3,
        'due_date': due_date,
        'energy_level': 4
    }, headers=headers)
    
    assert response.status_code == 201
    assert 'task' in response.json
    assert response.json['task']['title'] == 'Complete project'

def test_get_tasks(client, auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = client.get('/api/tasks', headers=headers)
    
    assert response.status_code == 200
    assert 'tasks' in response.json
    assert isinstance(response.json['tasks'], list)

@pytest.fixture
def auth_token(client):
    # Login to get token
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })
    return response.json['access_token']

import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from '../TaskList';
import '@testing-library/jest-dom';

const mockTasks = [
  {
    id: '1',
    title: 'Complete project',
    description: 'Finish the AI task scheduler',
    priority: 3,
    is_completed: false,
    due_date: '2023-12-31T23:59:59'
  },
  {
    id: '2',
    title: 'Write tests',
    description: 'Add unit tests for components',
    priority: 2,
    is_completed: true,
    due_date: '2023-11-30T23:59:59'
  }
];

describe('TaskList Component', () => {
  it('displays a list of tasks', () => {
    render(<TaskList tasks={mockTasks} onTaskToggle={() => {}} />);
    
    const taskItems = screen.getAllByRole('listitem');
    expect(taskItems.length).toBe(2);
    
    expect(screen.getByText('Complete project')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('shows completed tasks as checked', () => {
    render(<TaskList tasks={mockTasks} onTaskToggle={() => {}} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked(); // First task not completed
    expect(checkboxes[1]).toBeChecked();     // Second task is completed
  });
});

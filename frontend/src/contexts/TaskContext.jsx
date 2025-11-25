import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useAnalytics } from './AnalyticsContext';
import * as api from '../utils/api';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { 
    trackTaskCompleted, 
    trackTaskCreated, 
    trackTaskUpdated, 
    trackTaskDeleted 
  } = useAnalytics();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    category: null,
  });
  const [sortBy, setSortBy] = useState('dueDate');

  // Fetch tasks when user logs in or filters change
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.getTasks({
          status: filters.status,
          priority: filters.priority,
          category: filters.category,
        });
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [currentUser, filters]);

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const response = await api.createTask(taskData);
      const newTask = response.data;
      setTasks(prev => [...prev, newTask]);
      
      // Track task creation
      trackTaskCreated(newTask);
      
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  // Update an existing task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await api.updateTask(taskId, updates);
      const updatedTask = response.data;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
      
      // Track task update
      trackTaskUpdated(taskId, updates);
      
      // If task was marked as completed, track completion
      if (updates.isCompleted) {
        const task = tasks.find(t => t.id === taskId);
        if (task) trackTaskCompleted(task);
      }
      
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      // Track task deletion before actually deleting
      trackTaskDeleted(taskId);
      
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  // Toggle task completion status
  const toggleComplete = async (taskId, isCompleted) => {
    try {
      const updatedTask = await api.completeTask(taskId);
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        )
      );
      
      // If task was marked as completed, track completion
      if (!isCompleted) {
        const task = tasks.find(t => t.id === taskId);
        if (task) trackTaskCompleted(task);
      }
      
      return updatedTask;
    } catch (err) {
      console.error('Error toggling task completion:', err);
      throw err;
    }
  };

  // Move task to a different status (for drag and drop)
  const moveTask = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        await updateTask(taskId, { status: newStatus });
      }
    } catch (err) {
      console.error('Error moving task:', err);
      throw err;
    }
  };

  // Generate a smart schedule
  const generateSchedule = async (params = {}) => {
    try {
      const response = await api.generateSchedule(params);
      return response.data;
    } catch (err) {
      console.error('Error generating schedule:', err);
      throw err;
    }
  };

  // Reschedule a task
  const rescheduleTask = async (taskId, newTime, currentSchedule) => {
    try {
      const response = await api.rescheduleTask(taskId, newTime, currentSchedule);
      // Update the task with new schedule
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, dueDate: newTime } 
            : task
        )
      );
      return response.data;
    } catch (err) {
      console.error('Error rescheduling task:', err);
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        filters,
        setFilters,
        sortBy,
        setSortBy,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        moveTask,
        generateSchedule,
        rescheduleTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

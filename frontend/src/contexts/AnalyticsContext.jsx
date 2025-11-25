import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../utils/api';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);

  // Fetch analytics data when user logs in
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [dashboardRes, insightsRes] = await Promise.all([
          api.getDashboardMetrics(),
          api.getInsights()
        ]);
        
        setAnalytics(dashboardRes.data);
        setInsights(insightsRes.data.insights || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
    
    // Set up polling every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  // Track task completion
  const trackTaskCompleted = async (task) => {
    try {
      // Calculate XP based on task priority
      const xp = task.priority * 10 || 10;
      
      // Update local state optimistically
      setAnalytics(prev => ({
        ...prev,
        user_stats: {
          ...prev.user_stats,
          total_xp: (prev.user_stats.total_xp || 0) + xp,
          level: Math.floor(((prev.user_stats.total_xp || 0) + xp) / 1000) + 1,
          level_progress: ((prev.user_stats.total_xp || 0) + xp) % 1000 / 10,
          xp_to_next_level: 1000 - (((prev.user_stats.total_xp || 0) + xp) % 1000)
        },
        weekly_metrics: {
          ...prev.weekly_metrics,
          tasks_completed: (prev.weekly_metrics.tasks_completed || 0) + 1
        }
      }));
      
      // Send analytics event to backend
      await api.trackEvent({
        event_type: 'task_completed',
        task_id: task.id,
        xp_earned: xp,
        task_priority: task.priority
      });
      
    } catch (err) {
      console.error('Error tracking task completion:', err);
    }
  };

  // Track task creation
  const trackTaskCreated = async (task) => {
    try {
      await api.trackEvent({
        event_type: 'task_created',
        task_id: task.id,
        task_priority: task.priority,
        task_category: task.category
      });
    } catch (err) {
      console.error('Error tracking task creation:', err);
    }
  };

  // Track task update
  const trackTaskUpdated = async (taskId, updates) => {
    try {
      await api.trackEvent({
        event_type: 'task_updated',
        task_id: taskId,
        updates: Object.keys(updates)
      });
    } catch (err) {
      console.error('Error tracking task update:', err);
    }
  };

  // Track task deletion
  const trackTaskDeleted = async (taskId) => {
    try {
      await api.trackEvent({
        event_type: 'task_deleted',
        task_id: taskId
      });
    } catch (err) {
      console.error('Error tracking task deletion:', err);
    }
  };

  // Get user's current level and progress
  const getUserLevel = () => {
    if (!analytics) return { level: 1, progress: 0, xpToNextLevel: 1000 };
    
    return {
      level: analytics.user_stats.level || 1,
      progress: analytics.user_stats.level_progress || 0,
      xpToNextLevel: analytics.user_stats.xp_to_next_level || 1000,
      currentStreak: analytics.user_stats.current_streak || 0,
      bestStreak: analytics.user_stats.best_streak || 0
    };
  };

  // Get productivity metrics
  const getProductivityMetrics = async () => {
    try {
      const response = await api.getProductivityMetrics();
      return response.data;
    } catch (err) {
      console.error('Error fetching productivity metrics:', err);
      throw err;
    }
  };

  // Get heatmap data
  const getHeatmapData = async () => {
    try {
      const response = await api.getHeatmapData();
      return response.data;
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      throw err;
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        loading,
        error,
        insights,
        trackTaskCompleted,
        trackTaskCreated,
        trackTaskUpdated,
        trackTaskDeleted,
        getUserLevel,
        getProductivityMetrics,
        getHeatmapData,
        refreshAnalytics: () => {
          // This will trigger the useEffect to refetch data
          setAnalytics(null);
          setLoading(true);
        }
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

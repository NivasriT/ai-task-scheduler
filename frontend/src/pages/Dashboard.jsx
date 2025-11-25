import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import { 
  Task as TaskIcon, 
  CheckCircle as CheckCircleIcon, 
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { useTasks } from '../contexts/TaskContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (tasks) {
      const completed = tasks.filter(task => task.isCompleted).length;
      const total = tasks.length;
      const pending = total - completed;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      setStats({
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        completionRate: rate,
      });
    }
  }, [tasks]);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              backgroundColor: `${color}20`, 
              borderRadius: '50%', 
              width: 50, 
              height: 50, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            {React.cloneElement(icon, { style: { color, fontSize: 30 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickAction = ({ icon, title, description, buttonText, onClick, color }) => (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Box 
          sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: '50%', 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mr: 2
          }}
        >
          {React.cloneElement(icon, { style: { color, fontSize: 20 } })}
        </Box>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="body2" color="textSecondary" paragraph>
        {description}
      </Typography>
      <Box mt="auto">
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onClick}
          sx={{ color, borderColor: color, '&:hover': { borderColor: color } }}
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );

  if (tasksLoading || analyticsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back! Here's an overview of your tasks and progress.
        </Typography>
      </Box>
      
      {/* Stats Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Tasks" 
            value={stats.totalTasks} 
            icon={<TaskIcon />} 
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Completed" 
            value={stats.completedTasks} 
            icon={<CheckCircleIcon />} 
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="In Progress" 
            value={stats.pendingTasks} 
            icon={<TrendingUpIcon />} 
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Completion Rate" 
            value={`${stats.completionRate}%`} 
            icon={<StarIcon />} 
            color="#9c27b0"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <QuickAction
                icon={<TaskIcon />}
                title="Add New Task"
                description="Create a new task to organize your work and stay on track."
                buttonText="Create Task"
                onClick={() => navigate('/tasks/new')}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <QuickAction
                icon={<NotificationsActiveIcon />}
                title="Upcoming Deadlines"
                description="View and manage tasks with approaching deadlines."
                buttonText="View Tasks"
                onClick={() => navigate('/tasks?filter=upcoming')}
                color="#d32f2f"
              />
            </Grid>
          </Grid>
          
          {/* Recent Activity */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Paper>
              {analytics?.recentActivity?.length > 0 ? (
                <List>
                  {analytics.recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <TaskIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={activity.description}
                          secondary={new Date(activity.timestamp).toLocaleString()}
                        />
                      </ListItem>
                      {index < analytics.recentActivity.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box p={3} textAlign="center" color="text.secondary">
                  <Typography>No recent activity to display</Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>
        
        {/* Analytics Summary */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Your Progress</Typography>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Current Streak
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4" color="primary" sx={{ mr: 1 }}>
                {analytics?.user_stats?.current_streak || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                days
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Best streak: {analytics?.user_stats?.best_streak || 0} days
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Level {analytics?.user_stats?.level || 1}
            </Typography>
            <Box mb={1}>
              <Box 
                sx={{
                  width: '100%',
                  height: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{
                    width: `${analytics?.user_stats?.level_progress || 0}%`,
                    height: '100%',
                    background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="textSecondary">
                {analytics?.user_stats?.total_xp || 0} XP
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {analytics?.user_stats?.xp_to_next_level || 1000} XP to next level
              </Typography>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Weekly Goal
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="h5" sx={{ mr: 1 }}>
                {analytics?.weekly_metrics?.tasks_completed || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                of {analytics?.weekly_metrics?.goal || 10} tasks completed
              </Typography>
            </Box>
            <Box 
              sx={{
                width: '100%',
                height: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
                overflow: 'hidden',
                mb: 1
              }}
            >
              <Box 
                sx={{
                  width: `${Math.min(100, ((analytics?.weekly_metrics?.tasks_completed || 0) / (analytics?.weekly_metrics?.goal || 10)) * 100)}%`,
                  height: '100%',
                  backgroundColor: '#2e7d32',
                  borderRadius: 4,
                }}
              />
            </Box>
            <Typography variant="caption" color="textSecondary">
              {analytics?.weekly_metrics?.days_remaining || 7} days left in the week
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

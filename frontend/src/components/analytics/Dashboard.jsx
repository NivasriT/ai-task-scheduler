import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [productivityData, setProductivityData] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, heatmapRes, productivityRes, insightsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/heatmap'),
          api.get('/analytics/productivity'),
          api.get('/analytics/insights')
        ]);

        setDashboardData(dashboardRes.data.data);
        setHeatmapData(heatmapRes.data.data);
        setProductivityData(productivityRes.data.data);
        setInsights(insightsRes.data.insights);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) return null;

  // Prepare heatmap data for calendar
  const events = heatmapData
    .filter(day => day.count > 0)
    .map(day => ({
      title: `${day.count} ${day.count === 1 ? 'task' : 'tasks'}`,
      start: new Date(day.date),
      end: new Date(day.date),
      allDay: true,
      count: day.count
    }));

  // Prepare productivity chart data
  const productivityChartData = {
    labels: productivityData?.completion_trend.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Tasks Completed',
        data: productivityData?.completion_trend.map(d => d.completed) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)'
      }
    ]
  };

  // Prepare category distribution data
  const categoryData = {
    labels: productivityData?.category_distribution.map(d => d.category) || [],
    datasets: [
      {
        data: productivityData?.category_distribution.map(d => d.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Analytics Dashboard</Typography>
      
      {/* User Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Level {dashboardData.user_stats.level}</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Box width="100%" mr={1}>
                <Box 
                  bgcolor="primary.light" 
                  height={10} 
                  width={`${dashboardData.user_stats.level_progress}%`}
                  borderRadius={5}
                />
              </Box>
              <Typography variant="body2">{dashboardData.user_stats.level_progress}%</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" mt={1}>
              {dashboardData.user_stats.xp_to_next_level} XP to next level
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Current Streak</Typography>
            <Typography variant="h3" color="primary">
              {dashboardData.user_stats.current_streak} days
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Best: {dashboardData.user_stats.best_streak} days
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Weekly Completion</Typography>
            <Typography variant="h3" color="primary">
              {dashboardData.weekly_completion}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {dashboardData.today_tasks.filter(t => t.is_completed).length} of {dashboardData.today_tasks.length} tasks completed today
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Productivity Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Task Completion Trend</Typography>
            <Box height={300}>
              <Line 
                data={productivityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Tasks by Category</Typography>
            <Box height={300}>
              <Pie 
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Activity Heatmap */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, overflowX: 'auto' }}>
        <Typography variant="h6" gutterBottom>Activity Heatmap</Typography>
        <div style={{ height: 400 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ minWidth: 800 }}
            views={['month']}
            components={{
              event: ({ event }) => (
                <div style={{
                  backgroundColor: 'rgba(75, 192, 192, 0.8)',
                  color: 'white',
                  padding: '2px 5px',
                  borderRadius: 3,
                  fontSize: '0.8em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {event.title}
                </div>
              ),
            }}
          />
        </div>
      </Paper>
      
      {/* AI Insights */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>AI-Powered Insights</Typography>
        {insights.map((insight, index) => (
          <Box 
            key={index} 
            bgcolor="background.paper"
            p={2} 
            mb={1} 
            borderRadius={1}
            sx={{
              borderLeft: '4px solid',
              borderColor: 'primary.main'
            }}
          >
            <Typography>{insight}</Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default Dashboard;

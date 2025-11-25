import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { useAnalytics } from '../contexts/AnalyticsContext';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { analytics, loading } = useAnalytics();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    const range = event.target.value;
    setTimeRange(range);
    
    // Adjust start date based on selected range
    const today = new Date();
    switch (range) {
      case 'week':
        setStartDate(subDays(today, 7));
        break;
      case 'month':
        setStartDate(subDays(today, 30));
        break;
      case 'quarter':
        setStartDate(subDays(today, 90));
        break;
      case 'year':
        setStartDate(subDays(today, 365));
        break;
      default:
        break;
    }
    setEndDate(today);
  };
  
  // Format data for completion rate chart
  const getCompletionRateData = () => {
    if (!analytics?.completion_rates) return [];
    
    return Object.entries(analytics.completion_rates).map(([date, rate]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: Math.round(rate * 100)
    }));
  };
  
  // Format data for category distribution
  const getCategoryDistributionData = () => {
    if (!analytics?.category_distribution) return [];
    
    return Object.entries(analytics.category_distribution).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Format data for productivity trend
  const getProductivityTrendData = () => {
    if (!analytics?.productivity_trend) return [];
    
    return Object.entries(analytics.productivity_trend).map(([date, { completed, total }]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Tasks Completed': completed,
      'Total Tasks': total
    }));
  };
  
  // Format data for time of day analysis
  const getTimeOfDayData = () => {
    if (!analytics?.time_of_day) return [];
    
    return Object.entries(analytics.time_of_day).map(([hour, count]) => ({
      hour: `${hour}:00`,
      'Tasks Completed': count
    }));
  };
  
  // Calculate completion percentage
  const completionPercentage = analytics?.completion_rate 
    ? Math.round(analytics.completion_rate * 100) 
    : 0;
  
  // Calculate average tasks per day
  const avgTasksPerDay = analytics?.avg_tasks_per_day?.toFixed(1) || 0;
  
  // Calculate average completion time in hours
  const avgCompletionTime = analytics?.avg_completion_time 
    ? (analytics.avg_completion_time / 3600).toFixed(1) 
    : 0;
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics</Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          
          {timeRange === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box display="flex" gap={1}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </Box>
            </LocalizationProvider>
          )}
        </Box>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Productivity" value="productivity" />
          <Tab label="Categories" value="categories" />
          <Tab label="Time Analysis" value="time" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Grid container spacing={3}>
              {/* Completion Rate */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Completion Rate</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getCompletionRateData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Key Metrics */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Completion Rate
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="h3" color="primary">
                          {completionPercentage}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        of tasks completed
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Avg. Tasks/Day
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {avgTasksPerDay}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        tasks completed on average
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Avg. Completion Time
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {avgCompletionTime}h
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        per task
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Current Streak
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {analytics?.current_streak || 0} days
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {analytics?.current_streak === analytics?.longest_streak 
                          ? 'Your longest streak!' 
                          : `Best: ${analytics?.longest_streak || 0} days`}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Recent Activity */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getProductivityTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Tasks Completed" fill="#8884d8" />
                        <Bar dataKey="Total Tasks" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Productivity Tab */}
          {activeTab === 'productivity' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Productivity Trend</Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getProductivityTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Tasks Completed" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Total Tasks" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Completion Rate</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getCompletionRateData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Tasks by Day of Week</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.day_of_week || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" name="Tasks Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Tasks by Category</Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCategoryDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {getCategoryDistributionData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [
                          value,
                          props.payload.name
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Completion by Category</Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics?.category_completion || []}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                        <Bar dataKey="completion_rate" fill="#8884d8">
                          {analytics?.category_completion?.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Category Performance</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.category_performance || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="completed" name="Completed" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="average_time" name="Avg. Time (hours)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Time Analysis Tab */}
          {activeTab === 'time' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Time of Day Analysis</Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTimeOfDayData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Tasks Completed" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Task Duration Distribution</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.duration_distribution || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Number of Tasks" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Time Spent by Category</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.time_by_category || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="hours"
                          nameKey="category"
                          label={({ category, percent }) => 
                            `${category}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {analytics?.time_by_category?.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [
                          `${value} hours`,
                          props.payload.category
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Analytics;

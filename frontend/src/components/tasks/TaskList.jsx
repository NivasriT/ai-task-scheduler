import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Typography, 
  CircularProgress, 
  Alert,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useDrop } from 'react-dnd';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { useTasks } from '../../contexts/TaskContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';

const priorityOptions = [
  { value: 1, label: 'Low', color: 'success' },
  { value: 2, label: 'Medium', color: 'warning' },
  { value: 3, label: 'High', color: 'error' },
];

const categoryOptions = [
  { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' }
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const TaskList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { trackTaskCompleted } = useAnalytics();
  
  const { 
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
    moveTask
  } = useTasks();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Set up drag and drop
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        moveTask(item.id, dropResult.status);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  
  // Filter tasks based on search term and active tab
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter by search term
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by priority
      const matchesPriority = filters.priority ? task.priority === Number(filters.priority) : true;
      
      // Filter by category
      const matchesCategory = filters.category ? task.category === filters.category : true;
      
      // Filter by status
      const matchesStatus = filters.status ? task.status === filters.status : true;
      
      // Filter by active tab
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'completed' ? task.isCompleted :
        activeTab === 'active' ? !task.isCompleted :
        true;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesStatus && matchesTab;
    });
  }, [tasks, searchTerm, filters, activeTab]);
  
  // Sort tasks based on selected sort option
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return (a.dueDate ? new Date(a.dueDate) : new Date(0)) - (b.dueDate ? new Date(b.dueDate) : new Date(0));
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'dateCreated':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  }, [filteredTasks, sortBy]);
  
  // Count tasks by status for tabs
  const taskCounts = useMemo(() => {
    return {
      all: tasks.length,
      active: tasks.filter(task => !task.isCompleted).length,
      completed: tasks.filter(task => task.isCompleted).length,
    };
  }, [tasks]);
  
  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  
  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };
  
  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      await toggleComplete(taskId, isCompleted);
      
      // Track task completion in analytics
      if (isCompleted) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          trackTaskCompleted(task);
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };
  
  const handleClearFilters = () => {
    setFilters({
      status: null,
      priority: null,
      category: null,
    });
    setSearchTerm('');
    setActiveTab('all');
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    searchTerm || 
    filters.status || 
    filters.priority || 
    filters.category ||
    activeTab !== 'all';
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Error loading tasks: {error.message}</Alert>
      </Box>
    );
  }
  
  return (
    <Box ref={drop}>
      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 64, zIndex: 1, boxShadow: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value || null })}
              label="Priority"
            >
              <MenuItem value="">All Priorities</MenuItem>
              {priorityOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Box display="flex" alignItems="center">
                    <Badge color={option.color} variant="dot" sx={{ mr: 1 }} />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || null })}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categoryOptions.map(category => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
              label="Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150, ml: 'auto' }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="dateCreated">Date Created</MenuItem>
            </Select>
          </FormControl>
          
          {hasActiveFilters && (
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
              color="inherit"
            >
              Clear Filters
            </Button>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            sx={{ ml: 'auto' }}
          >
            {isMobile ? 'Add' : 'Add Task'}
          </Button>
        </Box>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                All
                <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                  ({taskCounts.all})
                </Box>
              </Box>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                Active
                <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                  ({taskCounts.active})
                </Box>
              </Box>
            } 
            value="active" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                Completed
                <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                  ({taskCounts.completed})
                </Box>
              </Box>
            } 
            value="completed" 
          />
        </Tabs>
      </Box>
      
      {/* Task List */}
      <Paper 
        sx={{ 
          p: 2, 
          minHeight: 400,
          bgcolor: isOver ? 'action.hover' : 'background.paper',
          transition: 'background-color 0.2s',
        }}
      >
        {sortedTasks.length > 0 ? (
          <List disablePadding>
            {sortedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </List>
        ) : (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            p={4} 
            minHeight={300}
            textAlign="center"
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No tasks found
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {hasActiveFilters 
                ? 'Try adjusting your filters or search term.'
                : 'Get started by creating your first task.'}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
              sx={{ mt: 1 }}
            >
              Create Task
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Task Form Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {editingTask ? 'Edit Task' : 'Create New Task'}
          <IconButton 
            onClick={() => {
              setIsFormOpen(false);
              setEditingTask(null);
            }}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <TaskForm 
            task={editingTask} 
            onSuccess={editingTask ? handleUpdateTask : handleCreateTask} 
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTask(null);
            }} 
            categories={categoryOptions}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TaskList;

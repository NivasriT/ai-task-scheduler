import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  IconButton, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Paper,
  Tabs,
  Tab,
  Badge,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks } from '../contexts/TaskContext';

const Tasks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    tasks, 
    loading, 
    filters, 
    setFilters, 
    sortBy, 
    setSortBy 
  } = useTasks();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter tasks based on search term and active tab
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'completed' ? task.isCompleted :
      activeTab === 'pending' ? !task.isCompleted :
      true;
    
    return matchesSearch && matchesTab;
  });
  
  // Count tasks by status for tabs
  const taskCounts = {
    all: tasks.length,
    completed: tasks.filter(task => task.isCompleted).length,
    pending: tasks.filter(task => !task.isCompleted).length,
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };
  
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: null,
      priority: null,
      category: null,
    });
    setSortBy('dueDate');
    setActiveTab('all');
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    searchTerm || 
    filters.status || 
    filters.priority || 
    filters.category ||
    activeTab !== 'all';
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tasks</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateTask}
        >
          {isMobile ? 'Add' : 'Add Task'}
        </Button>
      </Box>
      
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
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
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value || null })}
              label="Priority"
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value={1}>Low</MenuItem>
              <MenuItem value={2}>Medium</MenuItem>
              <MenuItem value={3}>High</MenuItem>
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
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="shopping">Shopping</MenuItem>
              <MenuItem value="health">Health</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
            </Select>
          </FormControl>
          
          {hasActiveFilters && (
            <Button 
              size="small" 
              onClick={handleClearFilters}
              startIcon={<FilterListIcon />}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Task Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="task tabs"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
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
                Pending
                <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                  ({taskCounts.pending})
                </Box>
              </Box>
            } 
            value="pending" 
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
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredTasks.length > 0 ? (
        <TaskList 
          tasks={filteredTasks} 
          onEdit={handleEditTask} 
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {hasActiveFilters 
              ? 'Try adjusting your filters or search term.'
              : 'Get started by creating a new task.'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateTask}
            sx={{ mt: 2 }}
          >
            Create Task
          </Button>
        </Paper>
      )}
      
      {/* Task Form Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <TaskForm 
            task={editingTask} 
            onSuccess={handleFormClose} 
            onCancel={handleFormClose} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Tasks;

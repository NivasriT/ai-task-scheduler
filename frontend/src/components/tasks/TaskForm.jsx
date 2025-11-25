import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  IconButton,
  Typography,
  Divider,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Label as LabelIcon,
  Close as CloseIcon,
  Add as AddIcon,
  TextFields as TextFieldsIcon,
  Description as DescriptionIcon,
  LowPriority as LowPriorityIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';

const priorityOptions = [
  { value: 1, label: 'Low', icon: <LowPriorityIcon /> },
  { value: 2, label: 'Medium', icon: <FlagIcon /> },
  { value: 3, label: 'High', icon: <PriorityHighIcon /> },
];

export const TaskForm = ({ 
  initialValues, 
  onSubmit, 
  onCancel, 
  categories = [],
  loading = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    priority: initialValues.priority || 2,
    category: initialValues.category || '',
    dueDate: initialValues.dueDate ? parseISO(initialValues.dueDate) : null,
    estimatedDuration: initialValues.estimatedDuration || 30,
  });
  
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.priority < 1 || formData.priority > 3) {
      newErrors.priority = 'Invalid priority';
    }
    
    if (formData.estimatedDuration < 1) {
      newErrors.estimatedDuration = 'Duration must be at least 1 minute';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Convert date to ISO string if it exists
      const submissionData = {
        ...formData,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null
      };
      onSubmit(submissionData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {/* Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            variant="outlined"
            required
            InputProps={{
              startAdornment: (
                <TextFieldsIcon 
                  color="action" 
                  sx={{ mr: 1, color: 'text.secondary' }} 
                />
              ),
            }}
          />
        </Grid>
        
        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <DescriptionIcon 
                  color="action" 
                  sx={{ 
                    mr: 1, 
                    color: 'text.secondary',
                    alignSelf: 'flex-start',
                    mt: 1
                  }} 
                />
              ),
            }}
          />
        </Grid>
        
        <Grid item container spacing={2}>
          {/* Priority */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth error={!!errors.priority}>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
                startAdornment={
                  <FlagIcon 
                    color="action" 
                    sx={{ mr: 1, color: 'text.secondary' }} 
                  />
                }
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center">
                      {React.cloneElement(option.icon, { 
                        sx: { 
                          mr: 1,
                          color: option.value === 1 ? 'success.main' : 
                                option.value === 2 ? 'warning.main' : 'error.main'
                        } 
                      })}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.priority && (
                <FormHelperText>{errors.priority}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Category */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                startAdornment={
                  <LabelIcon 
                    color="action" 
                    sx={{ mr: 1, color: 'text.secondary' }} 
                  />
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Due Date */}
          <Grid item xs={12} sm={6} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <TodayIcon 
                          color="action" 
                          sx={{ mr: 1, color: 'text.secondary' }} 
                        />
                      ),
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Estimated Duration */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Estimated Duration (minutes)"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              error={!!errors.estimatedDuration}
              helperText={errors.estimatedDuration}
              InputProps={{
                startAdornment: (
                  <ScheduleIcon 
                    color="action" 
                    sx={{ mr: 1, color: 'text.secondary' }} 
                  />
                ),
                endAdornment: <span style={{ marginLeft: 8 }}>minutes</span>,
                inputProps: { min: 1, step: 5 }
              }}
            />
          </Grid>
        </Grid>
        
        {/* Form Actions */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onCancel}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Task'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

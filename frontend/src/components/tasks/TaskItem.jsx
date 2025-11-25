import React from 'react';
import { 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useDrag } from 'react-dnd';

const priorityColors = {
  1: 'success',
  2: 'warning',
  3: 'error'
};

const priorityLabels = {
  1: 'Low',
  2: 'Medium',
  3: 'High'
};

export const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const theme = useTheme();
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  const handleToggleComplete = () => {
    onToggleComplete(task.id, !task.isCompleted);
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task.id);
  };
  
  return (
    <ListItem 
      ref={drag}
      button
      onClick={handleToggleComplete}
      sx={{
        mb: 1,
        borderRadius: 1,
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        opacity: isDragging ? 0.5 : 1,
        boxShadow: 1,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
        },
        textDecoration: task.isCompleted ? 'line-through' : 'none',
        color: task.isCompleted ? 'text.secondary' : 'text.primary',
      }}
    >
      <Checkbox
        edge="start"
        checked={task.isCompleted}
        tabIndex={-1}
        disableRipple
        onClick={(e) => e.stopPropagation()}
        onChange={handleToggleComplete}
      />
      
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" flexWrap="wrap">
            <Typography 
              variant="subtitle1" 
              component="span"
              sx={{
                mr: 1,
                textDecoration: task.isCompleted ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </Typography>
            
            {task.priority > 1 && (
              <Chip
                size="small"
                icon={<FlagIcon fontSize="small" />}
                label={priorityLabels[task.priority]}
                color={priorityColors[task.priority]}
                variant="outlined"
                sx={{ 
                  mr: 1,
                  '& .MuiChip-icon': {
                    color: `${priorityColors[task.priority]}.main`,
                  },
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
            )}
            
            {task.category && (
              <Chip
                size="small"
                icon={<LabelIcon fontSize="small" />}
                label={task.category}
                variant="outlined"
                sx={{ 
                  mr: 1,
                  color: 'text.secondary',
                  '& .MuiChip-icon': {
                    color: 'text.secondary',
                  },
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
            )}
          </Box>
        }
        secondary={
          <Box component="span" display="flex" flexDirection="column" mt={0.5}>
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {task.description}
              </Typography>
            )}
            
            <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
              {task.dueDate && (
                <Box display="flex" alignItems="center" color="text.secondary">
                  <TodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              )}
              
              {task.estimatedDuration && (
                <Box display="flex" alignItems="center" color="text.secondary">
                  <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {task.estimatedDuration} min
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={handleEdit} size="small" sx={{ mr: 0.5 }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton edge="end" onClick={handleDelete} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

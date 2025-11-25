import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
        p={3}
      >
        <Box 
          component={Paper} 
          elevation={3} 
          p={isMobile ? 3 : 6}
          sx={{
            borderRadius: 4,
            maxWidth: 600,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: 'linear-gradient(90deg, #1976d2 0%, #21CBF3 100%)',
            }
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              borderRadius: '50%',
              p: 2,
              mb: 3,
              backgroundColor: 'error.light',
              color: 'error.contrastText',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 60 }} />
          </Box>
          
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1976d2 0%, #21CBF3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              mb: 2
            }}
          >
            Oops! Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            color="textSecondary" 
            paragraph
            sx={{ 
              maxWidth: 500,
              mx: 'auto',
              mb: 4
            }}
          >
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </Typography>
          
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Back to Homepage
          </Button>
          
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              component={RouterLink}
              to="/tasks"
              variant="outlined"
              color="primary"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              View Tasks
            </Button>
            
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="outlined"
              color="primary"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Box>
        
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            Need help?{' '}
            <RouterLink 
              to="/contact" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Contact Support
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;

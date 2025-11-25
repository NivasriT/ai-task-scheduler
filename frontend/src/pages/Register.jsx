import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Link, 
  Divider, 
  IconButton, 
  InputAdornment,
  Alert,
  Checkbox,
  FormControlLabel,
  Grid
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (!acceptedTerms) {
      return setError('You must accept the terms and conditions');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.username);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to create an account: ' + (err.message || 'Please try again'));
      setLoading(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to sign up with Google: ' + err.message);
      setLoading(false);
    }
  };
  
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      p={2}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 500,
          borderRadius: 2
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create an Account
          </Typography>
          <Typography color="textSecondary">
            Join us today and boost your productivity
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleSignUp}
          disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{
            mb: 3,
            py: 1.5,
            textTransform: 'none',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'text.primary',
            },
          }}
        >
          Sign up with Google
        </Button>
        
        <Box display="flex" alignItems="center" mb={3}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="textSecondary" px={2}>
            OR
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="username"
                type="text"
                fullWidth
                margin="normal"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="At least 8 characters"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={acceptedTerms} 
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="#" color="primary" underline="hover">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" color="primary" underline="hover">
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mt: 2, mb: 2 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || !acceptedTerms}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
                color="primary"
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;

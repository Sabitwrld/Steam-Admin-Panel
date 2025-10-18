import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '@mui/material/Avatar';
import axiosInstance from '../api/axiosInstance';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginAction, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await axiosInstance.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            if (user && user.roles && user.roles.includes('Admin')) {
                // Set authorization header for future requests
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Use AuthContext to handle login
                const result = await loginAction({ token, user });
                
                if (result.success) {
                    navigate('/', { replace: true });
                } else {
                    setError('Giriş zamanı xəta baş verdi.');
                }
            } else {
                setError('Yalnız adminlər daxil ola bilər.');
            }
        } catch (err) {
            setError('E-poçt və ya şifrə yanlışdır.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                            <LoginIcon />
                        </Avatar>
                        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
                            Welcome to Steam Admin
                        </Typography>
                        
                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        
                        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                            
                            <Box textAlign="center" sx={{ mt: 2 }}>
                                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                    <Typography variant="body2" color="primary">
                                        Forgot your password?
                                    </Typography>
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;
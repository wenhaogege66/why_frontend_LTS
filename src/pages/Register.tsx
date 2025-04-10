import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Divider,
    IconButton,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { userApi } from '../api/user';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.nickname || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            const response = await userApi.register(formData);
            console.log('Registration success:', response);
            setSuccess(true);
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100vw',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                p: 0,
                m: 0,
                overflow: 'hidden'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 500 }}>
                    欢迎来到 WHY Music
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
                    创建您的账号
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        注册成功！请检查您的邮箱进行验证。
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="昵称"
                            name="nickname"
                            variant="outlined"
                            margin="normal"
                            value={formData.nickname}
                            onChange={handleChange}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiInputBase-input': { padding: '12px 14px' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="邮箱"
                            name="email"
                            variant="outlined"
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiInputBase-input': { padding: '12px 14px' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="密码"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiInputBase-input': { padding: '12px 14px' }
                            }}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                borderRadius: 2,
                                background: 'linear-gradient(45deg, #4285F4 0%, #34A853 100%)',
                                '&:hover': { opacity: 0.9 }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : '注册'}
                        </Button>
                    </form>
                )}

                <Divider sx={{ my: 3, color: 'text.secondary' }}>已有账号？</Divider>

                <Button
                    fullWidth
                    variant="contained"
                    href="/login"
                    sx={{
                        mb: 3,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(20deg, #920FA5 0%, #3FFFEF 100%)',
                        '&:hover': { opacity: 0.9 }
                    }}
                >
                    前往登录
                </Button>
            </Paper>
        </Box>
    );
};

export default Register;
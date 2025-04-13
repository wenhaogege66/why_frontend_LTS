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
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { userApi } from '../api/user';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        try {
            const response = await userApi.login({ email, password });
            if (response.code === 0) {
                navigate('/');
            } else {
                setError(response.message || '登录失败');
            }
        } catch (error) {
            setError('登录失败，请检查网络连接');
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
                    登录您的账号
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="邮箱"
                        variant="outlined"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                            '& .MuiInputBase-input': { padding: '12px 14px' }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="密码"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                        sx={{
                            mt: 3,
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #4285F4 0%, #34A853 100%)',
                            '&:hover': { opacity: 0.9 }
                        }}
                    >
                        登录
                    </Button>
                </form>

                <Divider sx={{ my: 3, color: 'text.secondary' }}>或者</Divider>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                        mb: 3,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(20deg, #920FA5 0%, #3FFFEF 100%)',
                        '&:hover': { opacity: 0.9 }
                    }}
                >
                    注册新账号
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;
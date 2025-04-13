import { useState} from 'react';
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
            const response = await userApi.login({email, password});
            if (response.code === 0) {
                navigate('/');
            } else {
                setError(response.message || '登录失败');
            }
        } catch (error) {
            setError('登录失败，请检查网络连接');
        }
    };

    const ColorfulWaveBackground = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)'
        }}>
            <svg
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                viewBox="0 0 1000 200"
                style={{ opacity: 0.5 }}
            >
                <path
                    d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100"
                    stroke="#ab47bc"
                    strokeWidth="2"
                    fill="none"
                />
                <path
                    d="M0,120 C150,220 350,20 500,120 C650,220 850,20 1000,120"
                    stroke="#7e57c2"
                    strokeWidth="2"
                    fill="none"
                />
                <path
                    d="M0,80 C150,180 350,-20 500,80 C650,180 850,-20 1000,80"
                    stroke="#42a5f5"
                    strokeWidth="2"
                    fill="none"
                />
            </svg>
        </div>
    );

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100vw',
                position: 'relative', // 关键：设置相对定位
                p: 0,
                m: 0,
                overflow: 'hidden',
            }}
        >
            <ColorfulWaveBackground />

            {/*表单*/}
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: "1px solid rgba(255, 255, 255, 0.1)", // 浅色边框
                    zIndex: 1,
                    position: 'relative',
                }}
            >
                <Typography variant="h4" align="center" gutterBottom
                            sx={{ fontWeight: 400, fontFamily: 'Huawenxinwei'}}
                >
                    欢迎来到 <span className="en"></span>
                </Typography>

                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 500,
                        fontFamily: 'ransom',
                        background: 'linear-gradient(90deg, #ff00ff, #ff0066, #6600ff, #00ccff, #6600ff, #ff0066)',
                        backgroundSize: '600% 100%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        animation: 'rainbow 6s linear infinite',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)', // 添加轻微阴影提升立体感
                        '@keyframes rainbow': {
                            '0%': { backgroundPosition: '0% 50%' },
                            '100%': { backgroundPosition: '100% 50%' },
                        },
                    }}
                >
                    WHY Music
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
                        InputProps={{
                            sx: {
                            "&:hover fieldset": { borderColor: "#AFD2E9 !important" }, // 霓虹色悬浮
                            "&.Mui-focused fieldset": { borderWidth: "2px" },
                            }
                        }}
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
                            sx: {
                                "&:hover fieldset": { borderColor: "#AFD2E9 !important" }, // 霓虹色悬浮
                                "&.Mui-focused fieldset": { borderWidth: "2px" },
                            }
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
                            '&:hover': { opacity: 0.9 },
                        }}
                    >
                        登录
                    </Button>
                </form>

                <Divider sx={{ my: 3, color: 'text.secondary' }}>或</Divider>

                <Typography
                    sx={{
                        textAlign: 'center',
                        '& > span': { // 对内部的 span 添加样式
                            color: '#0f73a5',
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        },
                        transition: "transform 0.3s",
                        "&:hover": { transform: "scale(1.05)" },
                    }}
                >
                    还没有账号？
                    <span onClick={() => navigate('/register')}>注册</span>
                </Typography>
            </Paper>
        </Box>
    );
};

export default Login;
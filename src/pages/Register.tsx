import {useEffect, useState} from 'react';
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
    Alert,
    LinearProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { userApi } from '../api/user';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const getStrengthColor = (strength: number) => {
        if (strength < 30) return 'error';
        if (strength < 70) return 'warning';
        return 'success';
    };

    // Password strength checker function
    const checkPasswordStrength = (password: string) => {
        if (!password) return 0;

        let strength = 0;

        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        // Character variety checks
        if (/[A-Z]/.test(password)) strength += 1; // Uppercase
        if (/[a-z]/.test(password)) strength += 1; // Lowercase
        if (/[0-9]/.test(password)) strength += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special chars

        // Normalize to 0-100 scale
        return Math.min(Math.floor((strength / 7) * 100), 100);
    };
    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(formData.password));
    }, [formData.password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 验证表单
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.nickname) {
            setError('请填写所有必填字段');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (formData.password.length < 6) {
            setError('密码长度至少为6位');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('请输入有效的邮箱地址');
            return;
        }

        try {
            const response = await userApi.register(formData);
            setLoading(true);
            if (response.code === 200) {
                setSuccess('注册成功！');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                // 如果 HTTP 是 2xx 但业务 code 不是 200 (虽然你的后端设计里这种情况不明确)
                setError(response.message || '注册失败，请检查提交信息');
            }
        } catch (err: any) { // 使用 any 或更具体的错误类型
            console.error("注册 API 调用失败:", err); // 在开发中打印完整错误以供调试
            if (err.response && err.response.data && err.response.data.message) {
                // 尝试从 axios 错误对象中提取后端返回的 message
                let errorMessage = err.response.data.message;
                // (可选) 尝试附加更详细的错误信息
                if (err.response.data.errors) {

                    const errorDetails = Object.values(err.response.data.errors)
                        .map((fieldErrors: any) => fieldErrors[0]) // 取每个字段的第一个错误
                        .join('; ');
                    errorMessage += `: ${errorDetails}`;
                }
                setError(errorMessage);
            } else if (err.message) {
                // 如果没有 response 对象，可能是网络错误或其他客户端错误
                setError(`注册请求失败: ${err.message}`);
            } else {
                // 最后的回退方案
                setError('注册失败，请稍后重试');
            }
        } finally {
            setLoading(false); // 确保 loading 总是被关闭
        }
    }

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
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                p: 0,
                m: 0,
                overflow: 'hidden'
            }}
        >
            <ColorfulWaveBackground />
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: 500,
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                }}
            >
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
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                    创建您的账号
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        注册成功！正在跳转到登录页面...
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
                            required
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
                            required
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

                        {/*密码强度条*/}
                        {formData.password && (
                            <Box sx={{ mt: 1, mb: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={passwordStrength}
                                    color={getStrengthColor(passwordStrength)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        mb: 1
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    密码强度: {passwordStrength < 30 ? '弱' :
                                    passwordStrength < 70 ? '中等' : '强'}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    建议使用6位以上字符，包含大小写字母、数字和特殊符号
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            label="确认密码"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                            disabled={loading}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                borderRadius: 2,
                                background: 'linear-gradient(20deg, #920FA5 0%, #3FFFEF 100%)',
                                '&:hover': { opacity: 0.9 }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : '注册'}
                        </Button>
                    </form>
                )}

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
                    }}
                >
                    已有帐号？
                    <span onClick={() => navigate('/login')}>前往登录</span>
                </Typography>
            </Paper>
        </Box>
    );
};

export default Register;
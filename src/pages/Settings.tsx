import React, {useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Paper,
    IconButton,
    InputAdornment,
    AppBar,
    Grid,
    Alert,
    Collapse,
    LinearProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    ArrowBack, Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.tsx';
import { userApi } from '../api/user';

interface UserProfile {
    nickname: string;
    email: string;
    avatar_url: string;
    // 其他可能的字段
}
const Settings = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    //@ts-ignore
    const [loading, setLoading] = useState({
        profile: true,
        updating: false,
        changingPassword: false
    });
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 用户信息状态
    const [userInfo, setUserInfo] = useState({
        nickname: '',
        avatar_url: '',
        email:'',
    });

    // 密码修改状态 - 添加 currentPassword
    const [passwordInfo, setPasswordInfo] = useState({
        currentPassword: '', // <--- 新增当前密码字段
        newPassword: '',
        confirmPassword: ''
    });

    // 密码可见性状态 - 添加 current
    const [showPassword, setShowPassword] = useState({
        current: false, // <--- 新增当前密码可见性
        new: false,
        confirm: false
    });

    // 头像文件状态
    // @ts-ignore
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    // @ts-ignore
    const [avatarPreview, setAvatarPreview] = useState<string | null>();
    // 在Settings组件顶部添加测试URL
    const TEST_AVATAR_URL = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9Im9iamVjdCIgdmlld0JveD0iMCAwIDMyIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojOTZkN2ZmO30uY2xzLTJ7ZmlsbDojODZjM2VmO30uY2xzLTN7ZmlsbDojYmY5ZTk5O30uY2xzLTR7ZmlsbDojZmY5Nzk3O30uY2xzLTV7ZmlsbDojZTQ3OTc5O30uY2xzLTZ7ZmlsbDojZWNjNWI0O30uY2xzLTd7ZmlsbDojZjRkYWI3O30uY2xzLTh7ZmlsbDojZDZiNWIwO308L3N0eWxlPjwvZGVmcz48dGl0bGUvPjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0yLjM1LDE3QTE1LDE1LDAsMCwxLDI1LjU5LDQuNDhhMTUsMTUsMCwxLDAtMTcuODMsMjRBMTUsMTUsMCwwLDEsMi4zNSwxN1oiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik0xNiw2LjA5YTcuMzEsNy4zMSwwLDAsMC03LjMsNy4zdjE1LjFhMSwxLDAsMCwwLC41NS44OSwxNC44NywxNC44NywwLDAsMCwxMy41LDAsMSwxLDAsMCwwLC41NS0uODlWMTMuMzlBNy4zMSw3LjMxLDAsMCwwLDE2LDYuMDlaIi8+PHBhdGggY2xhc3M9ImNscy00IiBkPSJNMTYsMzFhMTQuODgsMTQuODgsMCwwLDAsMTAuMDktMy45NC42Mi42MiwwLDAsMCwwLS4yMyw2LjY1LDYuNjUsMCwwLDAtNi4zLTQuNTRoLTcuNUE2LjY1LDYuNjUsMCwwLDAsNiwyNi44M2EuNjIuNjIsMCwwLDAsMCwuMjNBMTQuODgsMTQuODgsMCwwLDAsMTYsMzFaIi8+PHBhdGggY2xhc3M9ImNscy01IiBkPSJNNi41MSwyNy4zOWE2LjY3LDYuNjcsMCwwLDEsNi4zLTQuNTRoNy41MWE2LjYyLDYuNjIsMCwwLDEsNC4zOCwxLjY4LDYuNjUsNi42NSwwLDAsMC00Ljk1LTIuMjRoLTcuNUE2LjY1LDYuNjUsMCwwLDAsNiwyNi44M2EuNjIuNjIsMCwwLDAsMCwuMjNjLjE4LjE3LjM4LjMyLjU3LjQ4QS44LjgsMCwwLDEsNi41MSwyNy4zOVoiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik0xOC43LDE1LjgzSDEzLjNhMSwxLDAsMCwwLTEsMVYyMy4zYTEsMSwwLDAsMCwuNDUuODNsMi43LDEuOGExLDEsMCwwLDAsMS4xLDBsMi43LTEuOGExLDEsMCwwLDAsLjQ1LS44M1YxNi44M0ExLDEsMCwwLDAsMTguNywxNS44M1oiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik0yMS41LDEyLjc3aC0xMWEzLDMsMCwwLDAsMCw2aDExYTMsMywwLDAsMCwwLTZaIi8+PHBhdGggY2xhc3M9ImNscy03IiBkPSJNMTguNDYsOUgxMy41NGEzLjQ5LDMuNDksMCwwLDAtMy40OSwzLjQ5djMuMzZhNS45NSw1Ljk1LDAsMCwwLDExLjksMFYxMi40NkEzLjQ5LDMuNDksMCwwLDAsMTguNDYsOVoiLz48cGF0aCBjbGFzcz0iY2xzLTgiIGQ9Ik0yMy4yLDEyLjY2bC4wNiwwQTcuMjgsNy4yOCwwLDAsMCwxMi44OCw2LjhhMS4wOCwxLjA4LDAsMCwwLC4wNi43Nyw5Ljc1LDkuNzUsMCwwLDAsMi45NCwzLjU4LDguODQsOC44NCwwLDAsMCw1LjI4LDEuNzZBOSw5LDAsMCwwLDIzLjIsMTIuNjZaIi8+PHBhdGggY2xhc3M9ImNscy04IiBkPSJNMTksNi43NkE3LjI5LDcuMjksMCwwLDAsOC43LDEzLjM5di4zOWE3Ljg1LDcuODUsMCwwLDAsMS4xOS4wOSw5LjI2LDkuMjYsMCwwLDAsNy0zLjIxQTEwLjQ1LDEwLjQ1LDAsMCwwLDE5LDYuOFoiLz48L3N2Zz4=";

    // 初始化加载用户信息
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(prev => ({ ...prev, profile: true }));
                const response = await userApi.getProfile();
                if (response.code === 200) {
                    const data = response.data || response; // 适应可能的 API 响应结构

                    setProfile(data); // 假设 profile 状态期望 UserProfile 或 null
                    setUserInfo({
                    nickname: data.nickname ?? '',
                    avatar_url: data.avatar_url ?? '', // 保持一致性，也使用 ?? ''
                    email: data.email ?? '',
                    });
                }
            } catch (err: any) { // 捕获网络错误等
                 // 在 catch 中处理 API 调用本身的失败 (比如网络错误，或你的 userApi 配置了抛出非200错误)
                 let message = '获取用户信息失败';
                 if (err.response && err.response.data && err.response.data.message) {
                     message = err.response.data.message; // 尝试获取后端错误信息
                 } else if (err.message) {
                     message = err.message;
                 }
                 setError(message);
                 console.error("获取用户信息失败:", err);
            } finally {
                setLoading(prev => ({ ...prev, profile: false }));
            }
        };

        fetchProfile();
    }, []);

     // 新增: useEffect 用于自动清除成功消息
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(''); // 3秒后清空成功消息
            }, 3000); // 3000毫秒 = 3秒

            // 清理函数：如果 success 状态在计时器结束前再次改变，
            // 或者组件卸载，则清除旧的计时器
            return () => clearTimeout(timer);
        }
    }, [success]); // 依赖项是 success，当 success 变化时执行


    // 处理头像选择
    // const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files[0]) {
    //         const file = e.target.files[0];
    //         setAvatarFile(file);
    //
    //         // 创建预览URL
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setAvatarPreview(reader.result as string);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    // 处理用户信息更新
    const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    // 处理密码修改
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordInfo(prev => ({ ...prev, [name]: value }));

        // 计算新密码强度
        if (name === 'newPassword') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    // 提交用户信息更新
    const handleUserInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setLoading(prev => ({ ...prev, updating: true }));
            const updateData: { nickname?: string; avatar_url?: string } = {};

            // 确保比较的是处理过的 userInfo 值和 profile 里的原始值
            if (userInfo.nickname !== (profile?.nickname ?? '')) {
                updateData.nickname = userInfo.nickname;
            }
            // 注意：头像更新逻辑需要另外实现（上传文件，获取URL等）
            // if (avatarFile) { ... }

            if (Object.keys(updateData).length > 0) {
                const response = await userApi.updateProfile(updateData);

                if (response.code === 200) {
                    setSuccess('个人信息更新成功');
                    // 重新获取最新数据并确保转换 null/undefined
                    const freshProfileResponse = await userApi.getProfile();
                    if (freshProfileResponse.code === 200) {
                         const freshData = freshProfileResponse.data || freshProfileResponse;
                         setProfile(freshData); // 更新 profile state
                         setUserInfo({
                            nickname: freshData.nickname ?? '',
                            avatar_url: freshData.avatar_url ?? '',
                            email: freshData.email ?? '',
                        });
                    } else {
                         // 处理重新获取数据时的错误
                         setError(freshProfileResponse.message || '更新后获取信息失败');
                    }

                } else {
                    setError(response.message || '更新个人信息失败');
                }
            } else {
                 setSuccess('没有需要更新的信息'); // 或者不提示
            }
        } catch (err: any) {
             console.error("更新用户信息失败:", err);
             let message = '更新个人信息失败';
             if (err.response && err.response.data && err.response.data.message) {
                 message = err.response.data.message;
             } else if (err.message) {
                 message = err.message;
             }
             setError(message);
        } finally {
            setLoading(prev => ({ ...prev, updating: false }));
        }
    };

    // 提交密码修改
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 更新验证：检查所有三个密码字段
        if (!passwordInfo.currentPassword || !passwordInfo.newPassword || !passwordInfo.confirmPassword) {
            setError('请填写当前密码、新密码和确认密码'); // 更新错误信息
            return;
        }

        // 验证密码
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            setError('新密码与确认密码不匹配');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, changingPassword: true }));

            // 更新 API 调用：传递 password 和 new_password
            const response = await userApi.changePassword({
                password: passwordInfo.currentPassword,    // 当前密码
                new_password: passwordInfo.newPassword // 新密码 (字段名与后端要求一致)
            });

            if (response.code === 200) {
                setSuccess('密码修改成功');
                // 清空密码字段
                setPasswordInfo({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordStrength(0); // 重置密码强度指示
            }
        } catch (err: any) {
             console.error("修改密码失败:", err);
             let message = '修改密码失败';
             if (err.response && err.response.data && err.response.data.message) {
                 message = err.response.data.message;
             } else if (err.message) {
                 message = err.message;
             }
             setError(message);
        } finally {
            setLoading(prev => ({ ...prev, updating: false }));
        }
    };

    const handlePasswordVisibility = (field: keyof typeof showPassword) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // 在组件顶部添加密码强度计算函数
    const calculatePasswordStrength = (password: string) => {
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

    // 添加状态跟踪密码强度
    const [passwordStrength, setPasswordStrength] = useState(0);

    const getStrengthColor = (strength: number) => {
        if (strength < 30) return 'error';
        if (strength < 70) return 'warning';
        return 'success';
    };

    return (

        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden',
            pb: 7 // 为播放器留出空间
        }}>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <Box sx={{
                flexGrow: 1,
                bgcolor: '#f8f9fa',
                width: '100%',
                overflow: 'auto',
                height: '100vh'
            }}>
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        color: 'text.primary',
                        borderBottom: '1px solid #eee',
                    }}
                >
                {/* 顶部导航栏 - 与Home.tsx保持一致 */}
                <Box sx={{
                    bgcolor: 'white',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #eee'
                }}>
                    <IconButton
                        edge="start"
                        sx={{ mr: 2 }}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        账户设置
                    </Typography>
                </Box>
                </AppBar>


                {/* 主内容区域 - 两栏布局 */}
                <Box sx={{
                    maxWidth: 1200,
                    mx: 'auto',
                    my: 4,
                    p: { xs: 2, md: 4 }
                }}>

                    {/* ===== 新增/修改：显示成功或错误消息 ===== */}
                    <Collapse in={!!success}> {/* 使用 Collapse 实现平滑过渡 */}
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    </Collapse>
                    <Collapse in={!!error}>
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Collapse>


                    <Grid container spacing={4}>
                        {/* 第一栏 - 个人信息 */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                height: '100%',
                                borderRadius: 2,
                                bgcolor: 'white'
                            }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                                    个人信息
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar
                                        src={avatarPreview || TEST_AVATAR_URL}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mr: 3,
                                            bgcolor: 'primary.main'
                                        }}
                                    >
                                        {userInfo?.nickname}
                                    </Avatar>
                                    <Button variant="outlined" component="label">
                                        更改头像
                                        <input type="file" hidden accept="image/*" />
                                    </Button>
                                </Box>

                                <form onSubmit={handleUserInfoSubmit}>
                                    <TextField
                                        fullWidth
                                        label="昵称"
                                        name="nickname"
                                        value={userInfo.nickname}
                                        onChange={handleUserInfoChange}
                                        margin="normal"
                                        sx={{ mb: 2 }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="电子邮箱"
                                        name="email"
                                        value={userInfo.email}
                                        onChange={handleUserInfoChange}
                                        margin="normal"
                                        sx={{ mb: 3 }}
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            sx={{ px: 4 }}
                                        >
                                            保存更改
                                        </Button>
                                    </Box>

                                </form>
                            </Paper>
                        </Grid>

                        {/* 第二栏 - 密码修改 */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                height: '100%',
                                borderRadius: 2,
                                bgcolor: 'white'
                            }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                                    密码修改
                                </Typography>

                                <form onSubmit={handlePasswordSubmit}>

                                    {/* --- 新增：当前密码输入框 --- */}
                                <TextField
                                    fullWidth
                                    label="当前密码"
                                    name="currentPassword" // 对应 state 的 key
                                    type={showPassword.current ? 'text' : 'password'}
                                    value={passwordInfo.currentPassword}
                                    onChange={handlePasswordChange}
                                    margin="normal"
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => handlePasswordVisibility('current')}
                                                    edge="end"
                                                >
                                                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />


                                    <TextField
                                        fullWidth
                                        label="新密码"
                                        name="newPassword"
                                        type={showPassword.new ? 'text' : 'password'}
                                        value={passwordInfo.newPassword}
                                        onChange={handlePasswordChange}
                                        margin="normal"
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => handlePasswordVisibility('new')}
                                                        edge="end"
                                                    >
                                                        {showPassword.new ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    {/* 新增这个密码强度指示器 ↓ */}
                                    {passwordInfo.newPassword && (
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
                                        label="确认新密码"
                                        name="confirmPassword"
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        value={passwordInfo.confirmPassword}
                                        onChange={handlePasswordChange}
                                        margin="normal"
                                        sx={{ mb: 3 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => handlePasswordVisibility('confirm')}
                                                        edge="end"
                                                    >
                                                        {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            sx={{ px: 4 }}
                                        >
                                            更改密码
                                        </Button>
                                    </Box>
                                </form>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default Settings;
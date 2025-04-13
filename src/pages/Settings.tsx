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
    CircularProgress, Alert
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
    const [loading, setLoading] = useState({
        profile: true,
        updating: false,
        changingPassword: false
    });
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    //@ts-ignore
    const [success, setSuccess] = useState<string | null>(null);

    // 用户信息状态
    const [userInfo, setUserInfo] = useState({
        nickname: '',
        avatar_url: '',
        email:'',
    });

    // 密码修改状态
    const [passwordInfo, setPasswordInfo] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });

    // 头像文件状态
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>();
    // 在Settings组件顶部添加测试URL
    const TEST_AVATAR_URL = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9Im9iamVjdCIgdmlld0JveD0iMCAwIDMyIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojOTZkN2ZmO30uY2xzLTJ7ZmlsbDojODZjM2VmO30uY2xzLTN7ZmlsbDojYmY5ZTk5O30uY2xzLTR7ZmlsbDojZmY5Nzk3O30uY2xzLTV7ZmlsbDojZTQ3OTc5O30uY2xzLTZ7ZmlsbDojZWNjNWI0O30uY2xzLTd7ZmlsbDojZjRkYWI3O30uY2xzLTh7ZmlsbDojZDZiNWIwO308L3N0eWxlPjwvZGVmcz48dGl0bGUvPjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0yLjM1LDE3QTE1LDE1LDAsMCwxLDI1LjU5LDQuNDhhMTUsMTUsMCwxLDAtMTcuODMsMjRBMTUsMTUsMCwwLDEsMi4zNSwxN1oiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik0xNiw2LjA5YTcuMzEsNy4zMSwwLDAsMC03LjMsNy4zdjE1LjFhMSwxLDAsMCwwLC41NS44OSwxNC44NywxNC44NywwLDAsMCwxMy41LDAsMSwxLDAsMCwwLC41NS0uODlWMTMuMzlBNy4zMSw3LjMxLDAsMCwwLDE2LDYuMDlaIi8+PHBhdGggY2xhc3M9ImNscy00IiBkPSJNMTYsMzFhMTQuODgsMTQuODgsMCwwLDAsMTAuMDktMy45NC42Mi42MiwwLDAsMCwwLS4yMyw2LjY1LDYuNjUsMCwwLDAtNi4zLTQuNTRoLTcuNUE2LjY1LDYuNjUsMCwwLDAsNiwyNi44M2EuNjIuNjIsMCwwLDAsMCwuMjNBMTQuODgsMTQuODgsMCwwLDAsMTYsMzFaIi8+PHBhdGggY2xhc3M9ImNscy01IiBkPSJNNi41MSwyNy4zOWE2LjY3LDYuNjcsMCwwLDEsNi4zLTQuNTRoNy41MWE2LjYyLDYuNjIsMCwwLDEsNC4zOCwxLjY4LDYuNjUsNi42NSwwLDAsMC00Ljk1LTIuMjRoLTcuNUE2LjY1LDYuNjUsMCwwLDAsNiwyNi44M2EuNjIuNjIsMCwwLDAsMCwuMjNjLjE4LjE3LjM4LjMyLjU3LjQ4QS44LjgsMCwwLDEsNi41MSwyNy4zOVoiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik0xOC43LDE1LjgzSDEzLjNhMSwxLDAsMCwwLTEsMVYyMy4zYTEsMSwwLDAsMCwuNDUuODNsMi43LDEuOGExLDEsMCwwLDAsMS4xLDBsMi43LTEuOGExLDEsMCwwLDAsLjQ1LS44M1YxNi44M0ExLDEsMCwwLDAsMTguNywxNS44M1oiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik0yMS41LDEyLjc3aC0xMWEzLDMsMCwwLDAsMCw2aDExYTMsMywwLDAsMCwwLTZaIi8+PHBhdGggY2xhc3M9ImNscy03IiBkPSJNMTguNDYsOUgxMy41NGEzLjQ5LDMuNDksMCwwLDAtMy40OSwzLjQ5djMuMzZhNS45NSw1Ljk1LDAsMCwwLDExLjksMFYxMi40NkEzLjQ5LDMuNDksMCwwLDAsMTguNDYsOVoiLz48cGF0aCBjbGFzcz0iY2xzLTgiIGQ9Ik0yMy4yLDEyLjY2bC4wNiwwQTcuMjgsNy4yOCwwLDAsMCwxMi44OCw2LjhhMS4wOCwxLjA4LDAsMCwwLC4wNi43Nyw5Ljc1LDkuNzUsMCwwLDAsMi45NCwzLjU4LDguODQsOC44NCwwLDAsMCw1LjI4LDEuNzZBOSw5LDAsMCwwLDIzLjIsMTIuNjZaIi8+PHBhdGggY2xhc3M9ImNscy04IiBkPSJNMTksNi43NkE3LjI5LDcuMjksMCwwLDAsOC43LDEzLjM5di4zOWE3Ljg1LDcuODUsMCwwLDAsMS4xOS4wOSw5LjI2LDkuMjYsMCwwLDAsNy0zLjIxQTEwLjQ1LDEwLjQ1LDAsMCwwLDE5LDYuOFoiLz48L3N2Zz4=";

    // 初始化加载用户信息
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(prev => ({ ...prev, profile: true }));
                const data = await userApi.getProfile();
                setProfile(data);
                setUserInfo({
                    nickname: data.nickname,
                    avatar_url: data.avatar_url || '',
                    email: data.email,
                });
            } catch (err) {
                setError('获取用户信息失败');
                console.error(err);
            } finally {
                setLoading(prev => ({ ...prev, profile: false }));
            }
        };

        fetchProfile();
    }, []);

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
        setError(null);
        setSuccess(null);

        try {
            setLoading(prev => ({ ...prev, updating: true }));

            // 准备更新数据
            const updateData: { nickname?: string; avatar_url?: string } = {};

            if (userInfo.nickname !== profile?.nickname) {
                updateData.nickname = userInfo.nickname;
            }

            // 如果有新头像文件，这里应该先上传头像获取URL
            // 假设上传头像后会返回avatar_url
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                // 这里应该有上传头像的逻辑
                // updateData.avatar_url = await uploadAvatar(avatarFile);
                // 暂时模拟
                updateData.avatar_url = "https://example.com/new-avatar.jpg";
            }

            // 如果有需要更新的字段才发送请求
            if (Object.keys(updateData).length > 0) {
                const response = await userApi.updateProfile(updateData);

                if (response.code === 200) {
                    setSuccess('个人信息更新成功');
                    // 关键优化点：重新获取最新数据
                    const freshData = await userApi.getProfile();
                    setProfile(freshData);
                    setUserInfo({
                        nickname: freshData.nickname,
                        avatar_url: freshData.avatar_url || '',
                        email: freshData.email // 保持email同步
                    });
                } else {
                    setError(response.message || '更新失败');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, updating: false }));
        }
    };

    // 提交密码修改
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if(!passwordInfo.newPassword || !passwordInfo.confirmPassword) {
            setError('请填写所有必填字段');
            return;
        }
        // 验证密码
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            setError('新密码与确认密码不匹配');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, changingPassword: true }));

            const response = await userApi.changePassword({
                password: passwordInfo.newPassword
            });

            if (response.code === 200) {
                setSuccess('密码修改成功');
            }
            // 清空密码字段
            setPasswordInfo({
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError('修改密码失败');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, changingPassword: false }));
        }
    };

    const handlePasswordVisibility = (field: keyof typeof showPassword) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // 加载个人信息动画 调试时可注释
    if (loading && !profile) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,  // 确保在最上层
                backgroundColor: 'rgba(0, 0, 0, 0.1)'  // 可选背景遮罩
            }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    // 在组件顶部添加密码强度计算函数
    const calculatePasswordStrength = (password: string) => {
        let strength = 0;

        // 长度检查
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        // 包含数字
        if (/\d/.test(password)) strength += 1;

        // 包含特殊字符
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

        // 包含大小写字母
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;

        return Math.min(strength, 5); // 最大强度为5
    };

    // 添加状态跟踪密码强度
    const [passwordStrength, setPasswordStrength] = useState(0);

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
                    <IconButton
                        sx={{ mr: 2 }}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowBack />
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
                                        {userInfo?.nickname.charAt(0)}
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
                                    <Box sx={{ mb: 2, mt: -1 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            height: 4,
                                            bgcolor: '#eee',
                                            borderRadius: 2,
                                            overflow: 'hidden'
                                        }}>
                                            {[1,2,3,4,5].map((i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        flex: 1,
                                                        bgcolor: i <= passwordStrength ?
                                                            (passwordStrength <= 2 ? 'error.main' :
                                                                passwordStrength <= 4 ? 'warning.main' : 'success.main') : '#eee',
                                                        mr: i < 5 ? 0.5 : 0
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {passwordStrength <= 2 ? '弱' : passwordStrength <= 4 ? '中等' : '强'}
                                        </Typography>
                                    </Box>

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

                                    {error && (
                                        <Alert severity="error" sx={{ mt: 2 }}>
                                            {error}
                                        </Alert>
                                    )}
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
//猜你喜欢推荐页面
import {
    AppBar,
    Toolbar,
    IconButton,
    TextField,
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Container,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    Stack
} from '@mui/material';
import { 
    Search, 
    Menu as MenuIcon, 
    Notifications, 
    AccountCircle, 
    Login, 
    PersonAdd, 
    Logout, 
    MusicNote, 
    PlayArrow, 
    Pause, 
    Favorite, 
    FavoriteBorder, 
    Refresh,
    AutoAwesome,
    TrendingUp,
    Lightbulb,
    PersonalVideo,
    RotateLeft,
    RotateRight
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { guessYouLike } from '../api/search';
import { usePlayer, PlaylistType } from '../contexts/PlayerContext';

const RecommendPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [favoriteStates, setFavoriteStates] = useState<{ [key: number]: boolean }>({});
    const [currentOffset, setCurrentOffset] = useState(0);
    const { playerState, playSong } = usePlayer();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogin = () => {
        handleClose();
        navigate('/login');
    };

    const handleRegister = () => {
        handleClose();
        navigate('/register');
    };

    const handleLogout = () => {
        userApi.logout();
        navigate('/login');
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
            }
        }
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const fetchRecommendations = async (abortController?: AbortController) => {
        setLoading(true);
        setError(null);
        try {
            const response = await guessYouLike(abortController);
            // 检查请求是否被取消
            if (!abortController?.signal.aborted) {
                setRecommendations(response.data);
            }
        } catch (error: any) {
            // 如果是取消的请求，直接返回不处理
            if (error?.code === 'ERR_CANCELED') {
                return;
            }
            // 只有在请求未被取消时才设置错误
            if (!abortController?.signal.aborted) {
                console.error('获取推荐失败:', error);
                setError(error.message || '获取推荐失败，请稍后重试');
            }
        } finally {
            // 只有在请求未被取消时才设置loading为false
            if (!abortController?.signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();
        
        const fetchUserProfile = async () => {
            try {
                const response = await userApi.getProfile();
                if (response.code === 200 && isMounted) {
                    setUser(response.data);
                    // 获取用户信息后再获取推荐
                    if (isMounted) {
                        fetchRecommendations(abortController);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('获取用户信息失败:', error);
                    setError('请先登录以获取个性化推荐');
                }
            }
        };

        fetchUserProfile();

        // Cleanup函数
        return () => {
            isMounted = false;
            abortController.abort(); // 取消正在进行的请求
        };
    }, []);

    const handlePlaySong = (songId: number) => {
        const song = recommendations.find(s => s.id === songId);
        if (song) {
            // 创建推荐播放列表
            const recommendPlaylist = {
                type: PlaylistType.RECOMMEND,
                title: '猜你喜欢',
                songs: recommendations.map(s => ({
                    id: s.id,
                    name: s.name,
                    ar: s.ar || [{ name: '未知艺术家' }],
                    al: {
                        name: s.al?.name || '未知专辑',
                        picUrl: s.al?.picUrl || 'https://picsum.photos/300/300?random=' + s.id,
                        id: s.al?.id
                    }
                })),
                currentIndex: 0 // 这会在playSong中被正确设置
            };

            playSong(song, recommendPlaylist);
        }
    };

    const toggleFavorite = (song: any) => {
        setFavoriteStates(prev => ({
            ...prev,
            [song.id]: !prev[song.id]
        }));
    };

    const formatPublishTime = (timestamp: number) => {
        return new Date(timestamp).getFullYear();
    };

    // 旋转控制
    const rotateLeft = () => {
        setCurrentOffset(prev => prev + 1);
    };

    const rotateRight = () => {
        setCurrentOffset(prev => prev - 1);
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden',
            pb: 7
        }}>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <Box sx={{ 
                flexGrow: 1,
                bgcolor: '#f8f9fa',
                width: '100%',
                overflow: 'auto',
                height: '100vh',
                pb: 7
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
                    <Toolbar>
                        <IconButton 
                            edge="start" 
                            sx={{ mr: 2}}
                            onClick={() => setSidebarOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 500, fontFamily: 'ransom' }}>
                            WHY Music
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                variant="outlined"
                                placeholder="搜索歌曲或歌手..."
                                size="small"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onKeyDown={handleSearchKeyPress}
                                InputProps={{
                                    startAdornment: (
                                        <Search sx={{ color: 'action.active', mr: 1 }} />
                                    ),
                                }}
                                sx={{
                                    width: 400,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px 0 0 4px',
                                        '&:hover': {
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        py: 1,
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSearchSubmit}
                                sx={{
                                    minWidth: 'auto',
                                    height: '40px',
                                    borderRadius: '0 4px 4px 0',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                <Search />
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', ml: 2 }}>
                            <IconButton size="large">
                                <Notifications />
                            </IconButton>
                            <IconButton
                                onClick={handleMenu}
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                sx={{
                                    '& .MuiPaper-root': {
                                        borderRadius: 2,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        minWidth: 200
                                    }
                                }}
                            >
                                {user ? (
                                    <>
                                        <MenuItem onClick={handleClose}>
                                            <ListItemIcon>
                                                <AccountCircle fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>{user.nickname}</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon>
                                                <Logout fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>退出登录</ListItemText>
                                        </MenuItem>
                                    </>
                                ) : (
                                    <>
                                        <MenuItem onClick={handleLogin}>
                                            <ListItemIcon>
                                                <Login fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>登录</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={handleRegister}>
                                            <ListItemIcon>
                                                <PersonAdd fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>注册</ListItemText>
                                        </MenuItem>
                                    </>
                                )}
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {/* 页面头部 */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        width: 56, 
                                        height: 56, 
                                        mr: 2,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    }}
                                >
                                    <AutoAwesome sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                        猜你喜欢
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip 
                                            icon={<Lightbulb />} 
                                            label="AI智能推荐" 
                                            size="small" 
                                            color="primary" 
                                            variant="outlined"
                                        />
                                        <Chip 
                                            icon={<PersonalVideo />} 
                                            label="基于收藏偏好" 
                                            size="small" 
                                            color="secondary" 
                                            variant="outlined"
                                        />
                                    </Stack>
                                </Box>
                            </Box>
                            
                            <IconButton 
                                onClick={() => fetchRecommendations()}
                                disabled={loading}
                                sx={{ 
                                    color: 'primary.main',
                                    '&:hover': { 
                                        backgroundColor: 'primary.light', 
                                        color: 'white' 
                                    }
                                }}
                            >
                                <Refresh />
                            </IconButton>
                        </Box>
                        
                        <Typography variant="body1" color="text.secondary">
                            根据您的收藏偏好，为您精心挑选的音乐推荐
                        </Typography>
                    </Box>

                    {/* 内容区域 */}
                    {error ? (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 3 }}
                            action={
                                <Button 
                                    color="inherit" 
                                    size="small" 
                                    onClick={() => fetchRecommendations()}
                                >
                                    重试
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    ) : null}

                    {loading ? (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            minHeight: 400,
                            width: '100%',
                            py: 8
                        }}>
                            <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center', mb: 1 }}>
                                AI正在分析您的音乐偏好...
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center' }}>
                                正在为您挑选最合适的音乐
                            </Typography>
                        </Box>
                    ) : recommendations.length === 0 && !error ? (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            color: 'text.secondary'
                        }}>
                            <TrendingUp sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>暂无推荐内容</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>请先收藏一些喜欢的歌曲，我们会根据您的偏好进行推荐</Typography>
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate('/mood')}
                                sx={{ mt: 2 }}
                            >
                                去心情电台发现音乐
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mb: 3
                            }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        color: "text.primary",
                                    }}
                                >
                                    <MusicNote sx={{ mr: 1, color: "primary.main" }} />
                                    为您推荐
                                    <Chip 
                                        label={`${recommendations.length} 首歌曲`} 
                                        size="small" 
                                        sx={{ ml: 2 }}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Typography>
                            </Box>

                            {/* 3D圆桌式推荐展示 */}
                            <Box sx={{ 
                                position: 'relative', 
                                height: '700px', 
                                perspective: '1200px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {/* 左侧旋转按钮 */}
                                <IconButton
                                    onClick={rotateLeft}
                                    sx={{
                                        position: 'absolute',
                                        left: '10%',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 60,
                                        height: 60,
                                        bgcolor: 'white',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                        zIndex: 10,
                                        '&:hover': {
                                            transform: 'translateY(-50%) scale(1.1)',
                                            boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                                        }
                                    }}
                                >
                                    <RotateLeft sx={{ fontSize: '2rem', color: 'primary.main' }} />
                                </IconButton>

                                {/* 右侧旋转按钮 */}
                                <IconButton
                                    onClick={rotateRight}
                                    sx={{
                                        position: 'absolute',
                                        right: '10%',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 60,
                                        height: 60,
                                        bgcolor: 'white',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                        zIndex: 10,
                                        '&:hover': {
                                            transform: 'translateY(-50%) scale(1.1)',
                                            boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                                        }
                                    }}
                                >
                                    <RotateRight sx={{ fontSize: '2rem', color: 'primary.main' }} />
                                </IconButton>

                                {/* 3D圆桌容器 */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '600px',
                                        height: '600px',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    {recommendations.map((song, index) => {
                                        // 计算当前卡片在圆桌上的实际位置索引
                                        const currentPositionIndex = (index + currentOffset + recommendations.length) % recommendations.length;
                                        
                                        // 根据位置索引计算角度和坐标
                                        const angle = (360 / recommendations.length) * currentPositionIndex;
                                        const radius = 280;
                                        const x = Math.sin((angle * Math.PI) / 180) * radius;
                                        const z = Math.cos((angle * Math.PI) / 180) * radius;
                                        
                                        // 位置0（正前方）的卡片角度为0，其他位置的卡片面向中心
                                        const cardRotation = currentPositionIndex === 0 ? 0 : -angle;
                                        
                                        return (
                                            <Card
                                                key={song.id}
                                                sx={{
                                                    position: 'absolute',
                                                    width: '180px',
                                                    height: '280px',
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${cardRotation}deg)`,
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                                    border: playerState.currentSongId === song.id
                                                        ? "3px solid"
                                                        : "1px solid transparent",
                                                    borderColor: playerState.currentSongId === song.id
                                                        ? "primary.main"
                                                        : "transparent",
                                                    '&:hover': {
                                                        transform: `translate(-50%, -50%) translate3d(${x}px, -20px, ${z}px) rotateY(${cardRotation}deg) scale(1.1)`,
                                                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                                                        zIndex: 5,
                                                        '& .play-button': {
                                                            opacity: 1,
                                                            transform: 'translate(-50%, -50%) scale(1.2)'
                                                        }
                                                    }
                                                }}
                                                onClick={() => handlePlaySong(song.id)}
                                            >
                                                <Box sx={{ position: 'relative', height: '200px' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={song.al.picUrl}
                                                        alt={song.name}
                                                        sx={{
                                                            transition: 'transform 0.3s ease'
                                                        }}
                                                    />
                                                    
                                                    {/* 播放按钮 */}
                                                    <IconButton
                                                        className="play-button"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                                                            opacity: 0,
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                                            '&:hover': {
                                                                bgcolor: 'white',
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePlaySong(song.id);
                                                        }}
                                                    >
                                                        {playerState.currentSongId === song.id && playerState.isPlaying ? (
                                                            <Pause sx={{ color: 'primary.main', fontSize: '2rem' }} />
                                                        ) : (
                                                            <PlayArrow sx={{ color: 'primary.main', fontSize: '2rem' }} />
                                                        )}
                                                    </IconButton>

                                                    {/* 收藏按钮 */}
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: favoriteStates[song.id]
                                                                ? "error.main"
                                                                : "white",
                                                            backgroundColor: "rgba(0,0,0,0.3)",
                                                            backdropFilter: "blur(10px)",
                                                            "&:hover": {
                                                                backgroundColor: "rgba(0,0,0,0.5)",
                                                            },
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(song);
                                                        }}
                                                    >
                                                        {favoriteStates[song.id] ? (
                                                            <Favorite fontSize="small" />
                                                        ) : (
                                                            <FavoriteBorder fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </Box>
                                                
                                                {/* 歌曲信息 */}
                                                <CardContent sx={{ p: 1.5, height: '80px' }}>
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem',
                                                            lineHeight: 1.1,
                                                            mb: 0,
                                                            overflow: 'hidden',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            minHeight: '2.2em'
                                                        }}
                                                    >
                                                        {song.name}
                                                    </Typography>
                                                    
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            color: 'primary.main',
                                                            cursor: 'pointer',
                                                            display: 'block',
                                                            mt: -0.2,
                                                            mb: 0.1,
                                                            fontSize: '0.7rem',
                                                            lineHeight: 1.1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                    >
                                                        {song.ar.map((artist: any) => artist.name).join(', ')}
                                                    </Typography>
                                                    
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            color: 'text.secondary',
                                                            cursor: 'pointer',
                                                            fontSize: '0.65rem',
                                                            lineHeight: 1.1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                    >
                                                        {song.al.name}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default RecommendPage; 
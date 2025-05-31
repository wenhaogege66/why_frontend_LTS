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
    Grid,
    Container,
    Paper,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText, Button, Switch, FormControlLabel
} from '@mui/material';
import { Search, Menu as MenuIcon, Notifications, AccountCircle, PlayArrow, Login, PersonAdd, Logout, SmartToy, RotateLeft, RotateRight } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { getDailySongs } from '../api/music';
import { usePlayer, PlaylistType } from '../contexts/PlayerContext';

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isAISearch, setIsAISearch] = useState(false);
    const [dailySongs, setDailySongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentOffset, setCurrentOffset] = useState(0);
    
    // 使用全局播放器
    const { playSong } = usePlayer();

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

    const handlePlaySong = (song: any) => {
        // 转换歌曲格式以适配PlayerContext
        const formattedSong = {
            id: song.id,
            name: song.name,
            ar: song.ar || [{ name: '未知艺术家' }],
            al: {
                name: song.al?.name || '未知专辑',
                picUrl: song.al?.picUrl || 'https://picsum.photos/300/300?random=' + song.id,
                id: song.al?.id
            }
        };

        // 创建播放列表，包含所有每日推荐歌曲
        const dailyPlaylist = {
            type: PlaylistType.HOME_RECOMMEND,
            title: '每日推荐',
            songs: dailySongs.map(s => ({
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

        playSong(formattedSong, dailyPlaylist);
    };

    // 点击艺术家跳转
    const handleArtistClick = (artist: any) => {
        if (artist.id) {
            navigate(`/artist/${artist.id}`);
        }
    };

    // 点击专辑跳转
    const handleAlbumClick = (album: any) => {
        if (album.id) {
            navigate(`/album/${album.id}`);
        }
    };

    // 旋转控制
    const rotateLeft = () => {
        setCurrentOffset(prev => prev + 1); // 改为索引偏移
    };

    const rotateRight = () => {
        setCurrentOffset(prev => prev - 1); // 改为索引偏移
    };

    const featuredPlaylists = [
        {
            id: 1,
            title: "猜你喜欢",
            description: "根据你的喜好精心挑选",
            imageUrl: "https://picsum.photos/800/400?random=1",
            onClick: () => navigate('/recommend')
        },
        {
            id: 3,
            title: "心情电台",
            description: "听你想听的声音",
            imageUrl: "https://picsum.photos/800/400?random=3",
            onClick: () => navigate('/mood')
        }
    ];

    // 搜索框输入的 state
    const [searchQuery, setSearchQuery] = useState('');

    // 处理搜索输入框变化的事件
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // 处理搜索框按键事件（特に回车键）
    const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止默认的表单提交行为
            handleSearchSubmit(); // 调用搜索提交函数
        }
    };

    const handleSearchSubmit = () => {
        // 这里放你的搜索逻辑
        console.log('执行搜索:', searchQuery);
        if (searchQuery.trim()) { // 如果输入框不为空白字符
            // 导航到 /search 路由，并将查询内容作为 URL 参数 'q' 传递
            // encodeURIComponent 用于编码特殊字符，防止 URL 问题
            // 带上 ai 参数
            const url = `/search?q=${encodeURIComponent(searchQuery.trim())}${isAISearch ? "&ai=1" : ""}`;
            navigate(url);
            setSearchQuery('');
            // 可选：清空搜索框
            setSearchQuery('');
        }
    };

    // 获取用户信息
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await userApi.getProfile();
                if (response.code === 200) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
            }
        };

        fetchUserProfile();
    }, []);

    // 获取每日推荐
    useEffect(() => {
        const fetchDailySongs = async () => {
            try {
                setLoading(true);
                const response = await getDailySongs();
                if (response.code === 200) {
                    setDailySongs(response.data);
                }
            } catch (error) {
                console.error('获取每日推荐失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDailySongs();
    }, []);

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden',
            pb: 5 // 为播放器留出空间
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

                        {/* 搜索框 TextField 和搜索按钮 */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* AI搜索开关 */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isAISearch}
                                        onChange={(e) => setIsAISearch(e.target.checked)}
                                        color="primary"
                                        size="small"
                                    />
                                }
                                label={
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mr: 2 // 与搜索框保持间距
                                    }}>
                                        <SmartToy
                                            sx={{
                                                mr: 0.5,
                                                fontSize: '1.2rem',
                                                color: isAISearch ? "primary.main" : "text.secondary",
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: isAISearch ? "primary.main" : "text.secondary"
                                            }}
                                        >
                                            AI搜索
                                        </Typography>
                                    </Box>
                                }
                                sx={{
                                    mr: 2,
                                    mb: 0 // 重置 margin-bottom
                                }}
                            />
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
                                        borderRadius: '4px 0 0 4px', // 左侧圆角
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
                                onClick={handleSearchSubmit} // 使用和Enter键相同的处理函数
                                sx={{
                                    minWidth: 'auto',
                                    height: '40px', // 与TextField高度匹配
                                    borderRadius: '0 4px 4px 0', // 右侧圆角
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
                            <IconButton
                                size="large"
                            >
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
                    {/* 推荐展示框 */}
                    <Box sx={{ mb: 6 }}>
                        <Grid container spacing={3}>
                            {featuredPlaylists.map((playlist) => (
                                <Grid item xs={12} md={6} key={playlist.id}>
                                    <Paper
                                        elevation={0}
                                        onClick={playlist.onClick}
                                        sx={{
                                            position: 'relative',
                                            height: 250,
                                            borderRadius: 5,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                '& .overlay': {
                                                    opacity: 1
                                                },
                                                '& img': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={playlist.imageUrl}
                                            alt={playlist.title}
                                            sx={{
                                                transition: 'transform 0.3s ease-in-out'
                                            }}
                                        />
                                        <Box
                                            className="overlay"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))',
                                                opacity: 0.8,
                                                transition: 'opacity 0.3s ease-in-out',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                                p: 3
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                                {playlist.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                {playlist.description}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* 3D圆桌式每日推荐 */}
                    <Box sx={{ mb: 6 }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                mb: -16, 
                                fontWeight: 600,
                                color: '#1a1a1a',
                                textAlign: 'center'
                            }}
                        >
                            每日推荐
                        </Typography>
                        
                        {loading ? (
                            <Box sx={{ 
                                position: 'relative', 
                                height: '400px', 
                                perspective: '1200px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" color="text.secondary">加载中...</Typography>
                            </Box>
                        ) : (
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
                                    {dailySongs.map((song, index) => {
                                        // 计算当前卡片在圆桌上的实际位置索引
                                        const currentPositionIndex = (index + currentOffset + dailySongs.length) % dailySongs.length;
                                        
                                        // 根据位置索引计算角度和坐标
                                        const angle = (360 / dailySongs.length) * currentPositionIndex;
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
                                            >
                                                <Box sx={{ position: 'relative', height: '200px' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={song.al?.picUrl || 'https://picsum.photos/300/300?random=' + song.id}
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
                                                            handlePlaySong(song);
                                                        }}
                                                    >
                                                        <PlayArrow sx={{ color: 'primary.main', fontSize: '2rem' }} />
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (song.ar?.[0]) {
                                                                handleArtistClick(song.ar[0]);
                                                            }
                                                        }}
                                                    >
                                                        {song.ar?.map((artist: any) => artist.name).join(', ')}
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (song.al) {
                                                                handleAlbumClick(song.al);
                                                            }
                                                        }}
                                                    >
                                                        {song.al?.name}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;
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
    Chip,
    Stack,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText, Button
} from '@mui/material';
import { Search, Menu as MenuIcon, Notifications, AccountCircle, PlayArrow, Login, PersonAdd, Logout } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import MusicPlayer from '../components/MusicPlayer';

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState('全部');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [currentSong, setCurrentSong] = useState<any>(null);
    const [playlist, setPlaylist] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);

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
        setCurrentSong(song);
        if (!playlist.includes(song)) {
            setPlaylist([...playlist, song]);
        }
    };

    const handleNext = () => {
        if (playlist.length > 0) {
            const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
            const nextIndex = (currentIndex + 1) % playlist.length;
            setCurrentSong(playlist[nextIndex]);
        }
    };

    const handlePrevious = () => {
        if (playlist.length > 0) {
            const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
            const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            setCurrentSong(playlist[prevIndex]);
        }
    };

    const handleToggleFavorite = () => {
        if (currentSong) {
            setFavorites(prev => {
                if (prev.includes(currentSong.id)) {
                    return prev.filter(id => id !== currentSong.id);
                } else {
                    return [...prev, currentSong.id];
                }
            });
        }
    };

    const musicTags = ['全部', '流行', '摇滚', '民谣', '电子', '古典', '爵士', '说唱'];

    const featuredPlaylists = [
        {
            id: 1,
            title: "猜你喜欢",
            description: "根据你的喜好精心挑选",
            imageUrl: "https://picsum.photos/800/400?random=1"
        },
        {
            id: 2,
            title: "每日推荐",
            description: "每日更新，发现新音乐",
            imageUrl: "https://picsum.photos/800/400?random=2"
        },
        {
            id: 3,
            title: "热门歌单",
            description: "大家都在听什么",
            imageUrl: "https://picsum.photos/800/400?random=3"
        }
    ];

    const recommendedSongs = [
        {
            id: 1,
            title: "Morning Energy",
            artist: "Electronic Vibes",
            coverUrl: "https://picsum.photos/300/300?random=4",
            audioUrl: "https://example.com/audio1.mp3",
            tags: ["Workout", "Energetic"]
        },
        {
            id: 2,
            title: "Chill Vibes",
            artist: "Relaxation Station",
            coverUrl: "https://picsum.photos/300/300?random=5",
            audioUrl: "https://example.com/audio2.mp3",
            tags: ["Relax", "Ambient"]
        },
        {
            id: 3,
            title: "Focus Mode",
            artist: "Study Beats",
            coverUrl: "https://picsum.photos/300/300?random=6",
            audioUrl: "https://example.com/audio3.mp3",
            tags: ["Study", "Concentration"]
        },
        {
            id: 4,
            title: "Party Time",
            artist: "Dance Floor",
            coverUrl: "https://picsum.photos/300/300?random=7",
            audioUrl: "https://example.com/audio4.mp3",
            tags: ["Party", "Dance"]
        }
    ];

    const trendingSongs = [
        {
            id: 5,
            title: "Summer Vibes",
            artist: "Beach Boys",
            coverUrl: "https://picsum.photos/300/300?random=8",
            audioUrl: "https://example.com/audio5.mp3",
            tags: ["Summer", "Pop"]
        },
        {
            id: 6,
            title: "Night Drive",
            artist: "City Lights",
            coverUrl: "https://picsum.photos/300/300?random=9",
            audioUrl: "https://example.com/audio6.mp3",
            tags: ["Night", "Drive"]
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
            if (searchQuery.trim()) { // 如果输入框不为空白字符
                // 导航到 /search 路由，并将查询内容作为 URL 参数 'q' 传递
                // encodeURIComponent 用于编码特殊字符，防止 URL 问题
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                // 可选：清空搜索框
                setSearchQuery('');
            }
        }
    };

    const handleSearchSubmit = () => {
        // 这里放你的搜索逻辑
        console.log('执行搜索:', searchQuery);
        if (searchQuery.trim()) { // 如果输入框不为空白字符
            // 导航到 /search 路由，并将查询内容作为 URL 参数 'q' 传递
            // encodeURIComponent 用于编码特殊字符，防止 URL 问题
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
                                <Grid item xs={12} md={4} key={playlist.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            position: 'relative',
                                            height: 200,
                                            borderRadius: 3,
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
                                            height="200"
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
                                                p: 2
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

                    {/* 音乐分类标签 */}
                    <Box sx={{ mb: 4 }}>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 2 }}>
                            {musicTags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    sx={{
                                        bgcolor: selectedTag === tag ? 'primary.main' : 'background.paper',
                                        color: selectedTag === tag ? 'white' : 'text.primary',
                                        '&:hover': {
                                            bgcolor: selectedTag === tag ? 'primary.dark' : 'action.hover'
                                        }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* 猜你喜欢 */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                            音乐列表
                        </Typography>
                        <Grid container spacing={3}>
                            {recommendedSongs.map((song) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': { 
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                                                '& .play-button': {
                                                    opacity: 1,
                                                    transform: 'translate(-50%, -50%) scale(1.1)'
                                                },
                                                '& img': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                            <CardMedia
                                                component="img"
                                                height="160"
                                                image={song.coverUrl}
                                                alt={song.title}
                                                sx={{ 
                                                    borderTopLeftRadius: 3,
                                                    borderTopRightRadius: 3,
                                                    transition: 'transform 0.3s ease-in-out'
                                                }}
                                            />
                                            <IconButton
                                                className="play-button"
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                    opacity: 0,
                                                    transition: 'all 0.3s ease-in-out',
                                                    '&:hover': {
                                                        bgcolor: 'white',
                                                        transform: 'translate(-50%, -50%) scale(1.2)'
                                                    }
                                                }}
                                                onClick={() => handlePlaySong(song)}
                                            >
                                                <PlayArrow sx={{ color: 'primary.main' }} />
                                            </IconButton>
                                        </Box>
                                        <CardContent>
                                            <Typography variant="h6" noWrap>{song.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {song.artist}
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                {song.tags.map(tag => (
                                                    <Typography
                                                        key={tag}
                                                        variant="caption"
                                                        sx={{
                                                            display: 'inline-block',
                                                            bgcolor: '#e0f2fe',
                                                            color: '#0369a1',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 2,
                                                            mr: 1,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                bgcolor: '#0369a1',
                                                                color: 'white'
                                                            }
                                                        }}
                                                    >
                                                        {tag}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* 热门推荐 */}
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                            热门推荐
                        </Typography>
                        <Grid container spacing={3}>
                            {trendingSongs.map((song) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            transition: 'transform 0.2s',
                                            '&:hover': { 
                                                transform: 'translateY(-4px)',
                                                '& .play-button': {
                                                    opacity: 1
                                                }
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="160"
                                                image={song.coverUrl}
                                                alt={song.title}
                                                sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
                                            />
                                            <IconButton
                                                className="play-button"
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'white'
                                                    }
                                                }}
                                            >
                                                <PlayArrow sx={{ color: 'primary.main' }} />
                                            </IconButton>
                                        </Box>
                                        <CardContent>
                                            <Typography variant="h6">{song.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {song.artist}
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                {song.tags.map(tag => (
                                                    <Typography
                                                        key={tag}
                                                        variant="caption"
                                                        sx={{
                                                            display: 'inline-block',
                                                            bgcolor: '#e0f2fe',
                                                            color: '#0369a1',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 2,
                                                            mr: 1
                                                        }}
                                                    >
                                                        {tag}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>

            {/* 添加音乐播放器 */}
            {currentSong && (
                <MusicPlayer
                    currentSong={currentSong}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(currentSong.id)}
                />
            )}
        </Box>
    );
};

export default Home;
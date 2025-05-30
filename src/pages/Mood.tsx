//心情电台页面
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
    ListItemText,
    Button,
    Pagination,
    Chip,
    Tab,
    Tabs,
    CircularProgress
} from '@mui/material';
import { Search, Menu as MenuIcon, Notifications, AccountCircle, Login, PersonAdd, Logout, MusicNote, PlayArrow, Pause, Favorite, FavoriteBorder, Refresh } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { spiritSearch } from '../api/search';
import { usePlayer, PlaylistType } from '../contexts/PlayerContext';

const Mood = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [songPage, setSongPage] = useState(1);
    const [favoriteStates, setFavoriteStates] = useState<{ [key: number]: boolean }>({});
    const [selectedCategory, setSelectedCategory] = useState(0);
    const { playerState, playSong } = usePlayer();
    const itemsPerPage = 12;

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

    // 心情分类定义 - 参考Apple Music
    const moodCategories = [
        {
            category: '时光',
            moods: [
                { name: '晨间时光', icon: '🌅', description: '早晨醒来时听的音乐', gradient: 'linear-gradient(135deg, #FF9A8B 0%, #A8E6CF 100%)' },
                { name: '下班时光', icon: '🌇', description: '结束工作后的放松时光', gradient: 'linear-gradient(135deg, #FFD89B 0%, #19547B 100%)' },
                { name: '夜晚时光', icon: '🌙', description: '夜深人静的音乐', gradient: 'linear-gradient(135deg, #1E3C72 0%, #2A5298 100%)' },
                { name: '周末时光', icon: '🎉', description: '轻松愉快的周末', gradient: 'linear-gradient(135deg, #FF8A80 0%, #FF80AB 100%)' },
                { name: '假期', icon: '🏖️', description: '度假时的轻松音乐', gradient: 'linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)' },
                { name: '通勤', icon: '🚗', description: '上下班路上的音乐', gradient: 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)' },
                { name: '午后时光', icon: '☕', description: '慵懒的午后阳光', gradient: 'linear-gradient(135deg, #FFEAA7 0%, #DDA0DD 100%)' },
                { name: '深夜时分', icon: '🌃', description: '深夜独处的宁静', gradient: 'linear-gradient(135deg, #2C3E50 0%, #4A6741 100%)' }
            ]
        },
        {
            category: '情感',
            moods: [
                { name: '愉快', icon: '😊', description: '开心快乐的心情', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' },
                { name: '浪漫', icon: '💕', description: '浪漫甜蜜的感觉', gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)' },
                { name: '伤感', icon: '😢', description: '悲伤难过时听的歌', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                { name: '励志', icon: '💪', description: '激励人心的音乐', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                { name: '治愈', icon: '🌈', description: '温暖治愈的声音', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                { name: '心碎时刻', icon: '💔', description: '失恋时的音乐', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                { name: '怀旧', icon: '📻', description: '回忆往昔的音乐', gradient: 'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)' },
                { name: '感动', icon: '🥺', description: '让人感动落泪的歌曲', gradient: 'linear-gradient(135deg, #89CFF0 0%, #4682B4 100%)' }
            ]
        },
        {
            category: '活动',
            moods: [
                { name: '健身', icon: '🏋️', description: '运动时的动感音乐', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF4500 100%)' },
                { name: '运动', icon: '🏃', description: '跑步游泳等运动', gradient: 'linear-gradient(135deg, #ff9472 0%, #f2709c 100%)' },
                { name: '专注', icon: '🎯', description: '工作学习时的专注音乐', gradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)' },
                { name: '工作时间', icon: '💼', description: '办公时的背景音乐', gradient: 'linear-gradient(135deg, #B0C4DE 0%, #4682B4 100%)' },
                { name: '学习', icon: '📚', description: '学习时的专注音乐', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
                { name: '打游戏', icon: '🎮', description: '游戏时的音乐', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                { name: '开车', icon: '🚙', description: '驾车时的音乐', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
                { name: '阅读', icon: '📖', description: '读书时的轻音乐', gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' }
            ]
        },
        {
            category: '场景',
            moods: [
                { name: '睡觉', icon: '😴', description: '助眠的轻柔音乐', gradient: 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)' },
                { name: '冥想', icon: '🧘', description: '冥想放松的音乐', gradient: 'linear-gradient(135deg, #F0E68C 0%, #DAA520 100%)' },
                { name: '派对', icon: '🎊', description: '聚会时的热闹音乐', gradient: 'linear-gradient(135deg, #FF1493 0%, #8B008B 100%)' },
                { name: '社交聚会', icon: '👥', description: '朋友聚会的音乐', gradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)' },
                { name: '就餐与下厨', icon: '🍳', description: '烹饪用餐时的音乐', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
                { name: '居家', icon: '🏠', description: '在家时的舒适音乐', gradient: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)' },
                { name: '户外', icon: '🌳', description: '户外活动的音乐', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
                { name: '旅行', icon: '✈️', description: '旅途中的音乐', gradient: 'linear-gradient(135deg, #FFA07A 0%, #FF8C00 100%)' }
            ]
        },
        {
            category: '其他',
            moods: [
                { name: '减压', icon: '🌿', description: '释放压力的音乐', gradient: 'linear-gradient(135deg, #98FB98 0%, #3CB371 100%)' },
                { name: '平衡身心', icon: '⚖️', description: '身心平衡的音乐', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
                { name: '夏日之声', icon: '☀️', description: '夏天的清爽音乐', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
                { name: '冬日暖声', icon: '❄️', description: '冬日里的温暖', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                { name: '独处时光', icon: '🤗', description: '独自一人时的音乐', gradient: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)' },
                { name: '雨天', icon: '🌧️', description: '雨天里的惆怅音乐', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
                { name: '春天', icon: '🌸', description: '春天的清新气息', gradient: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)' },
                { name: '秋天', icon: '🍂', description: '秋日的金黄色调', gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)' }
            ]
        }
    ];

    const handleMoodClick = async (moodName: string, description: string) => {
        setSelectedMood(moodName);
        setLoading(true);
        setSongPage(1);
        try {
            // 使用心情名称和描述作为搜索参数
            const searchText = `${moodName}，${description}`;
            const response = await spiritSearch({ spirit: searchText });
            if (response.code === 200) {
                setSongs(response.data);
            }
        } catch (error) {
            console.error('获取心情音乐失败:', error);
            setSongs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshSongs = async () => {
        if (!selectedMood) return;
        
        setLoading(true);
        try {
            const currentMood = moodCategories
                .flatMap(cat => cat.moods)
                .find(mood => mood.name === selectedMood);
            
            if (currentMood) {
                const searchText = `${currentMood.name}，${currentMood.description}`;
                const response = await spiritSearch({ spirit: searchText });
                if (response.code === 200) {
                    setSongs(response.data);
                }
            }
        } catch (error) {
            console.error('刷新心情音乐失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = (songId: number) => {
        const song = songs.find(s => s.id === songId);
        if (song) {
            // 创建心情播放列表
            const moodPlaylist = {
                type: PlaylistType.MOOD,
                title: `心情电台: ${selectedMood}`,
                songs: songs.map(s => ({
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

            playSong(song, moodPlaylist);
        }
    };

    const toggleFavorite = (song: any) => {
        setFavoriteStates(prev => ({
            ...prev,
            [song.id]: !prev[song.id]
        }));
    };

    const handleCategoryChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedCategory(newValue);
        setSelectedMood(null);
        setSongs([]);
    };

    const renderSongList = () => {
        if (!selectedMood) return null;

        const startIndex = (songPage - 1) * itemsPerPage;
        const paginatedSongs = songs.slice(startIndex, startIndex + itemsPerPage);

        return (
            <Box sx={{ mt: 4 }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            color: "text.primary",
                        }}
                    >
                        <MusicNote sx={{ mr: 1, color: "primary.main" }} />
                        {selectedMood} 相关音乐
                        <Chip 
                            label={`${songs.length} 首歌曲`} 
                            size="small" 
                            sx={{ ml: 2 }}
                            color="primary"
                            variant="outlined"
                        />
                    </Typography>
                    <IconButton 
                        onClick={handleRefreshSongs}
                        sx={{ 
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                        }}
                    >
                        <Refresh />
                    </IconButton>
                </Box>

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
                        <CircularProgress size={50} sx={{ mb: 2, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            正在为您寻找心情音乐...
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1, textAlign: 'center' }}>
                            请稍候，AI正在为您精选音乐
                        </Typography>
                    </Box>
                ) : songs.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        color: 'text.secondary'
                    }}>
                        <MusicNote sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                        <Typography variant="h6">暂时没有找到相关音乐</Typography>
                        <Typography variant="body2">请尝试其他心情分类</Typography>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={2}>
                            {paginatedSongs.map((song) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                                    <Card
                                        sx={{
                                            display: "flex",
                                            borderRadius: 2,
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                transform: "scale(1.02)",
                                                boxShadow: 3,
                                            },
                                            border:
                                                playerState.currentSongId === song.id
                                                    ? "2px solid"
                                                    : "1px solid transparent",
                                            borderColor:
                                                playerState.currentSongId === song.id
                                                    ? "primary.main"
                                                    : "transparent",
                                        }}
                                        onClick={() => handlePlaySong(song.id)}
                                    >
                                        <CardMedia
                                            component="img"
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: "8px 0 0 8px",
                                                objectFit: "cover",
                                            }}
                                            image={song.al.picUrl}
                                            alt={song.name}
                                        />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                flexGrow: 1,
                                                position: "relative",
                                                minWidth: 0,
                                            }}
                                        >
                                            <CardContent
                                                sx={{
                                                    flex: "1 0 auto",
                                                    py: 1,
                                                    "&:last-child": { pb: 1 },
                                                    pr: 8,
                                                    minWidth: 0,
                                                }}
                                            >
                                                <Typography
                                                    component="div"
                                                    variant="body1"
                                                    noWrap
                                                    sx={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {song.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        maxWidth: "100%",
                                                    }}
                                                >
                                                    {song.ar.map((artist: any) => artist.name).join(" / ")}
                                                </Typography>
                                            </CardContent>

                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    right: 8,
                                                    bottom: 8,
                                                    display: "flex",
                                                    gap: 0.5,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: favoriteStates[song.id]
                                                            ? "error.main"
                                                            : "text.secondary",
                                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
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

                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color:
                                                            playerState.currentSongId === song.id &&
                                                            playerState.isPlaying
                                                                ? "primary.main"
                                                                : "text.secondary",
                                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                        },
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlaySong(song.id);
                                                    }}
                                                >
                                                    {playerState.currentSongId === song.id &&
                                                    playerState.isPlaying ? (
                                                        <Pause fontSize="small" />
                                                    ) : (
                                                        <PlayArrow fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {songs.length > itemsPerPage && (
                            <Box sx={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                mt: 3,
                                mb: 2
                            }}>
                                <Pagination
                                    count={Math.ceil(songs.length / itemsPerPage)}
                                    page={songPage}
                                    onChange={(_, value) => setSongPage(value)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        );
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
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        心情电台
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        根据您的心情和活动，为您推荐最适合的音乐
                    </Typography>

                    {/* 分类标签 */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs 
                            value={selectedCategory} 
                            onChange={handleCategoryChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': {
                                    minWidth: 'auto',
                                    fontWeight: 500,
                                }
                            }}
                        >
                            {moodCategories.map((category, index) => (
                                <Tab 
                                    key={index}
                                    label={category.category} 
                                />
                            ))}
                        </Tabs>
                    </Box>

                    {/* 心情卡片 */}
                    <Grid container spacing={3}>
                        {moodCategories[selectedCategory].moods.map((mood, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <Paper
                                    elevation={0}
                                    onClick={() => handleMoodClick(mood.name, mood.description)}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: mood.gradient,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        minHeight: 120,
                                        border: selectedMood === mood.name ? '3px solid white' : 'none',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                                            '& .mood-icon': {
                                                transform: 'scale(1.2) rotate(10deg)',
                                            }
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(255,255,255,0.1)',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                        },
                                        '&:hover::before': {
                                            opacity: 1,
                                        }
                                    }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        height: '100%',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    color: 'white', 
                                                    fontWeight: 600,
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    mb: 1
                                                }}
                                            >
                                                {mood.name}
                                            </Typography>
                                            <Typography 
                                                variant="body2"
                                                sx={{ 
                                                    color: 'rgba(255,255,255,0.9)', 
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {mood.description}
                                            </Typography>
                                        </Box>
                                        <Typography 
                                            className="mood-icon"
                                            sx={{ 
                                                fontSize: '2.5rem',
                                                transition: 'transform 0.3s ease',
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                                alignSelf: 'flex-end'
                                            }}
                                        >
                                            {mood.icon}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* 歌曲列表 */}
                    {renderSongList()}
                </Container>
            </Box>
        </Box>
    );
};

export default Mood;

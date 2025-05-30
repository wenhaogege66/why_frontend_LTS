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
    Pagination
} from '@mui/material';
import { Search, Menu as MenuIcon, Notifications, AccountCircle, Login, PersonAdd, Logout, MusicNote, PlayArrow, Pause, Favorite, FavoriteBorder } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { spiritSearch } from '../api/search';
import { usePlayer } from '../contexts/PlayerContext';

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

    const moodCategories = [
        { 
            id: 1, 
            name: '开心', 
            color: '#FFD700',
            icon: '😊',
            gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
        },
        { 
            id: 2, 
            name: '放松', 
            color: '#98FB98',
            icon: '🌿',
            gradient: 'linear-gradient(135deg, #98FB98 0%, #3CB371 100%)'
        },
        { 
            id: 3, 
            name: '专注', 
            color: '#87CEEB',
            icon: '🎯',
            gradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)'
        },
        { 
            id: 4, 
            name: '运动', 
            color: '#FF6B6B',
            icon: '🏃',
            gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF4500 100%)'
        },
        { 
            id: 5, 
            name: '睡眠', 
            color: '#9370DB',
            icon: '🌙',
            gradient: 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)'
        },
        { 
            id: 6, 
            name: '旅行', 
            color: '#FFA07A',
            icon: '✈️',
            gradient: 'linear-gradient(135deg, #FFA07A 0%, #FF8C00 100%)'
        },
        { 
            id: 7, 
            name: '浪漫', 
            color: '#FF69B4',
            icon: '💝',
            gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)'
        },
        { 
            id: 8, 
            name: '治愈', 
            color: '#E0FFFF',
            icon: '🌈',
            gradient: 'linear-gradient(135deg, #E0FFFF 0%, #87CEFA 100%)'
        },
        { 
            id: 9, 
            name: '怀旧', 
            color: '#DDA0DD',
            icon: '📻',
            gradient: 'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)'
        },
        { 
            id: 10, 
            name: '冥想', 
            color: '#F0E68C',
            icon: '🧘',
            gradient: 'linear-gradient(135deg, #F0E68C 0%, #DAA520 100%)'
        },
        { 
            id: 11, 
            name: '派对', 
            color: '#FF1493',
            icon: '🎉',
            gradient: 'linear-gradient(135deg, #FF1493 0%, #8B008B 100%)'
        },
        { 
            id: 12, 
            name: '工作', 
            color: '#B0C4DE',
            icon: '💼',
            gradient: 'linear-gradient(135deg, #B0C4DE 0%, #4682B4 100%)'
        }
    ];

    const handleMoodClick = async (moodName: string) => {
        setSelectedMood(moodName);
        setLoading(true);
        try {
            const response = await spiritSearch({ spirit: moodName });
            if (response.code === 200) {
                setSongs(response.data);
            }
        } catch (error) {
            console.error('获取心情音乐失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = (songId: number) => {
        const song = songs.find(s => s.id === songId);
        if (song) {
            playSong(song);
        }
    };

    const toggleFavorite = (song: any) => {
        setFavoriteStates(prev => ({
            ...prev,
            [song.id]: !prev[song.id]
        }));
    };

    const renderSongList = () => {
        if (!selectedMood) return null;

        const startIndex = (songPage - 1) * itemsPerPage;
        const paginatedSongs = songs.slice(startIndex, startIndex + itemsPerPage);

        return (
            <Box sx={{ mt: 4 }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 2,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        color: "text.primary",
                    }}
                >
                    <MusicNote sx={{ mr: 1, color: "primary.main" }} />
                    {selectedMood} 相关音乐
                </Typography>
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
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
                        心情电台
                    </Typography>

                    <Grid container spacing={3}>
                        {moodCategories.map((mood) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={mood.id}>
                                <Paper
                                    elevation={0}
                                    onClick={() => handleMoodClick(mood.name)}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: mood.gradient,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                            '& .mood-icon': {
                                                transform: 'scale(1.1) rotate(5deg)',
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
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                color: 'white', 
                                                fontWeight: 500,
                                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {mood.name}
                                        </Typography>
                                        <Typography 
                                            className="mood-icon"
                                            sx={{ 
                                                fontSize: '2rem',
                                                transition: 'transform 0.3s ease',
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                            }}
                                        >
                                            {mood.icon}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Typography>加载中...</Typography>
                        </Box>
                    ) : (
                        renderSongList()
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default Mood;

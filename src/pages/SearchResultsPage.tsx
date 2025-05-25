// src/pages/SearchResultsPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Pagination,
    Paper,
    Slider,
    Toolbar,
    TextField,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    AppBar
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    SkipNext,
    SkipPrevious,
    VolumeUp,
    Menu as MenuIcon,
    Search,
    Notifications, AccountCircle, Logout, Login, PersonAdd
} from '@mui/icons-material';
import { unifiedSearch, UnifiedSearchResults, Song } from '../api/search';
import Sidebar from '../components/Sidebar';
import { userApi } from '../api/user';

// 定义音乐播放状态接口
interface PlayerState {
    isPlaying: boolean;
    currentSongId: number | null;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
}

function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const query = searchParams.get('q');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [page, setPage] = useState(1);
    const itemsPerPage = 12;

    // 搜索结果状态
    const [searchResults, setSearchResults] = useState<UnifiedSearchResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Home.tsx 顶部栏
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [user, setUser] = useState<any>(null);

    const handleLogout = () => {
        userApi.logout();
        navigate('/login');
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


    // 音乐播放状态
    const [playerState, setPlayerState] = useState<PlayerState>({
        isPlaying: false,
        currentSongId: null,
        currentTime: 0,
        duration: 0,
        volume: 50,
        isMuted: false
    });
    const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);
    const [currentLyrics, setCurrentLyrics] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 使用 useEffect 在 query 变化时触发搜索
    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                setLoading(false);
                setSearchResults(null);
                setError('请输入搜索内容');
                return;
            }

            setLoading(true);
            setSearchResults(null);
            setError(null);
            setPage(1); // 重置分页到第一页

            try {
                const results = await unifiedSearch({ query: query });
                setSearchResults(results);
            } catch (err) {
                setError('搜索过程中发生错误');
                console.error("Unified search failed:", err);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    // 初始化音频元素
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
            audioRef.current.addEventListener('ended', handleSongEnd);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audioRef.current.removeEventListener('ended', handleSongEnd);
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // 播放音乐
    const playSong = async (songId: number) => {
        try {
            // 如果已经在播放同一首歌，只需切换播放/暂停状态
            if (playerState.currentSongId === songId) {
                if (playerState.isPlaying) {
                    audioRef.current?.pause();
                    setPlayerState(prev => ({ ...prev, isPlaying: false }));
                } else {
                    await audioRef.current?.play();
                    setPlayerState(prev => ({ ...prev, isPlaying: true }));
                }
                return;
            }

            // 获取歌曲播放URL和歌词
            // TODO 需要修改成对应后端的api！！！（还没实现）
            const response = await fetch(`/api/song/url?id=${songId}`);
            const data = await response.json();

            if (data.code === 200 && data.data.url) {
                if (audioRef.current) {
                    audioRef.current.src = data.data.url;
                    audioRef.current.currentTime = 0;
                    audioRef.current.volume = playerState.volume / 100;
                    await audioRef.current.play();

                    setCurrentSongUrl(data.data.url);
                    setCurrentLyrics(data.data.lyric || null);
                    setPlayerState({
                        ...playerState,
                        isPlaying: true,
                        currentSongId: songId,
                        currentTime: 0,
                        duration: audioRef.current.duration || 0
                    });
                }
            } else {
                throw new Error('无法获取歌曲播放地址');
            }
        } catch (err) {
            console.error('播放歌曲失败:', err);
            setError('播放歌曲失败，请稍后重试');
        }
    };

    // 处理时间更新
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setPlayerState(prev => ({
                ...prev,
                currentTime: audioRef.current?.currentTime || 0,
                duration: audioRef.current?.duration || 0
            }));
        }
    };

    // 处理元数据加载
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setPlayerState(prev => ({
                ...prev,
                duration: audioRef.current?.duration || 0
            }));
        }
    };

    // 处理歌曲结束
    const handleSongEnd = () => {
        setPlayerState(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: 0
        }));
    };

    // 处理进度条变化
    // @ts-ignore
    const handleSeek = (event: Event, newValue: number | number[]) => {
        const seekTime = Array.isArray(newValue) ? newValue[0] : newValue;
        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
            setPlayerState(prev => ({
                ...prev,
                currentTime: seekTime
            }));
        }
    };

    // 处理音量变化
    // @ts-ignore
    const handleVolumeChange = (event: Event, newValue: number | number[]) => {
        const volume = Array.isArray(newValue) ? newValue[0] : newValue;
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
            setPlayerState(prev => ({
                ...prev,
                volume: volume,
                isMuted: volume === 0
            }));
        }
    };

    // 切换静音
    const toggleMute = () => {
        if (audioRef.current) {
            const isMuted = !playerState.isMuted;
            audioRef.current.muted = isMuted;
            setPlayerState(prev => ({
                ...prev,
                isMuted: isMuted
            }));
        }
    };

    // 格式化时间为 MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // 渲染歌曲列表
    const renderSongList = (songs: Song[] | undefined, title: string) => {
        if (!songs || songs.length === 0) {
            return null;
        }

        // 分页逻辑
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedSongs = songs.slice(startIndex, startIndex + itemsPerPage);

        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>{title}</Typography>
                <Grid container spacing={2}>
                    {paginatedSongs.map(song => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                            <Card
                                sx={{
                                    display: 'flex',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: 3
                                    }
                                }}
                                onClick={() => playSong(song.id)}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '8px 0 0 8px',
                                        objectFit: 'cover'
                                    }}
                                    image={song.al.picUrl}
                                    alt={song.name}
                                />
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1,
                                    position: 'relative'
                                }}>
                                    <CardContent sx={{
                                        flex: '1 0 auto',
                                        py: 1,
                                        '&:last-child': { pb: 1 },
                                        pr: 6
                                    }}>
                                        <Typography component="div" variant="body1" noWrap>
                                            {song.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {song.ar.map(artist => artist.name).join(' / ')}
                                        </Typography>
                                    </CardContent>
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            bottom: 8,
                                            color: playerState.currentSongId === song.id && playerState.isPlaying
                                                ? 'primary.main'
                                                : 'text.secondary'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playSong(song.id);
                                        }}
                                    >
                                        {playerState.currentSongId === song.id && playerState.isPlaying
                                            ? <Pause />
                                            : <PlayArrow />
                                        }
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                {songs.length > itemsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={Math.ceil(songs.length / itemsPerPage)}
                            page={page}
                            onChange={(_, value) => setPage(value)}
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
            pb: 7 // 为播放器留出空间
        }}>
            {/* 侧边栏 */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <Box sx={{
                flexGrow: 1,
                bgcolor: '#f8f9fa',
                width: '100%',
                overflow: 'auto',
                height: '100vh'
            }}>
                {/* 顶部导航栏 */}
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
                            sx={{ mr: 2 }}
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
                                <MenuItem onClick={handleClose}>
                                    <ListItemIcon>
                                        <AccountCircle fontSize="small" />
                                    </ListItemIcon>
                                    {/*<ListItemText>{user.nickname}</ListItemText>*/}
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>退出登录</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* 主体内容区域 */}
                <Box sx={{ display: 'flex', flexGrow: 1 }}>


                <Box sx={{
                    flexGrow: 1,
                    bgcolor: '#f8f9fa',
                    width: '100%',
                    minHeight: '100vh',
                    overflow: 'auto',
                    pt: '64px',
                    pb: playerState.currentSongId ? '80px' : 0 // 为播放器留出空间
                }}>

                    <Container maxWidth="xl" sx={{ py: 4 }}>
                        {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {!loading && !error && searchResults && (
                            <Box>
                                <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
                                    搜索结果："{searchParams.get('q')}"
                                </Typography>

                                {renderSongList(searchResults.byDescription?.data, 'AI 推荐 (根据描述)')}
                                {renderSongList(searchResults.byMood?.data, 'AI 推荐 (根据心情)')}
                                {renderSongList(searchResults.byTitle?.data, 'AI 推荐 (根据主题)')}

                                {/* 更安全的无结果检查 */}
                                {(
                                    (!searchResults.byDescription?.data || searchResults.byDescription.data.length === 0) &&
                                    (!searchResults.byMood?.data || searchResults.byMood.data.length === 0) &&
                                    (!searchResults.byTitle?.data || searchResults.byTitle.data.length === 0)
                                ) && (
                                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                                        未找到相关结果。
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {!loading && !error && !query && (
                            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                                请在顶部的搜索框输入歌曲、歌手或描述进行搜索。
                            </Typography>
                        )}
                    </Container>
                </Box>
            </Box>

                {/* 音乐播放器 */}
                {playerState.currentSongId && (
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            px: 3,
                            zIndex: 1000,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {/* 歌曲信息 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200, mr: 2 }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 56, height: 56, borderRadius: 1, mr: 2 }}
                                    image={
                                        searchResults?.byTitle?.data?.find(s => s.id === playerState.currentSongId)?.al.picUrl ||
                                        searchResults?.byMood?.data?.find(s => s.id === playerState.currentSongId)?.al.picUrl ||
                                        searchResults?.byDescription?.data?.find(s => s.id === playerState.currentSongId)?.al.picUrl ||
                                        ''
                                    }
                                    alt="Album cover"
                                />
                                <Box>
                                    <Typography variant="subtitle1" noWrap>
                                        {searchResults?.byTitle?.data?.find(s => s.id === playerState.currentSongId)?.name ||
                                            searchResults?.byMood?.data?.find(s => s.id === playerState.currentSongId)?.name ||
                                            searchResults?.byDescription?.data?.find(s => s.id === playerState.currentSongId)?.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {searchResults?.byTitle?.data?.find(s => s.id === playerState.currentSongId)?.ar.map(a => a.name).join(', ') ||
                                            searchResults?.byMood?.data?.find(s => s.id === playerState.currentSongId)?.ar.map(a => a.name).join(', ') ||
                                            searchResults?.byDescription?.data?.find(s => s.id === playerState.currentSongId)?.ar.map(a => a.name).join(', ')}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* 播放控制 */}
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mx: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <IconButton>
                                        <SkipPrevious />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => playSong(playerState.currentSongId!)}
                                        sx={{ mx: 2 }}
                                    >
                                        {playerState.isPlaying ? <Pause /> : <PlayArrow />}
                                    </IconButton>
                                    <IconButton>
                                        <SkipNext />
                                    </IconButton>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="caption" sx={{ width: 40 }}>
                                        {formatTime(playerState.currentTime)}
                                    </Typography>
                                    <Slider
                                        value={playerState.currentTime}
                                        max={playerState.duration || 100}
                                        onChange={handleSeek}
                                        sx={{ mx: 2, flexGrow: 1 }}
                                        size="small"
                                    />
                                    <Typography variant="caption" sx={{ width: 40 }}>
                                        {formatTime(playerState.duration)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* 音量控制 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150 }}>
                                <IconButton onClick={toggleMute}>
                                    <VolumeUp />
                                </IconButton>
                                <Slider
                                    value={playerState.volume}
                                    onChange={handleVolumeChange}
                                    sx={{ width: 100, ml: 1 }}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}

export default SearchResultsPage;
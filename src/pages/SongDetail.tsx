import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    Rating,
    TextField,
    Button,
    Divider,
    Avatar,
    Paper,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    Favorite,
    FavoriteBorder,
    Share,
    MoreVert,
    Add,
    Close
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { musicApi } from '../api/music';
import Lyrics from '../components/Lyrics';
import MusicPlayer from '../components/MusicPlayer';

const SongDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<number | ''>('');
    const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // 获取歌曲详情
    useEffect(() => {
        const fetchSongDetail = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                const data = await musicApi.getSongById(parseInt(id));
                setSong(data);
                setIsFavorite(data.is_favorite);
                setUserRating(data.user_rating);
                
                // 记录播放
                await musicApi.playSong(parseInt(id));
                
                // 获取评论
                const commentsData = await musicApi.getComments(parseInt(id));
                setComments(commentsData);
                
                setLoading(false);
            } catch (error) {
                setError('获取歌曲信息失败');
                setLoading(false);
            }
        };

        fetchSongDetail();
    }, [id]);

    // 获取播放列表
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const data = await musicApi.getPlaylists();
                setPlaylists(data);
            } catch (error) {
                console.error('获取播放列表失败:', error);
            }
        };

        fetchPlaylists();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleToggleFavorite = async () => {
        if (!song) return;
        
        try {
            if (isFavorite) {
                await musicApi.removeFavorite(song.id);
            } else {
                await musicApi.addFavorite(song.id);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('收藏操作失败:', error);
        }
    };

    const handleRatingChange = async (value: number | null) => {
        if (!song || !value) return;
        
        try {
            await musicApi.rateSong(song.id, value);
            setUserRating(value);
        } catch (error) {
            console.error('评分失败:', error);
        }
    };

    const handleAddComment = async () => {
        if (!song || !commentText.trim()) return;
        
        try {
            const newComment = await musicApi.addComment(song.id, commentText);
            setComments([newComment, ...comments]);
            setCommentText('');
        } catch (error) {
            console.error('添加评论失败:', error);
        }
    };

    const handleAddToPlaylist = async () => {
        if (!song || !selectedPlaylist) return;
        
        try {
            await musicApi.addSongToPlaylist(selectedPlaylist as number, song.id);
            setAddToPlaylistOpen(false);
            setSelectedPlaylist('');
        } catch (error) {
            console.error('添加到播放列表失败:', error);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistTitle.trim()) return;
        
        try {
            const newPlaylist = await musicApi.createPlaylist(newPlaylistTitle);
            setPlaylists([...playlists, newPlaylist]);
            setCreatePlaylistOpen(false);
            setNewPlaylistTitle('');
            
            // 自动选中新创建的播放列表
            setSelectedPlaylist(newPlaylist.id as number);
        } catch (error) {
            console.error('创建播放列表失败:', error);
        }
    };

    const handleShareSong = async () => {
        // 实现分享功能
        if (!song) return;
        
        try {
            // 复制分享链接到剪贴板
            const shareUrl = `${window.location.origin}/song/${song.id}`;
            await navigator.clipboard.writeText(shareUrl);
            alert('链接已复制到剪贴板');
            setShareDialogOpen(false);
        } catch (error) {
            console.error('分享失败:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!song) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>歌曲不存在</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    {/* 歌曲信息 */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                            <CardMedia
                                component="img"
                                height="300"
                                image={song.cover_url}
                                alt={song.title}
                            />
                            <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                    {song.title}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                                    {song.artist_name}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton 
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            sx={{ 
                                                bgcolor: 'primary.main', 
                                                color: 'white',
                                                '&:hover': { bgcolor: 'primary.dark' }
                                            }}
                                        >
                                            {isPlaying ? <Pause /> : <PlayArrow />}
                                        </IconButton>
                                        <IconButton onClick={handleToggleFavorite} sx={{ ml: 1 }}>
                                            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                                        </IconButton>
                                        <IconButton onClick={() => setShareDialogOpen(true)} sx={{ ml: 1 }}>
                                            <Share />
                                        </IconButton>
                                    </Box>
                                    <IconButton onClick={() => setAddToPlaylistOpen(true)}>
                                        <Add />
                                    </IconButton>
                                </Box>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">平均评分</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Rating
                                            value={song.average_rating}
                                            precision={0.5}
                                            readOnly
                                            size="small"
                                        />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            {song.average_rating.toFixed(1)}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>我的评分</Typography>
                                    <Rating
                                        value={userRating}
                                        onChange={(event, value) => handleRatingChange(value)}
                                        size="large"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* 歌词、评论、相关信息 */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs 
                                    value={tabValue} 
                                    onChange={handleTabChange} 
                                    aria-label="song detail tabs"
                                    centered
                                >
                                    <Tab label="歌词" />
                                    <Tab label="评论" />
                                    <Tab label="相关信息" />
                                </Tabs>
                            </Box>
                            
                            {/* 歌词 */}
                            {tabValue === 0 && (
                                <Box sx={{ height: 500 }}>
                                    <Lyrics lyrics={song.lyrics || ''} currentTime={currentTime} />
                                </Box>
                            )}
                            
                            {/* 评论 */}
                            {tabValue === 1 && (
                                <Box sx={{ p: 3 }}>
                                    <Box sx={{ mb: 3 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="发表你的评论..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                        <Button 
                                            variant="contained" 
                                            onClick={handleAddComment}
                                            disabled={!commentText.trim()}
                                        >
                                            发布评论
                                        </Button>
                                    </Box>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    {comments.length === 0 ? (
                                        <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                                            暂无评论，快来发表第一条评论吧！
                                        </Typography>
                                    ) : (
                                        <Box>
                                            {comments.map((comment) => (
                                                <Box key={comment.id} sx={{ mb: 3 }}>
                                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                                        <Avatar 
                                                            src={comment.user_avatar || ''} 
                                                            sx={{ mr: 2 }}
                                                        >
                                                            {comment.user_nickname?.charAt(0) || 'U'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2">
                                                                {comment.user_nickname}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(comment.created_at).toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body1" sx={{ ml: 7 }}>
                                                        {comment.content}
                                                    </Typography>
                                                    <Divider sx={{ mt: 2 }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            )}
                            
                            {/* 相关信息 */}
                            {tabValue === 2 && (
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>歌曲信息</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={3}>
                                            <Typography variant="body2" color="text.secondary">专辑</Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Typography variant="body2">{song.album_title || '无'}</Typography>
                                        </Grid>
                                        
                                        <Grid item xs={3}>
                                            <Typography variant="body2" color="text.secondary">艺术家</Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Typography variant="body2">{song.artist_name}</Typography>
                                        </Grid>
                                        
                                        <Grid item xs={3}>
                                            <Typography variant="body2" color="text.secondary">时长</Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Typography variant="body2">
                                                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                            </Typography>
                                        </Grid>
                                        
                                        <Grid item xs={3}>
                                            <Typography variant="body2" color="text.secondary">播放次数</Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Typography variant="body2">{song.play_count}</Typography>
                                        </Grid>
                                        
                                        <Grid item xs={3}>
                                            <Typography variant="body2" color="text.secondary">标签</Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {song.tags && song.tags.length > 0 ? song.tags.map((tag: any) => (
                                                    <Typography 
                                                        key={tag.id} 
                                                        variant="body2" 
                                                        sx={{ 
                                                            bgcolor: 'rgba(0,0,0,0.08)', 
                                                            px: 1, 
                                                            py: 0.5, 
                                                            borderRadius: 1 
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </Typography>
                                                )) : (
                                                    <Typography variant="body2">无标签</Typography>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            
            {/* 添加到播放列表对话框 */}
            <Dialog open={addToPlaylistOpen} onClose={() => setAddToPlaylistOpen(false)}>
                <DialogTitle>添加到播放列表</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    {playlists.length === 0 ? (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            暂无播放列表，创建一个吧
                        </Typography>
                    ) : (
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel>选择播放列表</InputLabel>
                            <Select
                                value={selectedPlaylist}
                                onChange={(e) => setSelectedPlaylist(e.target.value)}
                                label="选择播放列表"
                            >
                                {playlists.map((playlist) => (
                                    <MenuItem key={playlist.id} value={playlist.id}>
                                        {playlist.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    
                    <Button 
                        variant="text" 
                        color="primary" 
                        onClick={() => {
                            setAddToPlaylistOpen(false);
                            setCreatePlaylistOpen(true);
                        }}
                        sx={{ mt: 2 }}
                        startIcon={<Add />}
                    >
                        创建新播放列表
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddToPlaylistOpen(false)}>取消</Button>
                    <Button 
                        onClick={handleAddToPlaylist} 
                        disabled={!selectedPlaylist}
                        variant="contained"
                    >
                        添加
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* 创建播放列表对话框 */}
            <Dialog open={createPlaylistOpen} onClose={() => setCreatePlaylistOpen(false)}>
                <DialogTitle>创建播放列表</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="播放列表名称"
                        fullWidth
                        variant="outlined"
                        value={newPlaylistTitle}
                        onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreatePlaylistOpen(false)}>取消</Button>
                    <Button 
                        onClick={handleCreatePlaylist} 
                        disabled={!newPlaylistTitle.trim()}
                        variant="contained"
                    >
                        创建
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* 分享对话框 */}
            <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
                <DialogTitle>分享歌曲</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        分享 "{song?.title}" 给朋友
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={`${window.location.origin}/song/${song?.id}`}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareDialogOpen(false)}>取消</Button>
                    <Button 
                        onClick={handleShareSong}
                        variant="contained"
                    >
                        复制链接
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* 音乐播放器 */}
            {song && (
                <MusicPlayer
                    currentSong={song}
                    onNext={() => {}}
                    onPrevious={() => {}}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite}
                />
            )}
        </Box>
    );
};

export default SongDetail; 
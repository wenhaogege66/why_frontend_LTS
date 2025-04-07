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
    Grid
} from '@mui/material';
import { Search, Menu, Notifications, AccountCircle } from '@mui/icons-material';

const Home = () => {
    const recommendedSongs = [
        {
            id: 1,
            title: "Morning Energy",
            artist: "Electronic Vibes",
            coverUrl: "https://source.unsplash.com/random/300x300/?music,cover",
            tags: ["Workout", "Energetic"]
        },
        // 更多歌曲数据...
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh', // 全屏高度
                width: '100vw',    // 全屏宽度
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#f8f9fa'
            }}
        >
            {/* 顶部导航栏 */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    color: 'text.primary',
                    borderBottom: '1px solid #eee'
                }}
            >
                <Toolbar>
                    <IconButton edge="start" sx={{ mr: 2 }}>
                        <Menu />
                    </IconButton>

                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
                        WHY 智能音乐推荐
                    </Typography>

                    <TextField
                        variant="outlined"
                        placeholder="搜索歌曲或歌手..."
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <Search sx={{ color: 'action.active', mr: 1 }} />
                                ),
                            },
                        }}
                        sx={{
                            width: 400,
                            '& .MuiOutlinedInput-root': { borderRadius: 4 }
                        }}
                    />

                    <Box sx={{ display: 'flex', ml: 2 }}>
                        <IconButton>
                            <Notifications />
                        </IconButton>
                        <IconButton>
                            <AccountCircle />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 主内容区 */}
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                    为你推荐
                </Typography>

                <Grid container spacing={3}>
                    {recommendedSongs.map((song) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)' }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={song.coverUrl}
                                    alt={song.title}
                                    sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
                                />
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
        </Box>
    );
};

export default Home;
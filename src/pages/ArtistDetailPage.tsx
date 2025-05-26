import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Slider,
  Avatar,
  Chip,
  Pagination,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Login,
  PersonAdd,
  ArrowBack,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  ExpandLess,
  ExpandMore,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { userApi } from "../api/user";
import { searchApi, ArtistDetail, Song } from "../api/search";
import { favoriteApi, FavoriteCreateData } from "../api/favorite";
import LyricsDisplay from "../components/LyricsDisplay";
import FullScreenLyrics from "../components/FullScreenLyrics";

// 定义音乐播放状态接口
interface PlayerState {
  isPlaying: boolean;
  currentSongId: number | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

function ArtistDetailPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artistDetail, setArtistDetail] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 用户信息
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);

  // 音乐播放状态
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentSongId: null,
    currentTime: 0,
    duration: 0,
    volume: 50,
    isMuted: false,
  });
  const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);
  const [currentLyrics, setCurrentLyrics] = useState<string | null>(null);
  const [currentSongInfo, setCurrentSongInfo] = useState<Song | null>(null);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [fullScreenLyricsOpen, setFullScreenLyricsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 分页状态
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // 收藏状态管理
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {}
  );

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    userApi.logout();
    navigate("/login");
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
        console.error("获取用户信息失败:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // 获取歌手详情
  useEffect(() => {
    const fetchArtistDetail = async () => {
      if (!artistId) {
        setError("歌手ID不存在");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 检查artistId是否为数字ID
        const isNumericId = /^\d+$/.test(artistId);

        if (isNumericId) {
          // 如果是数字ID，直接获取歌手详情
          const response = await searchApi.getArtistDetail(parseInt(artistId));
          if (response.code === 200 && response.data.length > 0) {
            setArtistDetail(response.data[0]);
          } else {
            setError("获取歌手信息失败");
          }
        } else {
          // 如果是歌手名称，先搜索获取歌手ID
          const decodedName = decodeURIComponent(artistId);
          const searchResponse = await searchApi.searchByArtist({
            keyword: decodedName,
          });

          if (searchResponse.code === 200 && searchResponse.data.length > 0) {
            // 找到第一个匹配的歌手
            const artist = searchResponse.data[0] as any;
            const response = await searchApi.getArtistDetail(artist.id);

            if (response.code === 200 && response.data.length > 0) {
              setArtistDetail(response.data[0]);
            } else {
              setError("获取歌手信息失败");
            }
          } else {
            setError(`未找到歌手: ${decodedName}`);
          }
        }
      } catch (err) {
        setError("获取歌手信息失败");
        console.error("获取歌手详情失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistDetail();
  }, [artistId]);

  // 检查当前页歌曲的收藏状态
  useEffect(() => {
    if (artistDetail?.songs && user) {
      // 只检查当前页的歌曲
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedSongs = artistDetail.songs.slice(
        startIndex,
        startIndex + itemsPerPage
      );
      const songIds = paginatedSongs.map((song) => song.id);
      checkFavoriteStatus(songIds);
    }
  }, [artistDetail, user, page]);

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("ended", handleSongEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        audioRef.current.removeEventListener("ended", handleSongEnd);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 播放音乐
  const playSong = async (song: Song) => {
    try {
      if (playerState.currentSongId === song.id) {
        if (playerState.isPlaying) {
          audioRef.current?.pause();
          setPlayerState((prev) => ({ ...prev, isPlaying: false }));
        } else {
          await audioRef.current?.play();
          setPlayerState((prev) => ({ ...prev, isPlaying: true }));
        }
        return;
      }

      setCurrentSongInfo(song);
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));

      const response = await searchApi.getSongPlayInfo(song.id);

      if (response.code === 200 && response.data.url) {
        if (audioRef.current) {
          audioRef.current.src = response.data.url;
          audioRef.current.currentTime = 0;
          audioRef.current.volume = playerState.volume / 100;

          audioRef.current.onloadeddata = async () => {
            try {
              await audioRef.current?.play();
              setPlayerState((prev) => ({
                ...prev,
                isPlaying: true,
                currentSongId: song.id,
                currentTime: 0,
                duration: audioRef.current?.duration || 0,
              }));
            } catch (playError) {
              console.error("播放失败:", playError);
              setError("播放失败，请稍后重试");
            }
          };

          setCurrentSongUrl(response.data.url);
          setCurrentLyrics(response.data.lyric || null);
        }
      } else {
        throw new Error("无法获取歌曲播放地址");
      }
    } catch (err) {
      console.error("播放歌曲失败:", err);
      setError("播放歌曲失败，请稍后重试");
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  // 处理时间更新
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlayerState((prev) => ({
        ...prev,
        currentTime: audioRef.current?.currentTime || 0,
        duration: audioRef.current?.duration || 0,
      }));
    }
  };

  // 处理元数据加载
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setPlayerState((prev) => ({
        ...prev,
        duration: audioRef.current?.duration || 0,
      }));
    }
  };

  // 处理歌曲结束
  const handleSongEnd = () => {
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  };

  // 处理进度条变化
  const handleSeek = (event: Event, newValue: number | number[]) => {
    const seekTime = Array.isArray(newValue) ? newValue[0] : newValue;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setPlayerState((prev) => ({
        ...prev,
        currentTime: seekTime,
      }));
    }
  };

  // 处理音量变化
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const volume = Array.isArray(newValue) ? newValue[0] : newValue;
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      setPlayerState((prev) => ({
        ...prev,
        volume: volume,
        isMuted: volume === 0,
      }));
    }
  };

  // 切换静音
  const toggleMute = () => {
    if (audioRef.current) {
      const isMuted = !playerState.isMuted;
      audioRef.current.muted = isMuted;
      setPlayerState((prev) => ({
        ...prev,
        isMuted: isMuted,
      }));
    }
  };

  // 格式化时间为 MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 切换收藏状态
  const toggleFavorite = async (song: Song) => {
    try {
      const favoriteData: FavoriteCreateData = {
        song_id: song.id,
        song_name: song.name,
        artist_name: song.ar.map((artist) => artist.name).join(", "),
        album_name: song.al.name,
        pic_url: song.al.picUrl,
      };

      const response = await favoriteApi.toggleFavorite(favoriteData);

      setFavoriteStates((prev) => ({
        ...prev,
        [song.id]: response.is_favorite,
      }));

      console.log(response.message);
    } catch (error) {
      console.error("收藏操作失败:", error);
      setError("收藏操作失败，请稍后重试");
    }
  };

  // 检查歌曲收藏状态
  const checkFavoriteStatus = async (songIds: number[]) => {
    try {
      // 过滤掉已经检查过的歌曲ID，避免重复请求
      const uncheckedIds = songIds.filter((id) => !(id in favoriteStates));

      if (uncheckedIds.length === 0) {
        return; // 所有歌曲状态都已检查过
      }

      const promises = uncheckedIds.map((id) => favoriteApi.checkFavorite(id));
      const results = await Promise.all(promises);

      const newFavoriteStates: Record<number, boolean> = {};
      uncheckedIds.forEach((id, index) => {
        newFavoriteStates[id] = results[index].is_favorite;
      });

      setFavoriteStates((prev) => ({ ...prev, ...newFavoriteStates }));
    } catch (error) {
      console.error("检查收藏状态失败:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        pb: 7,
      }}
    >
      {/* 侧边栏 */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "#f8f9fa",
          width: "100%",
          overflow: "auto",
          height: "100vh",
        }}
      >
        {/* 顶部导航栏 */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "white",
            color: "text.primary",
            borderBottom: "1px solid #eee",
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

            <IconButton sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>

            <Typography
              variant="h5"
              sx={{ flexGrow: 1, fontWeight: 500, fontFamily: "ransom" }}
            >
              WHY Music
            </Typography>

            <IconButton onClick={handleMenu}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {user
                ? [
                    <MenuItem key="profile" onClick={handleClose}>
                      <ListItemIcon>
                        <AccountCircle fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{user.nickname || user.email}</ListItemText>
                    </MenuItem>,
                    <MenuItem key="logout" onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>退出登录</ListItemText>
                    </MenuItem>,
                  ]
                : [
                    <MenuItem key="login" onClick={() => navigate("/login")}>
                      <ListItemIcon>
                        <Login fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>登录</ListItemText>
                    </MenuItem>,
                    <MenuItem
                      key="register"
                      onClick={() => navigate("/register")}
                    >
                      <ListItemIcon>
                        <PersonAdd fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>注册</ListItemText>
                    </MenuItem>,
                  ]}
            </Menu>
          </Toolbar>
        </AppBar>

        {/* 主要内容区域 */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* 加载状态 */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* 错误状态 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 歌手详情 */}
          {!loading && !error && artistDetail && (
            <>
              {/* 歌手信息头部 */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Avatar
                      src={artistDetail.artist.picUrl}
                      alt={artistDetail.artist.name}
                      sx={{
                        width: 200,
                        height: 200,
                        mx: "auto",
                        boxShadow: 3,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
                    >
                      {artistDetail.artist.name}
                    </Typography>

                    {artistDetail.artist.alias.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {artistDetail.artist.alias.map((alias, index) => (
                          <Chip
                            key={index}
                            label={alias}
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item>
                        <Typography variant="body1" color="text.secondary">
                          歌曲数:{" "}
                          <strong>{artistDetail.artist.musicSize}</strong>
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body1" color="text.secondary">
                          专辑数:{" "}
                          <strong>{artistDetail.artist.albumSize}</strong>
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body1" color="text.secondary">
                          MV数: <strong>{artistDetail.artist.mvSize}</strong>
                        </Typography>
                      </Grid>
                    </Grid>

                    {artistDetail.artist.briefDesc && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
                        {artistDetail.artist.briefDesc}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* 热门歌曲 */}
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}
              >
                热门歌曲
              </Typography>

              <Grid container spacing={2}>
                {(() => {
                  const startIndex = (page - 1) * itemsPerPage;
                  const paginatedSongs = artistDetail.songs.slice(
                    startIndex,
                    startIndex + itemsPerPage
                  );
                  return paginatedSongs.map((song, index) => (
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
                        onClick={() => playSong(song)}
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
                              {song.al.name}
                            </Typography>
                          </CardContent>

                          {/* 按钮容器 */}
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
                            {/* 收藏按钮 */}
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

                            {/* 播放按钮 */}
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
                                playSong(song);
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
                  ));
                })()}
              </Grid>

              {/* 分页控件 */}
              {artistDetail.songs.length > itemsPerPage && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={Math.ceil(artistDetail.songs.length / itemsPerPage)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Container>

        {/* 底部播放器 */}
        {playerState.currentSongId && currentSongInfo && (
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "background.paper",
              borderTop: "1px solid #eee",
              zIndex: 1000,
              transition: "all 0.3s ease",
            }}
          >
            {/* 展开的歌词和详细信息 */}
            {playerExpanded && (
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid #eee",
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          mr: 2,
                          objectFit: "cover",
                        }}
                        image={currentSongInfo.al.picUrl}
                        alt={currentSongInfo.name}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {currentSongInfo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentSongInfo.ar
                            .map((artist) => artist.name)
                            .join(" / ")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currentSongInfo.al.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {currentLyrics && (
                      <LyricsDisplay
                        lyrics={currentLyrics}
                        currentTime={playerState.currentTime}
                      />
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* 主播放器控制栏 */}
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* 歌曲信息 */}
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 200 }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1,
                      mr: 2,
                      objectFit: "cover",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    image={currentSongInfo.al.picUrl}
                    alt={currentSongInfo.name}
                    onClick={() => setFullScreenLyricsOpen(true)}
                  />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currentSongInfo.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currentSongInfo.ar
                        .map((artist) => artist.name)
                        .join(" / ")}
                    </Typography>
                  </Box>
                </Box>

                {/* 播放控制 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton>
                    <SkipPrevious />
                  </IconButton>
                  <IconButton
                    onClick={() => playSong(currentSongInfo)}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                  >
                    {playerState.isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>
                  <IconButton>
                    <SkipNext />
                  </IconButton>
                </Box>

                {/* 进度条 */}
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <Slider
                    value={playerState.currentTime}
                    max={playerState.duration || 100}
                    onChange={handleSeek}
                    sx={{
                      color: "primary.main",
                      height: 4,
                      "& .MuiSlider-thumb": {
                        width: 12,
                        height: 12,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    <span>{formatTime(playerState.currentTime)}</span>
                    <span>{formatTime(playerState.duration)}</span>
                  </Box>
                </Box>

                {/* 音量控制和展开按钮 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 150,
                  }}
                >
                  <IconButton onClick={toggleMute} size="small">
                    <VolumeUp />
                  </IconButton>
                  <Slider
                    value={playerState.volume}
                    onChange={handleVolumeChange}
                    sx={{
                      width: 80,
                      color: "primary.main",
                      height: 4,
                      "& .MuiSlider-thumb": {
                        width: 12,
                        height: 12,
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => setPlayerExpanded(!playerExpanded)}
                    size="small"
                  >
                    {playerExpanded ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* 全屏歌词 */}
        <FullScreenLyrics
          open={fullScreenLyricsOpen}
          onClose={() => setFullScreenLyricsOpen(false)}
          song={currentSongInfo}
          lyrics={currentLyrics}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          isPlaying={playerState.isPlaying}
          volume={playerState.volume}
          isMuted={playerState.isMuted}
          isFavorite={
            currentSongInfo
              ? favoriteStates[currentSongInfo.id] || false
              : false
          }
          onPlayPause={() => {
            if (currentSongInfo) {
              playSong(currentSongInfo);
            }
          }}
          onVolumeChange={(volume) => handleVolumeChange(null as any, volume)}
          onToggleMute={toggleMute}
          onToggleFavorite={() => {
            if (currentSongInfo) {
              toggleFavorite(currentSongInfo);
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default ArtistDetailPage;

import React, { useEffect, useState } from "react";
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
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { userApi } from "../api/user";
import { searchApi, ArtistDetail, Song } from "../api/search";
import { usePlayer, PlaylistType } from "../contexts/PlayerContext";

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

  // 分页状态
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // 使用全局播放器
  const {
    playerState,
    currentSongInfo,
    favoriteStates,
    playSong,
    toggleFavorite,
    checkFavoriteStatus,
  } = usePlayer();

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
  }, [artistDetail, user, page, checkFavoriteStatus]);

  // 播放歌手的歌曲，创建歌手播放列表
  const handlePlaySong = (song: Song) => {
    if (!artistDetail) return;

    // 创建歌手播放列表，包含所有歌曲
    const artistPlaylist = {
      type: PlaylistType.ARTIST,
      title: `${artistDetail.artist.name} - 热门歌曲`,
      songs: artistDetail.songs.map(s => ({
        id: s.id,
        name: s.name,
        ar: s.ar || [{ name: artistDetail.artist.name }],
        al: {
          name: s.al?.name || '未知专辑',
          picUrl: s.al?.picUrl || 'https://picsum.photos/300/300?random=' + s.id,
          id: s.al?.id
        }
      })),
      currentIndex: 0 // 这会在playSong中被正确设置
    };

    playSong(song, artistPlaylist);
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
                        onClick={() => handlePlaySong(song)}
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
                                handlePlaySong(song);
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
      </Box>
    </Box>
  );
}

export default ArtistDetailPage;

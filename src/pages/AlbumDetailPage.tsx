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
import { searchApi, AlbumDetail, Song } from "../api/search";
import { usePlayer, PlaylistType } from "../contexts/PlayerContext";

// 移除本地播放状态接口，使用全局播放器

function AlbumDetailPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [albumDetail, setAlbumDetail] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 用户信息
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);

  // 使用全局播放器
  const {
    playerState,
    currentSongInfo,
    favoriteStates,
    playSong,
    toggleFavorite,
    checkFavoriteStatus,
    currentLyrics,
  } = usePlayer();

  // 分页状态
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

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

  // 获取专辑详情
  useEffect(() => {
    const fetchAlbumDetail = async () => {
      if (!albumId) {
        setError("专辑ID不存在");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 检查albumId是否为数字ID
        const isNumericId = /^\d+$/.test(albumId);

        if (isNumericId) {
          // 如果是数字ID，直接获取专辑详情
          const response = await searchApi.getAlbumDetail(parseInt(albumId));
          if (response.code === 200 && response.data.length > 0) {
            setAlbumDetail(response.data[0]);
          } else {
            setError("获取专辑信息失败");
          }
        } else {
          // 如果是专辑名称，先搜索获取专辑ID
          const decodedName = decodeURIComponent(albumId);
          const searchResponse = await searchApi.searchByAlbum({
            keyword: decodedName,
          });

          if (searchResponse.code === 200 && searchResponse.data.length > 0) {
            // 找到第一个匹配的专辑
            const album = searchResponse.data[0] as any;
            const response = await searchApi.getAlbumDetail(album.id);

            if (response.code === 200 && response.data.length > 0) {
              setAlbumDetail(response.data[0]);
            } else {
              setError("获取专辑信息失败");
            }
          } else {
            setError(`未找到专辑: ${decodedName}`);
          }
        }
      } catch (err) {
        setError("获取专辑信息失败");
        console.error("获取专辑详情失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetail();
  }, [albumId]);

  // 检查当前页歌曲的收藏状态
  useEffect(() => {
    if (albumDetail?.songs && user) {
      // 只检查当前页的歌曲
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedSongs = albumDetail.songs.slice(
        startIndex,
        startIndex + itemsPerPage
      );
      const songIds = paginatedSongs.map((song) => song.id);
      checkFavoriteStatus(songIds);
    }
  }, [albumDetail, user, page, checkFavoriteStatus]);

  // 播放专辑的歌曲，创建专辑播放列表
  const handlePlaySong = (song: Song) => {
    if (!albumDetail) return;

    // 创建专辑播放列表，包含所有歌曲
    const albumPlaylist = {
      type: PlaylistType.ALBUM,
      title: `${albumDetail.album.name} - ${albumDetail.album.artist.name}`,
      songs: albumDetail.songs.map(s => ({
        id: s.id,
        name: s.name,
        ar: s.ar || [{ name: albumDetail.album.artist.name }],
        al: {
          name: s.al?.name || albumDetail.album.name,
          picUrl: s.al?.picUrl || albumDetail.album.picUrl,
          id: s.al?.id || albumDetail.album.id
        }
      })),
      currentIndex: 0 // 这会在playSong中被正确设置
    };

    playSong(song, albumPlaylist);
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

          {/* 专辑详情 */}
          {!loading && !error && albumDetail && (
            <>
              {/* 专辑信息头部 */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <CardMedia
                      component="img"
                      sx={{
                        width: 250,
                        height: 250,
                        mx: "auto",
                        borderRadius: 2,
                        boxShadow: 3,
                        objectFit: "cover",
                      }}
                      image={albumDetail.album.picUrl}
                      alt={albumDetail.album.name}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
                    >
                      {albumDetail.album.name}
                    </Typography>

                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 2, cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/artist/${albumDetail.album.artist.id}`)
                      }
                    >
                      {albumDetail.album.artist.name}
                    </Typography>

                    {albumDetail.album.alias.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {albumDetail.album.alias.map((alias, index) => (
                          <Chip
                            key={index}
                            label={alias}
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}

                    {albumDetail.album.company && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        发行公司: <strong>{albumDetail.album.company}</strong>
                      </Typography>
                    )}

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      歌曲数: <strong>{albumDetail.songs.length}</strong>
                    </Typography>

                    {albumDetail.album.description && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
                        {albumDetail.album.description}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* 专辑歌曲 */}
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}
              >
                专辑歌曲
              </Typography>

              <Grid container spacing={2}>
                {(() => {
                  const startIndex = (page - 1) * itemsPerPage;
                  const paginatedSongs = albumDetail.songs.slice(
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
                              {song.ar.map((artist) => artist.name).join(" / ")}
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
              {albumDetail.songs.length > itemsPerPage && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={Math.ceil(albumDetail.songs.length / itemsPerPage)}
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

export default AlbumDetailPage;

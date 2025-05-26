import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Login,
  PersonAdd,
  Favorite as FavoriteIcon,
  Delete,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { userApi } from "../api/user";
import { favoriteApi, Favorite } from "../api/favorite";
import { usePlayer } from "../contexts/PlayerContext";

function FavoritesPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // 用户信息
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);

  // 使用全局播放器
  const { playerState, playSong } = usePlayer();

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

  // 播放收藏的歌曲
  const playFavoriteSong = async (favorite: Favorite) => {
    // 将收藏数据转换为Song格式
    const song = {
      id: favorite.song_id,
      name: favorite.song_name,
      ar: [{ name: favorite.artist_name }],
      al: {
        name: favorite.album_name,
        picUrl: favorite.pic_url,
      },
    };

    await playSong(song);
  };

  // 获取收藏列表
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await favoriteApi.getFavorites();
        if (response.code === 200 && response.data) {
          setFavorites(response.data);
        }
      } catch (err) {
        setError("获取收藏列表失败");
        console.error("获取收藏列表失败:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // 取消收藏
  const removeFavorite = async (favorite: Favorite) => {
    try {
      await favoriteApi.toggleFavorite({
        song_id: favorite.song_id,
        song_name: favorite.song_name,
        artist_name: favorite.artist_name,
        album_name: favorite.album_name,
        pic_url: favorite.pic_url,
      });

      // 从列表中移除
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
    } catch (error) {
      console.error("取消收藏失败:", error);
      setError("取消收藏失败，请稍后重试");
    }
  };

  // 分页逻辑
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedFavorites = favorites.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        pb: 7, // 为底部播放器留出空间
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
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 3,
              display: "flex",
              alignItems: "center",
              color: "text.primary",
            }}
          >
            <FavoriteIcon sx={{ mr: 2, color: "error.main" }} />
            我的收藏
          </Typography>

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

          {/* 收藏列表 */}
          {!loading && !error && (
            <>
              {favorites.length > 0 ? (
                <>
                  <Grid container spacing={2}>
                    {paginatedFavorites.map((favorite) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={favorite.id}>
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
                              playerState.currentSongId === favorite.song_id
                                ? "2px solid"
                                : "1px solid transparent",
                            borderColor:
                              playerState.currentSongId === favorite.song_id
                                ? "primary.main"
                                : "transparent",
                          }}
                          onClick={() => playFavoriteSong(favorite)}
                        >
                          <CardMedia
                            component="img"
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "8px 0 0 8px",
                              objectFit: "cover",
                            }}
                            image={favorite.pic_url}
                            alt={favorite.song_name}
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
                                {favorite.song_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "primary.main",
                                    textDecoration: "underline",
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // 优先使用歌手ID，如果没有则使用歌手名称
                                  const artistIdentifier = favorite.artist_id
                                    ? favorite.artist_id
                                    : encodeURIComponent(favorite.artist_name);
                                  navigate(`/artist/${artistIdentifier}`);
                                }}
                              >
                                {favorite.artist_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "primary.main",
                                    textDecoration: "underline",
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // 优先使用专辑ID，如果没有则使用专辑名称
                                  const albumIdentifier = favorite.album_id
                                    ? favorite.album_id
                                    : encodeURIComponent(favorite.album_name);
                                  navigate(`/album/${albumIdentifier}`);
                                }}
                              >
                                {favorite.album_name}
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
                              {/* 播放按钮 */}
                              <IconButton
                                size="small"
                                sx={{
                                  color:
                                    playerState.currentSongId ===
                                      favorite.song_id && playerState.isPlaying
                                      ? "primary.main"
                                      : "text.secondary",
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playFavoriteSong(favorite);
                                }}
                              >
                                {playerState.currentSongId ===
                                  favorite.song_id && playerState.isPlaying ? (
                                  <Pause fontSize="small" />
                                ) : (
                                  <PlayArrow fontSize="small" />
                                )}
                              </IconButton>

                              {/* 删除收藏按钮 */}
                              <IconButton
                                size="small"
                                sx={{
                                  color: "error.main",
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFavorite(favorite);
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* 分页 */}
                  {favorites.length > itemsPerPage && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <Pagination
                        count={Math.ceil(favorites.length / itemsPerPage)}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    还没有收藏任何歌曲
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    去搜索页面发现喜欢的音乐吧！
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default FavoritesPage;

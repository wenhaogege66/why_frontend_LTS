// src/pages/SearchResultsPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Toolbar,
  TextField,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Switch,
  FormControlLabel,
  Chip
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Menu as MenuIcon,
  Search,
  Notifications,
  AccountCircle,
  Logout,
  Login,
  PersonAdd,
  SmartToy,
  MusicNote,
  Person,
  Album,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import {
  unifiedSearch,
  UnifiedSearchResults,
  Song,
  normalSearch,
  NormalSearchResults,
  ArtistResult,
  AlbumResult,
  searchByTitle,     
  searchByArtist,    
  searchByAlbum, 
} from "../api/search";
import Sidebar from "../components/Sidebar";
import { userApi } from "../api/user";
import LyricsDisplay from "../components/LyricsDisplay";
import { usePlayer } from "../contexts/PlayerContext";
import { Tabs, Tab } from "@mui/material";
import { titleSearch } from "../api/search";

// 移除本地播放状态接口，使用全局播放器

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const query = searchParams.get("q");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [songPage, setSongPage] = useState(1);
  const [artistPage, setArtistPage] = useState(1);
  const [albumPage, setAlbumPage] = useState(1);
  const itemsPerPage = 12;
  

  //分类展示
  const [resultTab, setResultTab] = useState<"songs" | "artists" | "albums" | "byTitle">("songs");
  const [byTitleResult, setByTitleResult] = useState<any>(null);

  
  // AI搜索切换状态
  const [isAISearch, setIsAISearch] = useState(false);

  // 搜索结果状态
  const [aiSearchResults, setAiSearchResults] =
    useState<UnifiedSearchResults | null>(null);
  const [normalSearchResults, setNormalSearchResults] =
    useState<NormalSearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  // 添加独立的主题推荐loading状态
  const [titleLoading, setTitleLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

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

  // 处理搜索输入框变化的事件
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  // 处理搜索框按键事件（特に回车键）
  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault(); // 阻止默认的表单提交行为
      if (searchQuery.trim()) {
        // 如果输入框不为空白字符
        // 导航到 /search 路由，并将查询内容作为 URL 参数 'q' 传递
        // encodeURIComponent 用于编码特殊字符，防止 URL 问题
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        // 可选：清空搜索框
        setSearchQuery("");
      }
    }
  };

  const handleSearchSubmit = () => {
    // 这里放你的搜索逻辑
    console.log("执行搜索:", searchQuery);
    if (searchQuery.trim()) {
      // 如果输入框不为空白字符
      // 导航到 /search 路由，并将查询内容作为 URL 参数 'q' 传递
      // encodeURIComponent 用于编码特殊字符，防止 URL 问题
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // 可选：清空搜索框
      setSearchQuery("");
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

  // 搜索Tab切换
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setResultTab(newValue as any);
    setNormalSearchResults(null);
    setByTitleResult(null);
  };

  // 使用 useEffect 在 query 变化时触发搜索
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setLoading(false);
        setTitleLoading(false);
        setAiSearchResults(null);
        setNormalSearchResults(null);
        setByTitleResult(null);
        setError("请输入搜索内容");
        return;
      }

      // setLoading(true);
      setAiSearchResults(null);
      setNormalSearchResults(null);
      setByTitleResult(null);
      setError(null);
      setSongPage(1); // 重置分页到第一页
      setArtistPage(1);
      setAlbumPage(1);

      try {
        if (isAISearch) {
          // AI搜索
          setLoading(true);
          const results = await unifiedSearch({ query: query });
          setAiSearchResults(results);
          setLoading(false);
        } else {
          // 普通搜索
          // const results = await normalSearch({ keyword: query });
          // setNormalSearchResults(results);
          if (resultTab === "byTitle") {
            setTitleLoading(true);  // 使用独立的loading状态
            const res = await titleSearch({ title: query });
            setByTitleResult(res);
            setTitleLoading(false);
          } else {
            setLoading(true);
            if (resultTab === "songs") {
              const res = await searchByTitle({ keyword: query });
              setNormalSearchResults({ songs: res.data as Song[], artists: [], albums: [] });
            } else if (resultTab === "artists") {
              const res = await searchByArtist({ keyword: query });
              setNormalSearchResults({ songs: [], artists: res.data as ArtistResult[], albums: [] });
            } else if (resultTab === "albums") {
              const res = await searchByAlbum({ keyword: query });
              setNormalSearchResults({ albums: res.data as AlbumResult[] });
            }
            setLoading(false);
          }
        }
      } catch (err) {
        setError("搜索过程中发生错误");
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
        setTitleLoading(false);
      }
    };

    performSearch();
  }, [query, isAISearch, resultTab]);

  // 检查当前页歌曲的收藏状态
  useEffect(() => {
    const songIds: number[] = [];

    if (isAISearch && aiSearchResults) {
      // AI搜索结果不分页，检查所有歌曲
      aiSearchResults.byDescription?.data?.forEach((song) =>
        songIds.push(song.id)
      );
      // aiSearchResults.byMood?.data?.forEach((song) => songIds.push(song.id));
      // aiSearchResults.byTitle?.data?.forEach((song) => songIds.push(song.id));
    } else if (!isAISearch && normalSearchResults?.songs) {
      // 普通搜索结果只检查当前页的歌曲
      const startIndex = (songPage - 1) * itemsPerPage;
      const paginatedSongs = normalSearchResults.songs.slice(
        startIndex,
        startIndex + itemsPerPage
      );
      paginatedSongs.forEach((song) => songIds.push(song.id));
    }

    if (songIds.length > 0 && user) {
      checkFavoriteStatus(songIds);
    }
  }, [
    aiSearchResults,
    normalSearchResults,
    user,
    isAISearch,
    songPage,
    checkFavoriteStatus,
  ]);

  // 获取歌曲信息
  const getSongInfo = (songId: number): Song | null => {
    // 从搜索结果中查找歌曲信息
    if (isAISearch && aiSearchResults) {
      const allSongs = [
        ...(aiSearchResults.byDescription?.data || []),
        // ...(aiSearchResults.byMood?.data || []),
        // ...(aiSearchResults.byTitle?.data || []),
      ];
      return allSongs.find((song) => song.id === songId) || null;
    } else if (!isAISearch && normalSearchResults?.songs) {
      return (
        normalSearchResults.songs.find((song) => song.id === songId) || null
      );
    }
    return null;
  };

  // 播放歌曲的包装函数
  const handlePlaySong = (songId: number) => {
    const songInfo = getSongInfo(songId);
    if (songInfo) {
      playSong(songInfo);
    }
  };

  // 渲染歌曲列表
  const renderSongList = (songs: Song[] | undefined, title: string) => {
    if (!songs || songs.length === 0) {
      return null;
    }

    // 分页逻辑
    const startIndex = (songPage - 1) * itemsPerPage;
    const paginatedSongs = songs.slice(startIndex, startIndex + itemsPerPage);

    return (
      <Box sx={{ mb: 4 }}>
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
          {title}
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
                    minWidth: 0, // 允许收缩
                  }}
                >
                  <CardContent
                    sx={{
                      flex: "1 0 auto",
                      py: 1,
                      "&:last-child": { pb: 1 },
                      pr: 8, // 为两个按钮留出空间
                      minWidth: 0, // 允许内容收缩
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
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

  // 渲染歌手列表
  const renderArtistList = (artists: ArtistResult[] | undefined) => {
    if (!artists || artists.length === 0) {
      return null;
    }

    // 分页逻辑
    const startIndex = (artistPage - 1) * itemsPerPage;
    const paginatedArtists = artists.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return (
      <Box sx={{ mb: 4 }}>
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
          <Person sx={{ mr: 1, color: "primary.main" }} />
          歌手
        </Typography>
        <Grid container spacing={2}>
          {paginatedArtists.map((artist) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={artist.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                    objectFit: "cover",
                  }}
                  image={artist.picUrl}
                  alt={artist.name}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {artist.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    专辑: {artist.albumSize} | MV: {artist.mvSize}
                  </Typography>
                  {artist.alias.length > 0 && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      别名: {artist.alias.join(", ")}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {artists.length > itemsPerPage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={Math.ceil(artists.length / itemsPerPage)}
              page={artistPage}
              onChange={(_, value) => setArtistPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    );
  };

  // 渲染专辑列表
  const renderAlbumList = (albums: AlbumResult[] | undefined) => {
    if (!albums || albums.length === 0) {
      return null;
    }

    // 分页逻辑
    const startIndex = (albumPage - 1) * itemsPerPage;
    const paginatedAlbums = albums.slice(startIndex, startIndex + itemsPerPage);

    return (
      <Box sx={{ mb: 4 }}>
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
          <Album sx={{ mr: 1, color: "primary.main" }} />
          专辑
        </Typography>
        <Grid container spacing={2}>
          {paginatedAlbums.map((album) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={album.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => navigate(`/album/${album.id}`)}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                    objectFit: "cover",
                  }}
                  image={album.picUrl}
                  alt={album.name}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {album.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {album.artists.map((artist) => artist.name).join(", ")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    歌曲数: {album.size}
                  </Typography>
                  {album.company && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      发行: {album.company}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {albums.length > itemsPerPage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={Math.ceil(albums.length / itemsPerPage)}
              page={albumPage}
              onChange={(_, value) => setAlbumPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        pb: 7, // 为播放器留出空间
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

            {/* 搜索框 TextField 和搜索按钮 */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* AI搜索开关 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={isAISearch}
                    onChange={(e) => setIsAISearch(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                    <SmartToy
                      sx={{
                        mr: 0.5,
                        fontSize: "1.2rem",
                        color: isAISearch ? "primary.main" : "text.secondary",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: isAISearch ? "primary.main" : "text.secondary",
                      }}
                    >
                      AI搜索
                    </Typography>
                  </Box>
                }
                sx={{
                  mr: 2,
                  mb: 0,
                }}
              />
              <TextField
                variant="outlined"
                placeholder="搜索歌曲或歌手..."
                size="small"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
                sx={{
                  width: 400,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "4px 0 0 4px",
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchSubmit}
                sx={{
                  borderRadius: "0 4px 4px 0",
                  minWidth: "auto",
                  px: 2,
                }}
              >
                <Search />
              </Button>
            </Box>

            <IconButton sx={{ ml: 2 }}>
              <Notifications />
            </IconButton>

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

          {/* 结果类型选择Bar */}
          {!isAISearch && (
            <Tabs
              value={resultTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="歌曲" value="songs" />
              <Tab label="歌手" value="artists" />
              <Tab label="专辑" value="albums" />
              <Tab label="主题相关推荐" value="byTitle" />
            </Tabs>
          )}

          {/* 加载状态 */}
          {/* {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )} */}

          {/* 错误状态 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 搜索结果 */}
          {!error && (
            <>
              {isAISearch 
                ? (loading 
                    ? <Box sx={{ textAlign: "center", py: 6 }}>
                        <CircularProgress size={24} sx={{ mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          稍等一下噢o(*￣▽￣*)ブ 正在使用 AI 为您推荐描述相关歌曲...
                        </Typography>
                      </Box>
                    : aiSearchResults && renderSongList(
                        aiSearchResults.byDescription?.data, 
                        "描述搜索结果"
                      )
                  )
                : (
                  <>
                    {resultTab === "byTitle" ? (
                      <>
                        {titleLoading || !byTitleResult ? (
                          <Box sx={{ textAlign: "center", py: 6 }}>
                            <CircularProgress size={24} sx={{ mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                              稍等一下噢o(*￣▽￣*)ブ 正在使用 AI 为您推荐主题相关歌曲...
                            </Typography>
                          </Box>
                        ) : (
                          renderSongList(byTitleResult.data, "主题相关歌曲推荐")
                        )}
                      </>
                    ) : (
                      loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <>
                          {resultTab === "songs" && renderSongList(normalSearchResults?.songs, "歌曲")}
                          {resultTab === "artists" && renderArtistList(normalSearchResults?.artists)}
                          {resultTab === "albums" && renderAlbumList(normalSearchResults?.albums)}
                        </>
                      )
                    )}
                  </>
                )
              }

              {/* 无结果提示 */}
              {!loading && !titleLoading &&((isAISearch &&
                aiSearchResults &&
                !aiSearchResults.byDescription?.data?.length) ||
                (!isAISearch &&
                  (
                    (resultTab === "songs" && (!normalSearchResults?.songs || normalSearchResults.songs.length === 0)) ||
                    (resultTab === "artists" && (!normalSearchResults?.artists || normalSearchResults.artists.length === 0)) ||
                    (resultTab === "albums" && (!normalSearchResults?.albums || normalSearchResults.albums.length === 0)) ||
                    (resultTab === "byTitle" && (!byTitleResult?.data || byTitleResult.data.length === 0))
                  )
                )) && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    没有找到相关结果
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    请尝试使用其他关键词或切换搜索模式
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Container>

        {/* 歌词显示 - 右下角小窗口 */}
        {playerState.currentSongId && currentLyrics && (
          <Box
            sx={{
              position: "fixed",
              bottom: 100,
              right: 20,
              width: 300,
              maxHeight: 400,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 3,
              p: 2,
              zIndex: 999,
            }}
          >
            <LyricsDisplay
              lyrics={currentLyrics}
              currentTime={playerState.currentTime}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SearchResultsPage;

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
  Tabs,
  Tab
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
import { usePlayer, PlaylistType } from "../contexts/PlayerContext";
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

  // 从 URL 参数中获取 ai 参数,并设置初始 isAISearch 状态
  const aiParam = searchParams.get("ai");
  const [isAISearch, setIsAISearch] = useState(aiParam === "1");
  
  // AI搜索切换状态
  // const [isAISearch, setIsAISearch] = useState(false);

  // 搜索结果状态
  const [aiSearchResults, setAiSearchResults] =
    useState<UnifiedSearchResults | null>(null);
  const [normalSearchResults, setNormalSearchResults] =
    useState<NormalSearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  // 添加独立的主题推荐loading状态
  const [titleLoading, setTitleLoading] = useState(false);
  // 添加搜索状态，用于防止搜索过程中显示无结果提示
  const [isSearching, setIsSearching] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // 使用全局播放器
  const {
    playerState,
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
      // navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // 可选：清空搜索框
      const url = `/search?q=${encodeURIComponent(searchQuery.trim())}${isAISearch ? "&ai=1" : ""}`;
      navigate(url);
      setSearchQuery('');
    }
  };

  // 处理"立即搜索"按钮点击 - 使用当前查询词重新搜索
  const handleImmediateSearch = () => {
    if (query) {
      const url = `/search?q=${encodeURIComponent(query)}${isAISearch ? "&ai=1" : ""}`;
      navigate(url);
    }
  };

  // 修改 AI 搜索切换处理器
  const handleAISearchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsAISearch = e.target.checked;
    setIsAISearch(newIsAISearch);
    // 移除自动搜索逻辑，只切换模式状态
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
    const abortController = new AbortController();
    
    const performSearch = async () => {
      if (!query) {
        setLoading(false);
        setTitleLoading(false);
        setIsSearching(false);
        setAiSearchResults(null);
        setNormalSearchResults(null);
        setByTitleResult(null);
        setError("请输入搜索内容");
        return;
      }

      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return;
      }

      // 从URL参数直接读取AI搜索状态，确保与URL同步
      const currentAiParam = searchParams.get("ai");
      const currentIsAISearch = currentAiParam === "1";

      // 立即设置搜索状态，防止显示无结果提示
      setIsSearching(true);

      // 立即设置loading状态，避免在清空结果和设置loading之间出现无结果提示
      if (currentIsAISearch) {
        setLoading(true);
      } else if (resultTab === "byTitle") {
        setTitleLoading(true);
      } else {
        setLoading(true);
      }

      // 清空之前的搜索结果
      setAiSearchResults(null);
      setNormalSearchResults(null);
      setByTitleResult(null);
      setError(null);
      setSongPage(1); // 重置分页到第一页
      setArtistPage(1);
      setAlbumPage(1);

      try {
        if (currentIsAISearch) {
          // AI搜索
          const results = await unifiedSearch({ query: query });
          
          // 检查请求是否被取消
          if (!abortController.signal.aborted) {
            setAiSearchResults(results);
          }
          setLoading(false);
        } else {
          // 普通搜索
          if (resultTab === "byTitle") {
            const res = await titleSearch({ title: query });
            
            if (!abortController.signal.aborted) {
              setByTitleResult(res);
            }
            setTitleLoading(false);
          } else {
            if (resultTab === "songs") {
              const res = await searchByTitle({ keyword: query });
              if (!abortController.signal.aborted) {
                setNormalSearchResults({ songs: res.data as Song[], artists: [], albums: [] });
              }
            } else if (resultTab === "artists") {
              const res = await searchByArtist({ keyword: query });
              if (!abortController.signal.aborted) {
                setNormalSearchResults({ songs: [], artists: res.data as ArtistResult[], albums: [] });
              }
            } else if (resultTab === "albums") {
              const res = await searchByAlbum({ keyword: query });
              if (!abortController.signal.aborted) {
                setNormalSearchResults({ albums: res.data as AlbumResult[] });
              }
            }
            setLoading(false);
          }
        }
      } catch (err) {
        // 如果是请求被取消，不显示错误
        if (!abortController.signal.aborted) {
          setError("搜索过程中发生错误");
          console.error("Search failed:", err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
          setTitleLoading(false);
          setIsSearching(false); // 搜索完成，重置搜索状态
        }
      }
    };

    performSearch();

    // 清理函数：取消正在进行的请求
    return () => {
      abortController.abort();
    };
  }, [query, resultTab, searchParams]); // 添加 searchParams 作为依赖

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
      // 创建播放列表
      let playlist: { type: PlaylistType; title: string; songs: Song[]; currentIndex: number } | undefined = undefined;
      let songs: Song[] = [];
      let playlistTitle = "";

      if (isAISearch && aiSearchResults) {
        // AI搜索结果播放列表
        songs = aiSearchResults.byDescription?.data || [];
        playlistTitle = `AI搜索: ${query}`;
      } else if (!isAISearch) {
        if (resultTab === "songs" && normalSearchResults?.songs) {
          songs = normalSearchResults.songs;
          playlistTitle = `搜索歌曲: ${query}`;
        } else if (resultTab === "byTitle" && byTitleResult?.data) {
          songs = byTitleResult.data;
          playlistTitle = `主题推荐: ${query}`;
        }
      }

      if (songs.length > 0) {
        playlist = {
          type: PlaylistType.SEARCH_RESULTS,
          title: playlistTitle,
          songs: songs,
          currentIndex: 0 // 这会在playSong中被正确设置
        };
      }

      playSong(songInfo, playlist);
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
                  minHeight: "100px", // 增加最小高度以容纳更多内容
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
                    width: 100,
                    height: "100%", // 改为100%以填满整个卡片高度
					minHeight: 100, // 确保最小高度匹配卡片高度
					maxHeight: 100,
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
                      minHeight: "80px", // 确保内容区域有足够高度
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                        }}
                      >
                        {song.ar.map((artist, index) => (
                          <span key={artist.id}>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                color: "primary.main",
                                cursor: "pointer",
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/artist/${artist.id}`);
                              }}
                            >
                              {artist.name}
                            </Typography>
                            {index < song.ar.length - 1 && (
                              <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}> / </span>
                            )}
                          </span>
                        ))}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            textDecoration: "underline",
                            color: "primary.main",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/album/${song.al.id}`);
                        }}
                      >
                        {song.al.name}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* 按钮容器 */}
                  <Box
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)", // 居中对齐
                      display: "flex",
                      flexDirection: "column", // 垂直排列
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
                  height: 320, // 设置固定高度
                  display: "flex",
                  flexDirection: "column",
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
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                    {artist.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    专辑: {artist.albumSize} | MV: {artist.mvSize}
                  </Typography>
                  {artist.alias.length > 0 && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
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
                  height: 360, // 设置固定高度（专辑内容较多，稍微高一些）
                  display: "flex",
                  flexDirection: "column",
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
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                    {album.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mb: 1,
                    }}
                  >
                    {album.artists.map((artist, index) => (
                      <span key={artist.id}>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/artist/${artist.id}`);
                          }}
                        >
                          {artist.name}
                        </Typography>
                        {index < album.artists.length - 1 && (
                          <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>, </span>
                        )}
                      </span>
                    ))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    歌曲数: {album.size}
                  </Typography>
                  {album.company && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
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
        pb: 13, // 为播放器留出空间
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
                    // onChange={(e) => setIsAISearch(e.target.checked)}
                    onChange={handleAISearchToggle}  // 使用新的处理器
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
          {/* 搜索提示信息 */}
          {query && !loading && !titleLoading && !isSearching && !error && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.875rem',
                  mb: 1
                }}
              >
                {(() => {
                  // 计算搜索结果数量
                  let totalResults = 0;
                  let resultType = '';
                  
                  if (isAISearch) {
                    totalResults = aiSearchResults?.byDescription?.data?.length || 0;
                    resultType = '首歌曲';
                  } else {
                    if (resultTab === 'songs') {
                      totalResults = normalSearchResults?.songs?.length || 0;
                      resultType = '首歌曲';
                    } else if (resultTab === 'artists') {
                      totalResults = normalSearchResults?.artists?.length || 0;
                      resultType = '个歌手';
                    } else if (resultTab === 'albums') {
                      totalResults = normalSearchResults?.albums?.length || 0;
                      resultType = '张专辑';
                    } else if (resultTab === 'byTitle') {
                      totalResults = byTitleResult?.data?.length || 0;
                      resultType = '首相关歌曲';
                    }
                  }
                  
                  return `搜索"${query}"，找到 ${totalResults} ${resultType}`;
                })()}
              </Typography>
            </Box>
          )}

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
              {/* 模式切换提示 */}
              {query && (
                (() => {
                  // 检查是否需要显示模式切换提示
                  const hasCurrentModeResults = isAISearch 
                    ? (aiSearchResults?.byDescription?.data?.length || 0) > 0
                    : (
                        (resultTab === "songs" && (normalSearchResults?.songs?.length || 0) > 0) ||
                        (resultTab === "artists" && (normalSearchResults?.artists?.length || 0) > 0) ||
                        (resultTab === "albums" && (normalSearchResults?.albums?.length || 0) > 0) ||
                        (resultTab === "byTitle" && (byTitleResult?.data?.length || 0) > 0)
                      );
                  
                  const hasOtherModeResults = !isAISearch 
                    ? (aiSearchResults?.byDescription?.data?.length || 0) > 0
                    : (
                        (normalSearchResults?.songs?.length || 0) > 0 ||
                        (normalSearchResults?.artists?.length || 0) > 0 ||
                        (normalSearchResults?.albums?.length || 0) > 0 ||
                        (byTitleResult?.data?.length || 0) > 0
                      );

                  // 如果当前模式没有结果但其他模式有结果，显示切换提示
                  if (!hasCurrentModeResults && hasOtherModeResults && !loading && !titleLoading && !isSearching) {
                    return (
                      <Alert 
                        severity="info" 
                        sx={{ mb: 3 }}
                        action={
                          <Button 
                            color="inherit" 
                            size="small"
                            onClick={handleImmediateSearch}
                          >
                            立即搜索
                          </Button>
                        }
                      >
                        已切换到{isAISearch ? 'AI搜索' : '普通搜索'}模式，点击"立即搜索"或重新输入关键词以获取新结果
                      </Alert>
                    );
                  }
                  return null;
                })()
              )}

              {/* 显示当前模式的结果，如果没有则显示其他模式的结果 */}
              {(() => {
                if (isAISearch) {
                  if (loading) {
                    return (
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <CircularProgress size={24} sx={{ mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          稍等一下噢o(*￣▽￣*)ブ 正在使用 AI 为您推荐描述相关歌曲...
                        </Typography>
                      </Box>
                    );
                  } else if (aiSearchResults?.byDescription?.data?.length) {
                    return renderSongList(aiSearchResults.byDescription.data, "AI搜索结果");
                  } else {
                    // AI搜索没有结果，尝试显示普通搜索结果
                    if (normalSearchResults?.songs?.length) {
                      return (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                            以下是普通搜索的结果，切换到AI搜索模式后点击搜索获取AI推荐
                          </Typography>
                          {renderSongList(normalSearchResults.songs, "歌曲 (普通搜索)")}
                        </>
                      );
                    } else if (normalSearchResults?.artists?.length) {
                      return (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                            以下是普通搜索的结果，切换到AI搜索模式后点击搜索获取AI推荐
                          </Typography>
                          {renderArtistList(normalSearchResults.artists)}
                        </>
                      );
                    } else if (normalSearchResults?.albums?.length) {
                      return (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                            以下是普通搜索的结果，切换到AI搜索模式后点击搜索获取AI推荐
                          </Typography>
                          {renderAlbumList(normalSearchResults.albums)}
                        </>
                      );
                    } else if (byTitleResult?.data?.length) {
                      return (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                            以下是主题推荐的结果，切换到AI搜索模式后点击搜索获取AI推荐
                          </Typography>
                          {renderSongList(byTitleResult.data, "主题相关歌曲推荐")}
                        </>
                      );
                    }
                  }
                } else {
                  // 普通搜索模式
                  if (resultTab === "byTitle") {
                    if (titleLoading) {
                      return (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <CircularProgress size={24} sx={{ mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            稍等一下噢o(*￣▽￣*)ブ 正在使用 AI 为您推荐主题相关歌曲...
                          </Typography>
                        </Box>
                      );
                    } else if (byTitleResult?.data?.length) {
                      return renderSongList(byTitleResult.data, "主题相关歌曲推荐");
                    }
                  } else if (loading) {
                    return (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                      </Box>
                    );
                  } else {
                    // 显示当前tab的结果
                    if (resultTab === "songs" && normalSearchResults?.songs?.length) {
                      return renderSongList(normalSearchResults.songs, "歌曲");
                    } else if (resultTab === "artists" && normalSearchResults?.artists?.length) {
                      return renderArtistList(normalSearchResults.artists);
                    } else if (resultTab === "albums" && normalSearchResults?.albums?.length) {
                      return renderAlbumList(normalSearchResults.albums);
                    }
                  }

                  // 普通搜索当前tab没有结果，尝试显示AI搜索结果
                  if (aiSearchResults?.byDescription?.data?.length) {
                    return (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                          以下是AI搜索的结果，切换搜索类型或重新搜索获取更多结果
                        </Typography>
                        {renderSongList(aiSearchResults.byDescription.data, "AI搜索结果")}
                      </>
                    );
                  }
                }

                return null;
              })()}

              {/* 无结果提示 */}
              {!loading && !titleLoading && !isSearching && query && 
                !(aiSearchResults?.byDescription?.data?.length) &&
                !(normalSearchResults?.songs?.length) &&
                !(normalSearchResults?.artists?.length) &&
                !(normalSearchResults?.albums?.length) &&
                !(byTitleResult?.data?.length) && (
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

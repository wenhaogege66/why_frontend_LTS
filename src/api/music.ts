import axios from "axios";

// const API_BASE_URL = 'http://10.214.241.127:8000';
const API_BASE_URL = "http://localhost:8000";
// 使用相同的axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除token并跳转到登录页
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 歌曲相关接口
export const getSongs = async (params?: any) => {
  try {
    const response = await api.get("/api/music/songs/", { params });
    return response.data;
  } catch (error) {
    console.error("获取歌曲列表失败:", error);
    throw error;
  }
};

export const getSongById = async (id: number) => {
  try {
    const response = await api.get(`/api/music/songs/${id}/`);
    return response.data;
  } catch (error) {
    console.error("获取歌曲详情失败:", error);
    throw error;
  }
};

export const playSong = async (id: number) => {
  try {
    const response = await api.post(`/api/music/songs/${id}/play/`);
    return response.data;
  } catch (error) {
    console.error("记录播放失败:", error);
    throw error;
  }
};

// 收藏相关接口
export const addFavorite = async (songId: number) => {
  try {
    const response = await api.post(`/api/music/songs/${songId}/favorite/`);
    return response.data;
  } catch (error) {
    console.error("添加收藏失败:", error);
    throw error;
  }
};

export const removeFavorite = async (songId: number) => {
  try {
    const response = await api.post(`/api/music/songs/${songId}/unfavorite/`);
    return response.data;
  } catch (error) {
    console.error("取消收藏失败:", error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const response = await api.get("/api/music/favorites/");
    return response.data;
  } catch (error) {
    console.error("获取收藏列表失败:", error);
    throw error;
  }
};

// 评分相关接口
export const rateSong = async (songId: number, score: number) => {
  try {
    const response = await api.post(`/api/music/songs/${songId}/rate/`, {
      score,
    });
    return response.data;
  } catch (error) {
    console.error("评分失败:", error);
    throw error;
  }
};

// 评论相关接口
export const addComment = async (songId: number, content: string) => {
  try {
    const response = await api.post(`/api/music/songs/${songId}/comment/`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error("添加评论失败:", error);
    throw error;
  }
};

export const getComments = async (songId: number) => {
  try {
    const response = await api.get(`/api/music/songs/${songId}/comments/`);
    return response.data;
  } catch (error) {
    console.error("获取评论列表失败:", error);
    throw error;
  }
};

// 播放列表相关接口
export const getPlaylists = async () => {
  try {
    const response = await api.get("/api/music/playlists/");
    return response.data;
  } catch (error) {
    console.error("获取播放列表失败:", error);
    throw error;
  }
};

export const getPlaylistById = async (id: number) => {
  try {
    const response = await api.get(`/api/music/playlists/${id}/`);
    return response.data;
  } catch (error) {
    console.error("获取播放列表详情失败:", error);
    throw error;
  }
};

export const createPlaylist = async (
  title: string,
  isPublic: boolean = true
) => {
  try {
    const response = await api.post("/api/music/playlists/", {
      title,
      is_public: isPublic,
    });
    return response.data;
  } catch (error) {
    console.error("创建播放列表失败:", error);
    throw error;
  }
};

export const addSongToPlaylist = async (playlistId: number, songId: number) => {
  try {
    const response = await api.post(
      `/api/music/playlists/${playlistId}/add_song/`,
      {
        song_id: songId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("添加歌曲到播放列表失败:", error);
    throw error;
  }
};

export const removeSongFromPlaylist = async (
  playlistId: number,
  songId: number
) => {
  try {
    const response = await api.post(
      `/api/music/playlists/${playlistId}/remove_song/`,
      {
        song_id: songId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("从播放列表移除歌曲失败:", error);
    throw error;
  }
};

// 推荐相关接口
export const getRecommendedSongs = async () => {
  try {
    const response = await api.get("/api/music/songs/recommended/");
    return response.data;
  } catch (error) {
    console.error("获取推荐歌曲失败:", error);
    throw error;
  }
};

export const getTrendingSongs = async () => {
  try {
    const response = await api.get("/api/music/songs/trending/");
    return response.data;
  } catch (error) {
    console.error("获取热门歌曲失败:", error);
    throw error;
  }
};

export const getPersonalizedSongs = async () => {
  try {
    const response = await api.get("/api/music/songs/personalized/");
    return response.data;
  } catch (error) {
    console.error("获取个性化推荐失败:", error);
    throw error;
  }
};

// 播放历史
export const getPlayHistory = async () => {
  try {
    const response = await api.get("/api/music/history/");
    return response.data;
  } catch (error) {
    console.error("获取播放历史失败:", error);
    throw error;
  }
};

// 导出所有接口
export const musicApi = {
  getSongs,
  getSongById,
  playSong,
  addFavorite,
  removeFavorite,
  getFavorites,
  rateSong,
  addComment,
  getComments,
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getRecommendedSongs,
  getTrendingSongs,
  getPersonalizedSongs,
  getPlayHistory,
};

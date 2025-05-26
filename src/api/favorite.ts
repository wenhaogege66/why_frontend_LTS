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

// 收藏接口类型定义
export interface Favorite {
  id: number;
  song_id: number;
  song_name: string;
  artist_name: string;
  album_name: string;
  pic_url: string;
  created_at: string;
}

export interface FavoriteCreateData {
  song_id: number;
  song_name: string;
  artist_name: string;
  album_name: string;
  pic_url: string;
}

export interface FavoriteResponse {
  code: number;
  message: string;
  data?: Favorite[];
}

export interface ToggleFavoriteResponse {
  message: string;
  is_favorite: boolean;
}

export interface CheckFavoriteResponse {
  is_favorite: boolean;
}

/**
 * 获取用户收藏列表
 */
export const getFavorites = async (): Promise<FavoriteResponse> => {
  try {
    const response = await api.get<Favorite[]>("/api/music/favorites/");
    return {
      code: 200,
      message: "success",
      data: response.data,
    };
  } catch (error) {
    console.error("获取收藏列表失败:", error);
    throw error;
  }
};

/**
 * 切换收藏状态
 */
export const toggleFavorite = async (
  favoriteData: FavoriteCreateData
): Promise<ToggleFavoriteResponse> => {
  try {
    const response = await api.post<ToggleFavoriteResponse>(
      "/api/music/favorites/toggle/",
      favoriteData
    );
    return response.data;
  } catch (error) {
    console.error("切换收藏状态失败:", error);
    throw error;
  }
};

/**
 * 检查歌曲是否已收藏
 */
export const checkFavorite = async (
  songId: number
): Promise<CheckFavoriteResponse> => {
  try {
    const response = await api.get<CheckFavoriteResponse>(
      `/api/music/favorites/check/?song_id=${songId}`
    );
    return response.data;
  } catch (error) {
    console.error("检查收藏状态失败:", error);
    throw error;
  }
};

export const favoriteApi = {
  getFavorites,
  toggleFavorite,
  checkFavorite,
};

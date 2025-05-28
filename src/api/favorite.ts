import api from './axiosConfig';

// 收藏接口类型定义
export interface Favorite {
  id: number;
  song_id: number;
  song_name: string;
  artist_name: string;
  album_name: string;
  pic_url: string;
  created_at: string;
  // 添加歌手和专辑ID（可选，用于向后兼容）
  artist_id?: number;
  album_id?: number;
}

export interface FavoriteCreateData {
  song_id: number;
  song_name: string;
  artist_name: string;
  album_name: string;
  pic_url: string;
  // 添加歌手和专辑ID（可选）
  artist_id?: number;
  album_id?: number;
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

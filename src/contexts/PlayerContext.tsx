import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { searchApi } from "../api/search";
import { favoriteApi, FavoriteCreateData } from "../api/favorite";

// ==================== 类型定义 ====================

// 歌曲接口
export interface Song {
  id: number;
  name: string;
  ar: Array<{ name: string; id?: number }>;
  al: { name: string; picUrl: string; id?: number };
}

// 播放状态接口
export interface PlayerState {
  isPlaying: boolean;
  currentSongId: number | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
}

// 播放器上下文接口
interface PlayerContextType {
  // 播放状态
  playerState: PlayerState;
  currentSongInfo: Song | null;
  currentSongUrl: string | null;
  currentLyrics: string | null;
  favoriteStates: Record<number, boolean>;

  // 播放控制方法
  playSong: (song: Song) => Promise<void>;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;

  // 收藏相关方法
  toggleFavorite: (song: Song) => Promise<void>;
  checkFavoriteStatus: (songIds: number[]) => Promise<void>;

  // 全屏歌词
  fullScreenLyricsOpen: boolean;
  setFullScreenLyricsOpen: (open: boolean) => void;
}

interface PlayerProviderProps {
  children: ReactNode;
}

// ==================== Context 创建 ====================

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// ==================== Provider 组件 ====================

export function PlayerProvider({ children }: PlayerProviderProps) {
  // 播放状态
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentSongId: null,
    currentTime: 0,
    duration: 0,
    volume: 50,
    isMuted: false,
    isLoading: false,
  });

  // 当前歌曲信息
  const [currentSongInfo, setCurrentSongInfo] = useState<Song | null>(null);
  const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);
  const [currentLyrics, setCurrentLyrics] = useState<string | null>(null);

  // 收藏状态
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {}
  );

  // 全屏歌词状态
  const [fullScreenLyricsOpen, setFullScreenLyricsOpen] = useState(false);

  // 音频引用
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      // 设置音频属性以提高性能
      audioRef.current.preload = "auto";
      // 移除 crossOrigin 设置，因为音频服务器不支持 CORS
      // audioRef.current.crossOrigin = "anonymous";

      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("ended", handleSongEnd);

      // 添加错误处理
      audioRef.current.addEventListener("error", (e) => {
        console.error("音频播放错误:", e);
        console.error("错误详情:", audioRef.current?.error);

        // 根据错误类型提供更详细的信息
        const error = audioRef.current?.error;
        if (error) {
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              console.error("音频播放被中止");
              break;
            case error.MEDIA_ERR_NETWORK:
              console.error("网络错误导致音频下载失败");
              break;
            case error.MEDIA_ERR_DECODE:
              console.error("音频解码失败");
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              console.error("音频格式不支持或URL无效");
              break;
            default:
              console.error("未知音频错误");
          }
        }

        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          isLoading: false,
        }));
      });

      // 添加更多事件监听器用于调试
      audioRef.current.addEventListener("loadstart", () => {
        console.log("开始加载音频");
      });

      audioRef.current.addEventListener("canplay", () => {
        console.log("音频可以播放");
      });

      audioRef.current.addEventListener("play", () => {
        console.log("音频开始播放");
      });

      audioRef.current.addEventListener("pause", () => {
        console.log("音频暂停");
      });
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

  // 播放歌曲
  const playSong = async (song: Song) => {
    try {
      // 如果已经在播放同一首歌，只需切换播放/暂停状态
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

      // 立即停止当前播放
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // 立即更新歌曲信息和UI状态
      setCurrentSongInfo(song);
      setPlayerState((prev) => ({
        ...prev,
        currentSongId: song.id,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isLoading: true,
      }));

      // 清空之前的歌词和URL
      setCurrentLyrics(null);
      setCurrentSongUrl(null);

      // 获取歌曲播放URL和歌词
      const response = await searchApi.getSongPlayInfo(song.id);
      console.log("获取歌曲播放信息:", response);

      if (response.code === 200 && response.data.url) {
        console.log("原始歌曲URL:", response.data.url);

        // 直接使用原始URL
        let audioUrl = response.data.url;
        console.log("使用原始URL:", audioUrl);

        if (audioRef.current) {
          // 设置音频源
          audioRef.current.src = audioUrl;
          audioRef.current.currentTime = 0;
          audioRef.current.volume = playerState.volume / 100;
          audioRef.current.muted = playerState.isMuted;

          // 设置预加载
          audioRef.current.preload = "auto";

          // 移除 crossOrigin 设置以避免 CORS 问题
          audioRef.current.removeAttribute("crossorigin");

          // 更新歌词和URL
          setCurrentSongUrl(audioUrl);
          setCurrentLyrics(response.data.lyric || null);

          // 使用 loadeddata 事件，当音频数据加载完成后准备播放
          const handleLoadedData = () => {
            if (audioRef.current) {
              setPlayerState((prev) => ({
                ...prev,
                duration: audioRef.current?.duration || 0,
                isLoading: false,
              }));

              // 尝试自动播放
              audioRef.current
                .play()
                .then(() => {
                  setPlayerState((prev) => ({
                    ...prev,
                    isPlaying: true,
                  }));
                })
                .catch((playError) => {
                  console.log("自动播放被阻止，需要用户交互:", playError);
                  // 不设置为播放状态，等待用户点击播放按钮
                  setPlayerState((prev) => ({
                    ...prev,
                    isPlaying: false,
                  }));
                });
            }

            // 移除事件监听器
            audioRef.current?.removeEventListener(
              "loadeddata",
              handleLoadedData
            );
            clearTimeout(loadTimeout);
          };

          // 添加事件监听器
          audioRef.current.addEventListener("loadeddata", handleLoadedData);

          // 设置加载超时（10秒）
          const loadTimeout = setTimeout(() => {
            console.warn("音频加载超时");
            setPlayerState((prev) => ({ ...prev, isLoading: false }));
            audioRef.current?.removeEventListener(
              "loadeddata",
              handleLoadedData
            );
          }, 10000);

          // 开始加载音频
          audioRef.current.load();
        }
      } else {
        throw new Error("无法获取歌曲播放地址");
      }
    } catch (err) {
      console.error("播放歌曲失败:", err);
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
      }));
    }
  };

  // 暂停歌曲
  const pauseSong = () => {
    audioRef.current?.pause();
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  };

  // 恢复播放
  const resumeSong = async () => {
    try {
      if (audioRef.current && audioRef.current.src) {
        await audioRef.current.play();
        setPlayerState((prev) => ({ ...prev, isPlaying: true }));
      } else {
        console.error("音频源未设置或音频元素不存在");
      }
    } catch (error) {
      console.error("恢复播放失败:", error);
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  // 切换播放/暂停
  const togglePlayPause = async () => {
    if (playerState.isLoading) {
      return; // 如果正在加载，不执行任何操作
    }

    if (playerState.isPlaying) {
      pauseSong();
    } else {
      await resumeSong();
    }
  };

  // 设置音量
  const setVolume = (volume: number) => {
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

  // 跳转到指定时间
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState((prev) => ({
        ...prev,
        currentTime: time,
      }));
    }
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
        // 添加歌手和专辑ID（如果有的话）
        artist_id: song.ar[0]?.id,
        album_id: song.al.id,
      };

      const response = await favoriteApi.toggleFavorite(favoriteData);

      // 更新本地收藏状态
      setFavoriteStates((prev) => ({
        ...prev,
        [song.id]: response.is_favorite,
      }));

      console.log(response.message);
    } catch (error) {
      console.error("收藏操作失败:", error);
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

  const contextValue: PlayerContextType = {
    // 状态
    playerState,
    currentSongInfo,
    currentSongUrl,
    currentLyrics,
    favoriteStates,

    // 播放控制方法
    playSong,
    pauseSong,
    resumeSong,
    togglePlayPause,
    setVolume,
    toggleMute,
    seekTo,

    // 收藏相关方法
    toggleFavorite,
    checkFavoriteStatus,

    // 全屏歌词
    fullScreenLyricsOpen,
    setFullScreenLyricsOpen,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

// ==================== Hook 导出 ====================

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

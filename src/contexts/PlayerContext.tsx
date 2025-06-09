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
  duration?: number;
  quality?: AudioQuality;
  downloadStatus?: DownloadStatus;
}

// 音质选择枚举
export enum AudioQuality {
  LOW = "low",        // 128kbps
  MEDIUM = "medium",  // 320kbps
  HIGH = "high",      // 无损
  LOSSLESS = "lossless" // Hi-Res
}

// 下载状态枚举
export enum DownloadStatus {
  NOT_DOWNLOADED = "not_downloaded",
  DOWNLOADING = "downloading",
  DOWNLOADED = "downloaded",
  FAILED = "failed"
}

// 播放列表类型枚举
export enum PlaylistType {
  HOME_RECOMMEND = "home_recommend",
  SEARCH_RESULTS = "search_results", 
  FAVORITES = "favorites",
  ARTIST = "artist",
  ALBUM = "album",
  MOOD = "mood",
  RECOMMEND = "recommend",
  CUSTOM = "custom",
  QUEUE = "queue"  // 新增：播放队列
}

// 播放列表接口
export interface Playlist {
  type: PlaylistType;
  title: string;
  songs: Song[];
  currentIndex: number;
}

// 播放模式枚举
export enum PlayMode {
  ORDER = "order",        // 按顺序播放
  REPEAT_ONE = "repeat_one", // 单曲循环
  SHUFFLE = "shuffle",    // 随机播放
  REPEAT_ALL = "repeat_all" // 列表循环
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
  playMode: PlayMode;
  audioQuality: AudioQuality;  // 新增：音质设置
}

// 下载管理器接口
export interface DownloadManager {
  downloadSong: (song: Song, quality?: AudioQuality) => Promise<void>;
  cancelDownload: (songId: number) => void;
  getDownloadedSongs: () => Song[];
  deleteDownload: (songId: number) => Promise<void>;
  getDownloadProgress: (songId: number) => number;
}

// 播放器上下文接口
interface PlayerContextType {
  // 播放状态
  playerState: PlayerState;
  currentSongInfo: Song | null;
  currentSongUrl: string | null;
  currentLyrics: string | null;
  favoriteStates: Record<number, boolean>;

  // 播放列表状态  
  playlist: Playlist | null;
  queue: Song[];  // 新增：播放队列

  // 播放控制方法
  playSong: (song: Song, playlist?: Playlist) => Promise<void>;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  togglePlayMode: () => void;
  setAudioQuality: (quality: AudioQuality) => void;  // 新增：音质设置

  // 播放列表控制方法
  setPlaylist: (playlist: Playlist) => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  playAtIndex: (index: number) => Promise<void>;
  hasNext: () => boolean;
  hasPrevious: () => boolean;

  // 队列管理方法
  addToQueue: (song: Song) => void;
  addToQueueNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  moveInQueue: (fromIndex: number, toIndex: number) => void;

  // 下载管理方法
  downloadManager: DownloadManager;

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
    playMode: PlayMode.ORDER,
    audioQuality: AudioQuality.MEDIUM,
  });

  // 当前歌曲信息
  const [currentSongInfo, setCurrentSongInfo] = useState<Song | null>(null);
  const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);
  const [currentLyrics, setCurrentLyrics] = useState<string | null>(null);

  // 播放列表状态
  const [playlist, setPlaylistState] = useState<Playlist | null>(null);
  
  // 播放队列状态
  const [queue, setQueue] = useState<Song[]>([]);
  
  // 下载状态管理
  const [downloadStates, setDownloadStates] = useState<Record<number, DownloadStatus>>({});
  const [downloadProgress, setDownloadProgress] = useState<Record<number, number>>({});

  // 使用ref来存储最新状态，用于在事件回调中访问
  const playlistRef = useRef<Playlist | null>(null);
  const playModeRef = useRef<PlayMode>(PlayMode.ORDER);

  // 收藏状态
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>(
    {}
  );

  // 全屏歌词状态
  const [fullScreenLyricsOpen, setFullScreenLyricsOpen] = useState(false);

  // 同步状态到ref，用于事件回调中访问最新值
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    playModeRef.current = playerState.playMode;
  }, [playerState.playMode]);

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
    console.log('歌曲播放结束');
    
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));

    // 延迟执行自动播放逻辑，确保状态更新完成
    setTimeout(() => {
      handleAutoPlay();
    }, 100);
  };

  // 自动播放逻辑
  const handleAutoPlay = () => {
    // 从ref获取当前最新的状态
    const currentPlaylist = playlistRef.current;
    const currentPlayMode = playModeRef.current;
    
    console.log('自动播放检查:', { 
      currentPlaylist: currentPlaylist?.title, 
      currentIndex: currentPlaylist?.currentIndex,
      playlistLength: currentPlaylist?.songs.length,
      currentPlayMode 
    });

    if (!currentPlaylist || !currentPlaylist.songs.length) {
      console.log('没有播放列表或播放列表为空，停止播放');
      return;
    }

    switch (currentPlayMode) {
      case PlayMode.REPEAT_ONE:
        console.log('单曲循环模式 - 重复播放当前歌曲');
        const currentSong = currentPlaylist.songs[currentPlaylist.currentIndex];
        if (currentSong) {
          console.log('重复播放歌曲:', currentSong.name);
          playSongInternal(currentSong, true); // 自动播放下一首
        }
        break;

      case PlayMode.SHUFFLE:
        console.log('随机播放模式 - 随机选择下一首');
        if (currentPlaylist.songs.length > 1) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * currentPlaylist.songs.length);
          } while (randomIndex === currentPlaylist.currentIndex);
          
          const randomSong = currentPlaylist.songs[randomIndex];
          console.log('随机播放歌曲:', randomSong.name, '索引:', randomIndex);
          
          const updatedPlaylist = {
            ...currentPlaylist,
            currentIndex: randomIndex
          };
          setPlaylistState(updatedPlaylist);
          playSongInternal(randomSong, true); // 自动播放下一首
        }
        break;

      case PlayMode.REPEAT_ALL:
        console.log('列表循环模式 - 播放下一首或重新开始');
        if (currentPlaylist.currentIndex < currentPlaylist.songs.length - 1) {
          // 播放下一首
          const nextIndex = currentPlaylist.currentIndex + 1;
          const nextSong = currentPlaylist.songs[nextIndex];
          
          console.log('播放下一首歌曲:', nextSong.name, '索引:', nextIndex);
          
          const updatedPlaylist = {
            ...currentPlaylist,
            currentIndex: nextIndex
          };
          setPlaylistState(updatedPlaylist);
          playSongInternal(nextSong, true);
        } else {
          // 回到第一首
          const firstSong = currentPlaylist.songs[0];
          console.log('列表播放完毕，重新开始:', firstSong.name);
          
          const updatedPlaylist = {
            ...currentPlaylist,
            currentIndex: 0
          };
          setPlaylistState(updatedPlaylist);
          playSongInternal(firstSong, true);
        }
        break;

      case PlayMode.ORDER:
      default:
        console.log('顺序播放模式 - 播放下一首');
        if (currentPlaylist.currentIndex < currentPlaylist.songs.length - 1) {
          const nextIndex = currentPlaylist.currentIndex + 1;
          const nextSong = currentPlaylist.songs[nextIndex];
          
          console.log('播放下一首歌曲:', nextSong.name, '索引:', nextIndex);
          
          const updatedPlaylist = {
            ...currentPlaylist,
            currentIndex: nextIndex
          };
          setPlaylistState(updatedPlaylist);
          playSongInternal(nextSong, true); // 自动播放下一首
        } else {
          console.log('已到列表末尾，停止播放');
        }
        break;
    }
  };

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // 设置音频属性以提高性能
      audioRef.current.preload = "auto";
    }

    // 每次都重新绑定事件监听器，确保使用最新的函数
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

    // 清理函数：移除事件监听器
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioRef.current.removeEventListener("ended", handleSongEnd);
      }
    };
  }, [handleSongEnd]); // 依赖handleSongEnd，确保每次函数更新时重新绑定

  // 组件卸载时清理音频元素
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 播放歌曲 - 内部方法
  const playSongInternal = async (song: Song, autoPlay: boolean = true) => {
    try {
      console.log('playSongInternal 被调用:', song.name, '自动播放:', autoPlay);
      
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

              // 根据autoPlay参数决定是否自动播放
              if (autoPlay) {
                console.log('尝试自动播放歌曲:', song.name);
                audioRef.current
                  .play()
                  .then(() => {
                    console.log('自动播放成功:', song.name);
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
              } else {
                console.log('不自动播放，等待用户操作');
                setPlayerState((prev) => ({
                  ...prev,
                  isPlaying: false,
                }));
              }
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

  // 播放歌曲 - 外部方法
  const playSong = async (song: Song, newPlaylist?: Playlist) => {
    // 如果提供了新的播放列表，设置播放列表
    if (newPlaylist) {
      const songIndex = newPlaylist.songs.findIndex(s => s.id === song.id);
      const updatedPlaylist = {
        ...newPlaylist,
        currentIndex: songIndex >= 0 ? songIndex : 0
      };
      setPlaylistState(updatedPlaylist);
    } else if (playlist) {
      // 如果当前有播放列表，更新当前歌曲的索引
      const songIndex = playlist.songs.findIndex(s => s.id === song.id);
      if (songIndex >= 0) {
        setPlaylistState({
          ...playlist,
          currentIndex: songIndex
        });
      }
    }

    await playSongInternal(song, true); // 用户主动播放，自动开始播放
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

  // 设置播放列表
  const setPlaylist = (newPlaylist: Playlist) => {
    setPlaylistState(newPlaylist);
  };

  // 播放下一首
  const playNext = async () => {
    if (!playlist) return;
    
    switch (playerState.playMode) {
      case PlayMode.SHUFFLE:
        // 随机播放：随机选择下一首
        if (playlist.songs.length > 1) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * playlist.songs.length);
          } while (randomIndex === playlist.currentIndex);
          
          const randomSong = playlist.songs[randomIndex];
          setPlaylistState({
            ...playlist,
            currentIndex: randomIndex
          });
          await playSongInternal(randomSong, true); // 用户主动切换，自动播放
        }
        break;
        
      case PlayMode.REPEAT_ONE:
      case PlayMode.ORDER:
      default:
        // 按顺序播放下一首
        if (!hasNext()) return;
        
        const nextIndex = playlist.currentIndex + 1;
        const nextSong = playlist.songs[nextIndex];
        
        setPlaylistState({
          ...playlist,
          currentIndex: nextIndex
        });
        
        await playSongInternal(nextSong, true); // 用户主动切换，自动播放
        break;
    }
  };

  // 播放上一首
  const playPrevious = async () => {
    if (!playlist) return;
    
    switch (playerState.playMode) {
      case PlayMode.SHUFFLE:
        // 随机播放：随机选择上一首
        if (playlist.songs.length > 1) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * playlist.songs.length);
          } while (randomIndex === playlist.currentIndex);
          
          const randomSong = playlist.songs[randomIndex];
          setPlaylistState({
            ...playlist,
            currentIndex: randomIndex
          });
          await playSongInternal(randomSong, true); // 用户主动切换，自动播放
        }
        break;
        
      case PlayMode.REPEAT_ONE:
      case PlayMode.ORDER:
      default:
        // 按顺序播放上一首
        if (!hasPrevious()) return;
        
        const prevIndex = playlist.currentIndex - 1;
        const prevSong = playlist.songs[prevIndex];
        
        setPlaylistState({
          ...playlist,
          currentIndex: prevIndex
        });
        
        await playSongInternal(prevSong, true); // 用户主动切换，自动播放
        break;
    }
  };

  // 播放指定索引的歌曲
  const playAtIndex = async (index: number) => {
    if (!playlist || index < 0 || index >= playlist.songs.length) return;
    
    const song = playlist.songs[index];
    
    setPlaylistState({
      ...playlist,
      currentIndex: index
    });
    
    await playSongInternal(song, true); // 用户主动选择，自动播放
  };

  // 是否有下一首
  const hasNext = () => {
    if (!playlist) return false;
    
    // 随机播放模式下，只要有多于1首歌曲就可以切换
    if (playerState.playMode === PlayMode.SHUFFLE) {
      return playlist.songs.length > 1;
    }
    
    // 其他模式按顺序判断
    return playlist.currentIndex < playlist.songs.length - 1;
  };

  // 是否有上一首
  const hasPrevious = () => {
    if (!playlist) return false;
    
    // 随机播放模式下，只要有多于1首歌曲就可以切换
    if (playerState.playMode === PlayMode.SHUFFLE) {
      return playlist.songs.length > 1;
    }
    
    // 其他模式按顺序判断
    return playlist.currentIndex > 0;
  };

  // 切换播放模式
  const togglePlayMode = () => {
    setPlayerState((prev) => {
      let newPlayMode: PlayMode;
      switch (prev.playMode) {
        case PlayMode.ORDER:
          newPlayMode = PlayMode.REPEAT_ALL;
          break;
        case PlayMode.REPEAT_ALL:
          newPlayMode = PlayMode.REPEAT_ONE;
          break;
        case PlayMode.REPEAT_ONE:
          newPlayMode = PlayMode.SHUFFLE;
          break;
        case PlayMode.SHUFFLE:
          newPlayMode = PlayMode.ORDER;
          break;
        default:
          newPlayMode = PlayMode.ORDER;
      }
      return {
        ...prev,
        playMode: newPlayMode,
      };
    });
  };

  // 设置音质
  const setAudioQuality = (quality: AudioQuality) => {
    setPlayerState((prev) => ({
      ...prev,
      audioQuality: quality,
    }));
  };

  // 队列管理方法
  const addToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  const addToQueueNext = (song: Song) => {
    if (!playlist) {
      setQueue([song]);
      return;
    }
    const currentIndex = playlist.currentIndex;
    setQueue((prev) => [
      ...prev.slice(0, currentIndex + 1),
      song,
      ...prev.slice(currentIndex + 1)
    ]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const moveInQueue = (fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      return newQueue;
    });
  };

  // 下载管理器实现
  const downloadManager: DownloadManager = {
    downloadSong: async (song: Song, quality?: AudioQuality) => {
      const targetQuality = quality || playerState.audioQuality;
      
      // 设置下载状态
      setDownloadStates((prev) => ({
        ...prev,
        [song.id]: DownloadStatus.DOWNLOADING
      }));
      
      setDownloadProgress((prev) => ({
        ...prev,
        [song.id]: 0
      }));

      try {
        // 获取歌曲下载URL
        const response = await searchApi.getSongPlayInfo(song.id);
        if (response.code !== 200 || !response.data.url) {
          throw new Error('无法获取下载链接');
        }

        const audioUrl = response.data.url;
        
        // 创建下载
        const downloadResponse = await fetch(audioUrl);
        if (!downloadResponse.ok) {
          throw new Error('下载失败');
        }

        const contentLength = downloadResponse.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

        const reader = downloadResponse.body?.getReader();
        if (!reader) {
          throw new Error('无法读取响应流');
        }

        const chunks: Uint8Array[] = [];
        let downloadedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          downloadedBytes += value.length;

          // 更新下载进度
          if (totalBytes > 0) {
            const progress = Math.round((downloadedBytes / totalBytes) * 100);
            setDownloadProgress((prev) => ({
              ...prev,
              [song.id]: progress
            }));
          }
        }

        // 合并数据块
        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        
        // 保存到本地存储（这里使用IndexedDB会更好）
        const audioData = await blob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(audioData)));
        
        localStorage.setItem(`downloaded_song_${song.id}`, JSON.stringify({
          song,
          data: base64Data,
          quality: targetQuality,
          downloadDate: new Date().toISOString()
        }));

        // 更新下载状态
        setDownloadStates((prev) => ({
          ...prev,
          [song.id]: DownloadStatus.DOWNLOADED
        }));

        setDownloadProgress((prev) => ({
          ...prev,
          [song.id]: 100
        }));

      } catch (error) {
        console.error('下载失败:', error);
        setDownloadStates((prev) => ({
          ...prev,
          [song.id]: DownloadStatus.FAILED
        }));
      }
    },

    cancelDownload: (songId: number) => {
      setDownloadStates((prev) => ({
        ...prev,
        [songId]: DownloadStatus.NOT_DOWNLOADED
      }));
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[songId];
        return newProgress;
      });
    },

    getDownloadedSongs: () => {
      const downloaded: Song[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('downloaded_song_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            downloaded.push(data.song);
          } catch (error) {
            console.error('解析下载数据失败:', error);
          }
        }
      }
      return downloaded;
    },

    deleteDownload: async (songId: number) => {
      localStorage.removeItem(`downloaded_song_${songId}`);
      setDownloadStates((prev) => ({
        ...prev,
        [songId]: DownloadStatus.NOT_DOWNLOADED
      }));
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[songId];
        return newProgress;
      });
    },

    getDownloadProgress: (songId: number) => {
      return downloadProgress[songId] || 0;
    },
  };

  const contextValue: PlayerContextType = {
    // 状态
    playerState,
    currentSongInfo,
    currentSongUrl,
    currentLyrics,
    favoriteStates,

    // 播放列表状态
    playlist,
    queue,

    // 播放控制方法
    playSong,
    pauseSong,
    resumeSong,
    togglePlayPause,
    setVolume,
    toggleMute,
    seekTo,
    togglePlayMode,
    setAudioQuality,

    // 播放列表控制方法
    setPlaylist,
    playNext,
    playPrevious,
    playAtIndex,
    hasNext,
    hasPrevious,

    // 队列管理方法
    addToQueue,
    addToQueueNext,
    removeFromQueue,
    clearQueue,
    moveInQueue,

    // 下载管理方法
    downloadManager,

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

import React from "react";
import {
  Box,
  Paper,
  CardMedia,
  Typography,
  IconButton,
  Slider,
  CircularProgress,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
  Favorite,
  FavoriteBorder,
  HourglassEmpty,
} from "@mui/icons-material";
import { usePlayer } from "../contexts/PlayerContext";
import FullScreenLyrics from "./FullScreenLyrics";

const GlobalPlayer: React.FC = () => {
  const {
    playerState,
    currentSongInfo,
    favoriteStates,
    fullScreenLyricsOpen,
    setFullScreenLyricsOpen,
    togglePlayPause,
    setVolume,
    toggleMute,
    toggleFavorite,
    seekTo,
    currentLyrics,
  } = usePlayer();

  // 格式化时间为 MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 处理进度条变化
  const handleSeek = (event: Event, newValue: number | number[]) => {
    const seekTime = Array.isArray(newValue) ? newValue[0] : newValue;
    seekTo(seekTime);
  };

  // 处理音量变化
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const volume = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(volume);
  };

  // 处理播放按钮点击
  const handlePlayPause = () => {
    console.log("播放按钮被点击，当前状态:", {
      isPlaying: playerState.isPlaying,
      isLoading: playerState.isLoading,
      currentSongId: playerState.currentSongId,
      duration: playerState.duration,
    });
    togglePlayPause();
  };

  // 如果没有当前歌曲，不显示播放器
  if (!playerState.currentSongId || !currentSongInfo) {
    return null;
  }

  return (
    <>
      {/* 底部播放器 */}
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: "background.paper",
          borderTop: "1px solid #eee",
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* 歌曲信息 */}
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 200 }}>
            <Box sx={{ position: "relative", mr: 2 }}>
              <CardMedia
                component="img"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  objectFit: "cover",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  opacity: playerState.isLoading ? 0.7 : 1,
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
                image={currentSongInfo.al.picUrl}
                alt={currentSongInfo.name}
                onClick={() => setFullScreenLyricsOpen(true)}
              />
              {playerState.isLoading && (
                <CircularProgress
                  size={20}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "primary.main",
                  }}
                />
              )}
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentSongInfo.name}
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    color: favoriteStates[currentSongInfo.id]
                      ? "error.main"
                      : "text.secondary",
                  }}
                  onClick={() => toggleFavorite(currentSongInfo)}
                >
                  {favoriteStates[currentSongInfo.id] ? (
                    <Favorite fontSize="small" />
                  ) : (
                    <FavoriteBorder fontSize="small" />
                  )}
                </IconButton>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentSongInfo.ar.map((artist) => artist.name).join(" / ")}
              </Typography>
            </Box>
          </Box>

          {/* 播放控制 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton>
              <SkipPrevious />
            </IconButton>
            <IconButton
              onClick={handlePlayPause}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {/* 显示加载状态 */}
              {playerState.isLoading ? (
                <HourglassEmpty
                  sx={{
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              ) : playerState.isPlaying ? (
                <Pause />
              ) : (
                <PlayArrow />
              )}
            </IconButton>
            <IconButton>
              <SkipNext />
            </IconButton>
          </Box>

          {/* 进度条 */}
          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <Slider
              value={playerState.isLoading ? 0 : playerState.currentTime}
              max={playerState.duration || 100}
              onChange={handleSeek}
              disabled={playerState.isLoading}
              sx={{
                color: "primary.main",
                height: 4,
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                },
                "& .Mui-disabled": {
                  color: "action.disabled",
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              <span>
                {playerState.isLoading
                  ? "--:--"
                  : formatTime(playerState.currentTime)}
              </span>
              <span>
                {playerState.isLoading
                  ? "--:--"
                  : formatTime(playerState.duration)}
              </span>
            </Box>
          </Box>

          {/* 音量控制 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 120,
            }}
          >
            <IconButton onClick={toggleMute} size="small">
              {playerState.isMuted || playerState.volume === 0 ? (
                <VolumeOff />
              ) : (
                <VolumeUp />
              )}
            </IconButton>
            <Slider
              value={playerState.volume}
              onChange={handleVolumeChange}
              sx={{
                width: 80,
                color: "primary.main",
                height: 4,
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 全屏歌词 */}
      <FullScreenLyrics
        open={fullScreenLyricsOpen}
        onClose={() => setFullScreenLyricsOpen(false)}
        song={currentSongInfo}
        lyrics={currentLyrics}
        currentTime={playerState.currentTime}
        duration={playerState.duration}
        isPlaying={playerState.isPlaying}
        volume={playerState.volume}
        isMuted={playerState.isMuted}
        isFavorite={favoriteStates[currentSongInfo.id] || false}
        onPlayPause={togglePlayPause}
        onVolumeChange={setVolume}
        onToggleMute={toggleMute}
        onToggleFavorite={() => toggleFavorite(currentSongInfo)}
      />
    </>
  );
};

export default GlobalPlayer;

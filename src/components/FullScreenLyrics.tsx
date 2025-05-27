import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Paper,
  Fade,
  Backdrop,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Close,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";

interface LyricLine {
  time: number;
  text: string;
}

interface Song {
  id: number;
  name: string;
  ar: Array<{ name: string }>;
  al: { name: string; picUrl: string };
}

interface FullScreenLyricsProps {
  open: boolean;
  onClose: () => void;
  song: Song | null;
  lyrics: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFavorite: () => void;
  onSeek?: (time: number) => void;
}

function FullScreenLyrics({
  open,
  onClose,
  song,
  lyrics,
  currentTime,
  duration,
  isPlaying,
  volume,
  isMuted,
  isFavorite,
  onPlayPause,
  onVolumeChange,
  onToggleMute,
  onToggleFavorite,
  onSeek,
}: FullScreenLyricsProps) {
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // 解析歌词
  useEffect(() => {
    if (!lyrics) {
      setParsedLyrics([]);
      return;
    }

    const lines = lyrics.split("\n");
    const parsed: LyricLine[] = [];

    lines.forEach((line) => {
      // 匹配多种时间标签格式
      const timeMatches = [
        line.match(/\[(\d{1,2}):(\d{2})\.(\d{2,3})\]/),
        line.match(/\[(\d{1,2}):(\d{2})\]/),
      ];

      let timeMatch = null;
      for (const match of timeMatches) {
        if (match) {
          timeMatch = match;
          break;
        }
      }

      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const milliseconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;

        const msMultiplier = timeMatch[3]
          ? timeMatch[3].length === 3
            ? 1
            : 10
          : 0;
        const time =
          minutes * 60 + seconds + (milliseconds * msMultiplier) / 1000;

        const text = line
          .replace(/\[\d{1,2}:\d{2}(?:\.\d{2,3})?\]/g, "")
          .trim();
        if (text && text !== "") {
          parsed.push({ time, text });
        }
      }
    });

    // 按时间排序
    parsed.sort((a, b) => a.time - b.time);
    setParsedLyrics(parsed);
  }, [lyrics]);

  // 更新当前歌词行
  useEffect(() => {
    if (parsedLyrics.length === 0) {
      setCurrentLyricIndex(-1);
      return;
    }

    let index = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    setCurrentLyricIndex(index);
  }, [currentTime, parsedLyrics]);

  // 自动滚动到当前歌词行
  useEffect(() => {
    if (currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const currentElement = document.getElementById(
        `lyric-line-${currentLyricIndex}`
      );
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentLyricIndex]);

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 处理进度条拖动
  const handleSeek = (event: Event, newValue: number | number[]) => {
    const seekTime = Array.isArray(newValue) ? newValue[0] : newValue;
    if (onSeek) {
      onSeek(seekTime);
    }
  };

  if (!song) return null;

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: 2000,
        bgcolor: "rgba(0, 0, 0, 0.95)",
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            color: "white",
            position: "relative",
          }}
        >
          {/* 关闭按钮 */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              color: "white",
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>

          {/* 主要内容区域 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              px: 4,
              py: 2,
              gap: 4,
            }}
          >
            {/* 左侧：转动的唱片 */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "50%",
              }}
            >
              {/* 唱片外圈 */}
              <Box
                sx={{
                  width: 350,
                  height: 350,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(45deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  animation: isPlaying ? "spin 3s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background:
                      "repeating-conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.1) 1deg, transparent 2deg)",
                  },
                }}
              >
                {/* 唱片中心的歌曲封面 */}
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    backgroundImage: `url(${song.al.picUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "3px solid #333",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {/* 中心圆点 */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#1a1a1a",
                      border: "2px solid #666",
                    }}
                  />
                </Box>
              </Box>

              {/* 歌曲信息 */}
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {song.name}
                </Typography>
                <Typography variant="h6" color="grey.400">
                  {song.ar.map((artist) => artist.name).join(" / ")}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>
                  {song.al.name}
                </Typography>
              </Box>
            </Box>

            {/* 右侧：歌词显示 */}
            <Box
              sx={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                maxWidth: "50%",
              }}
            >
              {parsedLyrics.length > 0 ? (
                <Box
                  ref={lyricsContainerRef}
                  sx={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    position: "relative",
                    px: 2,
                    // 自定义滚动条样式 - 美化纵向滚动条
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)",
                      borderRadius: "10px",
                      border: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 100%)",
                      },
                      "&:active": {
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)",
                      },
                    },
                    "&::-webkit-scrollbar-corner": {
                      background: "transparent",
                    },
                    // 为Firefox提供滚动条样式
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255, 255, 255, 0.4) transparent",
                  }}
                >
                  {/* 顶部间距 */}
                  <Box sx={{ height: "20vh" }} />

                  {parsedLyrics.map((lyric, index) => {
                    const isCurrent = index === currentLyricIndex;
                    const isPast = index < currentLyricIndex;
                    const isFuture = index > currentLyricIndex;

                    return (
                      <Typography
                        key={index}
                        variant="h4"
                        sx={{
                          textAlign: "center",
                          mb: 3,
                          transition: "all 0.3s ease",
                          opacity: isCurrent ? 1 : isPast ? 0.4 : 0.6,
                          color: isCurrent ? "#fff" : "grey.400",
                          fontSize: isCurrent ? "2.5rem" : "2rem",
                          fontWeight: isCurrent ? 600 : 400,
                          transform: isCurrent ? "scale(1.1)" : "scale(1)",
                          textShadow: isCurrent
                            ? "0 0 20px rgba(255,255,255,0.5)"
                            : "none",
                          animation: isCurrent
                            ? "glow 2s ease-in-out infinite alternate"
                            : "none",
                          cursor: "pointer",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          hyphens: "auto",
                          maxWidth: "100%",
                          "&:hover": {
                            opacity: 0.8,
                            transform: "scale(1.05)",
                          },
                          "@keyframes glow": {
                            "0%": {
                              textShadow: "0 0 20px rgba(255,255,255,0.5)",
                            },
                            "100%": {
                              textShadow:
                                "0 0 30px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.3)",
                            },
                          },
                        }}
                        id={`lyric-line-${index}`}
                      >
                        {lyric.text}
                      </Typography>
                    );
                  })}

                  {/* 底部间距 */}
                  <Box sx={{ height: "20vh" }} />
                </Box>
              ) : (
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: "center",
                    color: "grey.500",
                    fontStyle: "italic",
                  }}
                >
                  暂无歌词
                </Typography>
              )}
            </Box>
          </Box>

          {/* 底部控制栏 */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              p: 3,
              borderRadius: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* 播放控制 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  onClick={onPlayPause}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    width: 56,
                    height: 56,
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>

                <IconButton
                  onClick={onToggleFavorite}
                  sx={{
                    color: isFavorite ? "error.main" : "grey.400",
                    "&:hover": {
                      color: isFavorite ? "error.dark" : "error.light",
                    },
                  }}
                >
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Box>

              {/* 进度控制 */}
              <Box sx={{ flex: 1, mx: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                    color: "grey.400",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </Box>
                <Slider
                  value={currentTime}
                  max={duration || 100}
                  onChange={handleSeek}
                  sx={{
                    color: "primary.main",
                    height: 4,
                    "& .MuiSlider-thumb": {
                      width: 16,
                      height: 16,
                      backgroundColor: "white",
                      border: "2px solid currentColor",
                      "&:hover": {
                        boxShadow: "0 0 0 8px rgba(255, 255, 255, 0.16)",
                      },
                      "&:focus, &:hover, &.Mui-active": {
                        boxShadow: "0 0 0 8px rgba(255, 255, 255, 0.16)",
                      },
                    },
                    "& .MuiSlider-track": {
                      height: 4,
                      borderRadius: 2,
                    },
                    "& .MuiSlider-rail": {
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                />
              </Box>

              {/* 音量控制 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 150,
                }}
              >
                <IconButton onClick={onToggleMute} sx={{ color: "grey.400" }}>
                  {isMuted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
                <Slider
                  value={volume}
                  onChange={(_, value) => onVolumeChange(value as number)}
                  sx={{
                    width: 100,
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      width: 16,
                      height: 16,
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Backdrop>
  );
}

export default FullScreenLyrics;

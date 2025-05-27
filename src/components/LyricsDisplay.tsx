import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Collapse } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

interface LyricsDisplayProps {
  lyrics: string | null;
  currentTime: number;
}

interface LyricLine {
  time: number;
  text: string;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  currentTime,
}) => {
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

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
      // [mm:ss.xx] [mm:ss.xxx] [mm:ss] [m:ss.xx] [m:ss]
      const timeMatches = [
        line.match(/\[(\d{1,2}):(\d{2})\.(\d{2,3})\]/), // [mm:ss.xx] 或 [m:ss.xxx]
        line.match(/\[(\d{1,2}):(\d{2})\]/), // [mm:ss] 或 [m:ss]
      ];

      let timeMatch = null;
      let time = 0;

      // 尝试匹配不同格式
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

        // 根据毫秒位数调整计算
        const msMultiplier = timeMatch[3]
          ? timeMatch[3].length === 3
            ? 1
            : 10
          : 0;
        time = minutes * 60 + seconds + (milliseconds * msMultiplier) / 1000;

        // 移除所有时间标签，支持多个时间标签的情况
        const text = line
          .replace(/\[\d{1,2}:\d{2}(?:\.\d{2,3})?\]/g, "")
          .trim();
        if (text && text !== "") {
          parsed.push({ time, text });
        }
      }
    });

    setParsedLyrics(parsed.sort((a, b) => a.time - b.time));
  }, [lyrics]);

  // 根据当前播放时间更新当前歌词行
  useEffect(() => {
    if (parsedLyrics.length === 0) return;

    let index = 0;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].time <= currentTime) {
        index = i;
      } else {
        break;
      }
    }
    setCurrentLineIndex(index);
  }, [currentTime, parsedLyrics]);

  if (!lyrics || parsedLyrics.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          歌词
        </Typography>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ ml: 1 }}
        >
          {expanded ? <ExpandMore /> : <ExpandLess />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            maxHeight: 200,
            overflow: "auto",
            bgcolor: "rgba(0, 0, 0, 0.05)",
            borderRadius: 1,
            p: 2,
          }}
        >
          {parsedLyrics.map((line, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                py: 0.5,
                color:
                  index === currentLineIndex
                    ? "primary.main"
                    : "text.secondary",
                fontWeight: index === currentLineIndex ? 600 : 400,
                transition: "all 0.3s ease",
                ...(index === currentLineIndex && {
                  animation: "lyricHighlight 1.5s ease-in-out infinite",
                  "@keyframes lyricHighlight": {
                    "0%": {
                      transform: "scale(1)",
                      textShadow: "0 0 0px rgba(25, 118, 210, 0.5)",
                    },
                    "50%": {
                      transform: "scale(1.05)",
                      textShadow: "0 0 8px rgba(25, 118, 210, 0.8)",
                    },
                    "100%": {
                      transform: "scale(1)",
                      textShadow: "0 0 0px rgba(25, 118, 210, 0.5)",
                    },
                  },
                }),
              }}
            >
              {line.text}
            </Typography>
          ))}
        </Box>
      </Collapse>

      {/* 当前歌词行显示 */}
      {!expanded && parsedLyrics[currentLineIndex] && (
        <Typography
          variant="body2"
          sx={{
            color: "primary.main",
            fontWeight: 500,
            textAlign: "center",
            py: 1,
            bgcolor: "rgba(0, 0, 0, 0.05)",
            borderRadius: 1,
            animation: "lyricPulse 2s ease-in-out infinite",
            "@keyframes lyricPulse": {
              "0%": {
                transform: "scale(1)",
                opacity: 0.8,
              },
              "50%": {
                transform: "scale(1.02)",
                opacity: 1,
              },
              "100%": {
                transform: "scale(1)",
                opacity: 0.8,
              },
            },
          }}
        >
          {parsedLyrics[currentLineIndex].text}
        </Typography>
      )}
    </Box>
  );
};

export default LyricsDisplay;

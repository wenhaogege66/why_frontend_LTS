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
      // 匹配时间标签格式 [mm:ss.xx]
      const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const milliseconds = parseInt(timeMatch[3]);
        const time = minutes * 60 + seconds + milliseconds / 100;

        const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, "").trim();
        if (text) {
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
          {expanded ? <ExpandLess /> : <ExpandMore />}
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
          }}
        >
          {parsedLyrics[currentLineIndex].text}
        </Typography>
      )}
    </Box>
  );
};

export default LyricsDisplay;

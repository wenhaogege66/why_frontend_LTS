import { Box, Typography } from '@mui/material';
import { useEffect, useState, useRef } from 'react';

interface LyricsProps {
    lyrics: string;
    currentTime: number;
}

interface LyricLine {
    time: number;
    text: string;
}

const Lyrics = ({ lyrics, currentTime }: LyricsProps) => {
    const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
    const [activeLine, setActiveLine] = useState<number>(-1);
    const lyricsRef = useRef<HTMLDivElement>(null);

    // 解析歌词
    useEffect(() => {
        if (!lyrics) {
            setParsedLyrics([]);
            return;
        }

        const lines = lyrics.split('\n').filter(line => line.trim() !== '');
        const parsedLines: LyricLine[] = [];

        lines.forEach(line => {
            // 匹配时间标签格式 [00:00.00]
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);
                const time = minutes * 60 + seconds + milliseconds / 100;
                const text = match[4].trim();
                parsedLines.push({ time, text });
            } else {
                // 没有时间标签的行
                parsedLines.push({ time: 0, text: line.trim() });
            }
        });

        // 按时间排序
        parsedLines.sort((a, b) => a.time - b.time);
        setParsedLyrics(parsedLines);
    }, [lyrics]);

    // 根据当前播放时间更新活跃歌词行
    useEffect(() => {
        if (!parsedLyrics.length) return;

        let currentLineIndex = -1;
        for (let i = 0; i < parsedLyrics.length; i++) {
            if (parsedLyrics[i].time <= currentTime) {
                currentLineIndex = i;
            } else {
                break;
            }
        }
        
        setActiveLine(currentLineIndex);

        // 滚动到当前行
        if (currentLineIndex >= 0 && lyricsRef.current) {
            const lineElements = lyricsRef.current.querySelectorAll('.lyric-line');
            if (lineElements.length > currentLineIndex) {
                lineElements[currentLineIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [currentTime, parsedLyrics]);

    if (!lyrics || !parsedLyrics.length) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%'
            }}>
                <Typography variant="body1" color="text.secondary">
                    暂无歌词
                </Typography>
            </Box>
        );
    }

    return (
        <Box 
            ref={lyricsRef}
            sx={{ 
                height: '100%',
                overflow: 'auto',
                p: 2,
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                }
            }}
        >
            {parsedLyrics.map((line, index) => (
                <Typography
                    key={index}
                    className="lyric-line"
                    variant="body1"
                    align="center"
                    sx={{
                        mb: 2,
                        transition: 'all 0.3s',
                        color: index === activeLine ? 'primary.main' : 'text.secondary',
                        fontWeight: index === activeLine ? 600 : 400,
                        fontSize: index === activeLine ? '1.1rem' : '0.9rem',
                    }}
                >
                    {line.text}
                </Typography>
            ))}
        </Box>
    );
};

export default Lyrics; 
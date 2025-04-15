import { Box, IconButton, Slider, Typography } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';

interface MusicPlayerProps {
    currentSong: {
        id: number;
        title: string;
        artist: string;
        coverUrl: string;
        audioUrl: string;
    };
    onNext: () => void;
    onPrevious: () => void;
    onToggleFavorite: () => void;
    isFavorite: boolean;
}

const MusicPlayer = ({ currentSong, onNext, onPrevious, onToggleFavorite, isFavorite }: MusicPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = currentSong.audioUrl;
            if (isPlaying) {
                audioRef.current.play();
            }
        }
    }, [currentSong]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const handleSliderChange = (_: Event, value: number | number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value as number;
            setCurrentTime(value as number);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2
        }}>
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={onNext}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    style={{ width: 48, height: 48, borderRadius: 4 }}
                />
                <Box>
                    <Typography variant="subtitle1">{currentSong.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{currentSong.artist}</Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 2 }}>
                <IconButton onClick={onPrevious}>
                    <SkipPrevious />
                </IconButton>
                <IconButton onClick={handlePlayPause}>
                    {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton onClick={onNext}>
                    <SkipNext />
                </IconButton>
                <IconButton onClick={onToggleFavorite}>
                    {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 2 }}>
                <Typography variant="body2">{formatTime(currentTime)}</Typography>
                <Slider
                    value={currentTime}
                    max={duration}
                    onChange={handleSliderChange}
                    sx={{ width: 200 }}
                />
                <Typography variant="body2">{formatTime(duration)}</Typography>
            </Box>
        </Box>
    );
};

export default MusicPlayer; 
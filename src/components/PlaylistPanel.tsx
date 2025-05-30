import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Close,
  PlayArrow,
  Pause,
  Delete,
  DragHandle,
  Repeat,
  RepeatOne,
  Shuffle,
} from '@mui/icons-material';
import { usePlayer, PlayMode } from '../contexts/PlayerContext';

interface PlaylistPanelProps {
  open: boolean;
  onClose: () => void;
}

const PlaylistPanel: React.FC<PlaylistPanelProps> = ({ open, onClose }) => {
  const {
    playlist,
    playerState,
    playAtIndex,
    togglePlayMode,
    setPlaylist,
  } = usePlayer();

  // 移除歌曲
  const handleRemoveSong = (index: number) => {
    if (!playlist) return;
    
    const newSongs = playlist.songs.filter((_, i) => i !== index);
    const newCurrentIndex = index < playlist.currentIndex 
      ? playlist.currentIndex - 1 
      : playlist.currentIndex >= newSongs.length 
        ? Math.max(0, newSongs.length - 1)
        : playlist.currentIndex;
    
    setPlaylist({
      ...playlist,
      songs: newSongs,
      currentIndex: newCurrentIndex,
    });
  };

  // 播放选中的歌曲
  const handlePlaySong = (index: number) => {
    playAtIndex(index);
  };

  if (!playlist) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            bgcolor: 'background.default',
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            暂无播放列表
          </Typography>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          bgcolor: 'background.default',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 头部 */}
        <Paper elevation={1} sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {playlist.title}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip 
              label={`${playlist.songs.length} 首歌曲`}
              size="small"
              color="primary"
              variant="outlined"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  onClick={togglePlayMode}
                  size="small"
                  sx={{ color: 'primary.main' }}
                >
                  {playerState.playMode === PlayMode.ORDER && <Repeat />}
                  {playerState.playMode === PlayMode.REPEAT_ONE && <RepeatOne />}
                  {playerState.playMode === PlayMode.SHUFFLE && <Shuffle />}
                </IconButton>
                <Typography variant="body2">
                  {playerState.playMode === PlayMode.ORDER && '顺序'}
                  {playerState.playMode === PlayMode.REPEAT_ONE && '单曲'}
                  {playerState.playMode === PlayMode.SHUFFLE && '随机'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 歌曲列表 */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List sx={{ p: 0 }}>
            {playlist.songs.map((song, index) => (
              <React.Fragment key={`${song.id}-${index}`}>
                <ListItem
                  sx={{
                    bgcolor: playlist.currentIndex === index ? 'primary.light' : 'transparent',
                    cursor: 'pointer',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: playlist.currentIndex === index ? 'primary.light' : 'action.hover',
                    },
                  }}
                  onClick={() => handlePlaySong(index)}
                >
                  {/* 播放状态指示器 */}
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      bgcolor: playlist.currentIndex === index ? 'primary.main' : 'transparent',
                      borderRadius: 2,
                      mr: 2,
                    }}
                  />
                  
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: playlist.currentIndex === index ? 600 : 400,
                          color: playlist.currentIndex === index ? 'primary.main' : 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {song.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {song.ar.map(artist => artist.name).join(' / ')}
                      </Typography>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {playlist.currentIndex === index && (
                        <IconButton
                          size="small"
                          sx={{ color: 'primary.main' }}
                        >
                          {playerState.isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      )}
                      
                      <Tooltip title="移除">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSong(index);
                          }}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < playlist.songs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PlaylistPanel; 
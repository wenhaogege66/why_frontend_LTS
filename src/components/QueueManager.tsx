import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Chip,
  Button,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PlayArrow,
  Delete,
  DragIndicator,
  Clear,
  Add,
  MoreVert,
  Shuffle,
  PlaylistAdd,
} from '@mui/icons-material';
import { usePlayer, Song } from '../contexts/PlayerContext';

interface QueueManagerProps {
  open: boolean;
  onClose: () => void;
}

const QueueManager: React.FC<QueueManagerProps> = ({ open, onClose }) => {
  const {
    playlist,
    queue,
    currentSongInfo,
    playerState,
    playAtIndex,
    addToQueue,
    addToQueueNext,
    removeFromQueue,
    clearQueue,
    moveInQueue,
    playSong,
  } = usePlayer();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedSongIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSongIndex(null);
  };

  const handlePlaySong = (song: Song, index: number) => {
    if (playlist) {
      playAtIndex(index);
    } else {
      playSong(song);
    }
  };

  const handleAddToNext = (song: Song) => {
    addToQueueNext(song);
    handleMenuClose();
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
    handleMenuClose();
  };

  const handleRemoveFromQueue = (index: number) => {
    removeFromQueue(index);
    handleMenuClose();
  };

  const getCurrentPlayingIndex = () => {
    if (!playlist || !currentSongInfo) return -1;
    return playlist.songs.findIndex(song => song.id === currentSongInfo.id);
  };

  const getDisplaySongs = () => {
    if (!playlist) return queue;
    return playlist.songs;
  };

  const displaySongs = getDisplaySongs();
  const currentPlayingIndex = getCurrentPlayingIndex();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">播放队列</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="清空队列">
              <IconButton size="small" onClick={clearQueue}>
                <Clear />
              </IconButton>
            </Tooltip>
            <Tooltip title="随机播放">
              <IconButton size="small">
                <Shuffle />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* 当前播放 */}
        {currentSongInfo && (
          <>
            <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                正在播放
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={currentSongInfo.al.picUrl}
                  variant="rounded"
                  sx={{ width: 40, height: 40 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {currentSongInfo.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {currentSongInfo.ar.map(artist => artist.name).join(' / ')}
                  </Typography>
                </Box>
                <Chip 
                  label={playerState.isPlaying ? "播放中" : "暂停"} 
                  size="small"
                  color={playerState.isPlaying ? "success" : "default"}
                />
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {/* 队列列表 */}
        {displaySongs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              队列为空
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              添加歌曲到队列以继续播放
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {displaySongs.map((song, index) => {
              const isCurrentPlaying = index === currentPlayingIndex;
              
              return (
                <ListItem
                  key={`${song.id}-${index}`}
                  sx={{
                    bgcolor: isCurrentPlaying ? 'action.selected' : 'transparent',
                    borderLeft: isCurrentPlaying ? 3 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={song.al.picUrl}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    >
                      {song.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: isCurrentPlaying ? 600 : 400,
                            color: isCurrentPlaying ? 'primary.main' : 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {song.name}
                        </Typography>
                        {isCurrentPlaying && (
                          <Chip 
                            label="播放中" 
                            size="small" 
                            color="primary" 
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
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
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handlePlaySong(song, index)}
                      sx={{ mr: 1 }}
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleMenuOpen(e, index)}
                    >
                      <MoreVert />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}

        {/* 上下文菜单 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedSongIndex !== null && (
            <>
              <MenuItem onClick={() => handleAddToNext(displaySongs[selectedSongIndex])}>
                <PlaylistAdd sx={{ mr: 1 }} />
                下一首播放
              </MenuItem>
              <MenuItem onClick={() => handleAddToQueue(displaySongs[selectedSongIndex])}>
                <Add sx={{ mr: 1 }} />
                添加到队列
              </MenuItem>
              <MenuItem 
                onClick={() => handleRemoveFromQueue(selectedSongIndex)}
                sx={{ color: 'error.main' }}
              >
                <Delete sx={{ mr: 1 }} />
                从队列移除
              </MenuItem>
            </>
          )}
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

export default QueueManager; 
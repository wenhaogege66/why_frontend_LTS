import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Download,
  Delete,
  PlayArrow,
  Cancel,
  CloudDownload,
  Storage,
} from '@mui/icons-material';
import { usePlayer, Song, DownloadStatus } from '../contexts/PlayerContext';

interface DownloadManagerProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`download-tabpanel-${index}`}
      aria-labelledby={`download-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ open, onClose }) => {
  const { downloadManager, playSong } = usePlayer();
  const [tabValue, setTabValue] = useState(0);
  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (open) {
      setDownloadedSongs(downloadManager.getDownloadedSongs());
    }
  }, [open, downloadManager]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlay = (song: Song) => {
    playSong(song);
  };

  const handleDelete = async (songId: number) => {
    await downloadManager.deleteDownload(songId);
    setDownloadedSongs(downloadManager.getDownloadedSongs());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageInfo = () => {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('downloaded_song_')) {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
    }
    return totalSize;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudDownload />
          下载管理
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="已下载" icon={<Storage />} iconPosition="start" />
            <Tab label="下载中" icon={<Download />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {downloadedSongs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                暂无已下载的歌曲
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                下载喜欢的歌曲以便离线收听
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  已下载 {downloadedSongs.length} 首歌曲，占用存储空间约 {formatFileSize(getStorageInfo())}
                </Typography>
              </Box>
              <List>
                {downloadedSongs.map((song) => (
                  <ListItem key={song.id} divider>
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
                      primary={song.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption">
                            {song.ar.map(artist => artist.name).join(' / ')}
                          </Typography>
                          <Chip
                            label={song.quality || 'MEDIUM'}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 18 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handlePlay(song)}
                        sx={{ mr: 1 }}
                      >
                        <PlayArrow />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(song.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              暂无正在下载的歌曲
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              下载任务将在这里显示
            </Typography>
          </Box>
        </TabPanel>

        <Alert severity="info" sx={{ mt: 2 }}>
          下载的歌曲仅供个人欣赏，请勿用于商业用途。建议在WiFi环境下下载以节省流量。
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadManager; 
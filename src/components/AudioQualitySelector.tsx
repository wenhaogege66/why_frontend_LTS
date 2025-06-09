import React, { useState } from 'react';
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Settings, HighQuality } from '@mui/icons-material';
import { usePlayer, AudioQuality } from '../contexts/PlayerContext';

interface AudioQualitySelectorProps {
  compact?: boolean;
}

const AudioQualitySelector: React.FC<AudioQualitySelectorProps> = ({ compact = false }) => {
  const { playerState, setAudioQuality } = usePlayer();
  const [dialogOpen, setDialogOpen] = useState(false);

  const qualityOptions = [
    {
      value: AudioQuality.LOW,
      label: '标准',
      description: '128kbps - 节省流量',
      bitrate: '128 kbps',
    },
    {
      value: AudioQuality.MEDIUM,
      label: '高品质',
      description: '320kbps - 推荐',
      bitrate: '320 kbps',
    },
    {
      value: AudioQuality.HIGH,
      label: '无损',
      description: 'FLAC - 完美音质',
      bitrate: 'FLAC',
    },
    {
      value: AudioQuality.LOSSLESS,
      label: 'Hi-Res',
      description: '24bit/96kHz - 极致体验',
      bitrate: 'Hi-Res',
    },
  ];

  const getCurrentQualityLabel = () => {
    const option = qualityOptions.find(opt => opt.value === playerState.audioQuality);
    return option?.label || '高品质';
  };

  const handleQualityChange = (quality: AudioQuality) => {
    setAudioQuality(quality);
    setDialogOpen(false);
  };

  if (compact) {
    return (
      <>
        <Tooltip title="音质设置">
          <IconButton
            size="small"
            onClick={() => setDialogOpen(true)}
            sx={{ color: 'text.secondary' }}
          >
            <HighQuality fontSize="small" />
          </IconButton>
        </Tooltip>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>音质设置</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              选择音频播放质量。更高的音质会消耗更多流量。
            </Typography>
            <RadioGroup
              value={playerState.audioQuality}
              onChange={(e) => handleQualityChange(e.target.value as AudioQuality)}
            >
              {qualityOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{option.label}</Typography>
                        <Chip
                          label={option.bitrate}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    alignItems: 'flex-start',
                    mb: 1,
                    '& .MuiRadio-root': { mt: 0.5 }
                  }}
                />
              ))}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>关闭</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>音质</InputLabel>
      <Select
        value={playerState.audioQuality}
        label="音质"
        onChange={(e) => setAudioQuality(e.target.value as AudioQuality)}
      >
        {qualityOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {option.label}
              <Chip
                label={option.bitrate}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AudioQualitySelector; 
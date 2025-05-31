import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import { Home, Favorite, Settings, AutoAwesome, Mood } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const navigate = useNavigate();
    const menuItems = [
        { text: '首页', icon: <Home />, path: '/' },
        { text: '猜你喜欢', icon: <AutoAwesome />, path: '/recommend' },
        { text: '心情电台', icon: <Mood />, path: '/mood' },
        { text: '我的收藏', icon: <Favorite />, path: '/favorites' },
        { text: '设置', icon: <Settings />, path: '/settings' },
    ];

    const handleMenuItemClick = (path: string) => {
        navigate(path);  // 使用navigate跳转到对应路径
        onClose();       // 关闭侧边栏（如果是移动端）
    };


    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    bgcolor: '#f8f9fa',
                },
            }}
        >
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'ransom' }}>
                    WHY Music
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        onClick={() => handleMenuItemClick(item.path)}
                        sx={{
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar; 
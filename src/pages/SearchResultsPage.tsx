// src/pages/SearchResultsPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // 导入 useSearchParams
import {
    Box, Container, Typography, CircularProgress, Alert, Grid, Card, CardContent, CardMedia,
    // 导入其他你需要的 Material UI 组件来展示歌曲/专辑/艺术家等信息
} from '@mui/material';


// 导入你的 unifiedSearch 函数和 UnifiedSearchResults 接口
import { unifiedSearch, UnifiedSearchResults, Song } from '../api/search'; // 确保路径正确
import Sidebar from '../components/Sidebar';

function SearchResultsPage() {
    // 获取 URL 中的查询参数
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const query = searchParams.get('q'); // 获取 'q' 参数的值

    // 搜索结果状态
    const [searchResults, setSearchResults] = useState<UnifiedSearchResults | null>(null);
    // 加载状态
    const [loading, setLoading] = useState(true);
    // 错误状态
    const [error, setError] = useState<string | null>(null);

    // 使用 useEffect 在 query 变化时触发搜索
    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                // 如果没有查询参数，不执行搜索，并显示提示
                setLoading(false);
                setSearchResults(null);
                setError('请输入搜索内容');
                return;
            }

            setLoading(true);
            setSearchResults(null); // 清空上次结果
            setError(null); // 清空错误

            try {
                // 调用统一搜索 API
                // unifiedSearch 内部已经处理了 handleError 和 Promise.allSettled
                const results = await unifiedSearch({ query: query, page_wanted: 1, page_size: 20 }); // 可根据需要调整分页
                setSearchResults(results);
            } catch (err) {
                // 捕获 unifiedSearch 抛出的错误 (主要是在 Promise.allSettled 之前发生的错误)
                // individual API errors are handled/logged inside unifiedSearch
                setError('搜索过程中发生错误'); // 提供一个通用的错误信息
                console.error("Unified search failed:", err); // 记录详细错误到控制台
            } finally {
                setLoading(false);
            }
        };

        performSearch();

    }, [query]); // 依赖项是 query，当 URL 中的 q 参数变化时重新运行 effect

    // 渲染搜索结果的函数（示例）
    const renderSongList = (songs: Song[] | undefined, title: string) => {
        if (!songs || songs.length === 0) {
            return null; // 如果没有结果，不渲染该部分
        }
        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>{title}</Typography>
                <Grid container spacing={2}>
                    {songs.map(song => (
                         <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                           {/* 这里可以复用或创建 SongCard 组件来展示单首歌曲 */}
                           <Card sx={{ display: 'flex', borderRadius: 2 }}>
                               <CardMedia
                                   component="img"
                                   sx={{ width: 80, height: 80, borderRadius: '8px 0 0 8px' }}
                                   image={song.al.picUrl} // 假设 Album 中有 picUrl
                                   alt={song.name}
                               />
                               <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                   <CardContent sx={{ flex: '1 0 auto', py: 1, '&:last-child': { pb: 1 } }}>
                                       <Typography component="div" variant="body1" noWrap>
                                           {song.name}
                                       </Typography>
                                       <Typography variant="body2" color="text.secondary" noWrap>
                                           {song.ar.map(artist => artist.name).join(' / ')}
                                       </Typography>
                                   </CardContent>
                               </Box>
                               {/* 播放按钮等 */}
                           </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    // 如果你使用了 Layout 组件，将内容放在 Layout 中
    // return (
    //     <Layout> {/* Layout 应该包含 AppBar 和 Sidebar */}
    //         {/* ... 搜索结果页面的内容 ... */}
    //     </Layout>
    // );

    // 如果没有 Layout 组件，你可能需要在每个页面重复 AppBar/Sidebar 的结构
    // 这里只展示内容区域
    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#f8f9fa', width: '100%', minHeight: '100vh', overflow: 'auto', pt: '64px' /* 根据 AppBar 高度调整 */ }}>
             {/* 如果 AppBar/Sidebar 是在父组件或 Layout 中，这里只放内容 */}
             {/* 否则，你需要在这里复制 AppBar/Sidebar 的代码 */}
             {/* <AppBar ...>...</AppBar> */}
             {/* <Sidebar ...>...</Sidebar> */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

             <Container maxWidth="xl" sx={{ py: 4 }}>
                 {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
                 {error && <Alert severity="error">{error}</Alert>}

                 {!loading && !error && searchResults && (
                     <Box>
                         <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
                             搜索结果："{query}"
                         </Typography>

                         {/* 按分类渲染结果 */}
                         {/* unifiedSearch 返回的 data 在每个分类的响应对象中 */}
                         {/*{renderSongList(searchResults.byTitle?.data, '歌曲名匹配')}*/}
                         {/*{renderSongList(searchResults.byArtist?.data, '艺术家匹配')}*/}
                         {/*{renderSongList(searchResults.byAlbum?.data, '专辑匹配')}*/}
                         {renderSongList(searchResults.byDescription?.data, 'AI 推荐 (根据描述)')}
                         {renderSongList(searchResults.byMood?.data, 'AI 推荐 (根据心情)')}
                         {renderSongList(searchResults.byTitle?.data, 'AI 推荐 (根据主题)')}

                         {/* 如果所有分类都没有结果 */}
                         {
                          !searchResults.byDescription?.data?.length &&
                          !searchResults.byMood?.data?.length &&
                          !searchResults.byTitle?.data?.length && (
                            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                                未找到相关结果。
                            </Typography>
                         )}
                     </Box>
                 )}

                 {/* 如果没有查询，显示提示 */}
                 {!loading && !error && !query && (
                     <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                         请在顶部的搜索框输入歌曲、歌手或描述进行搜索。
                     </Typography>
                 )}

             </Container>
         </Box>
    );
}

export default SearchResultsPage;
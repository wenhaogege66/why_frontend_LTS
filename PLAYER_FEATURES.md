# 🎵 音乐播放器功能完善文档

## 新增功能概览

本次更新为音乐播放器添加了以下重要功能：

### 1. 📋 播放队列管理
- **播放队列显示**：可视化显示当前播放列表
- **队列操作**：添加、移除、重新排序歌曲
- **下一首播放**：将歌曲插入到当前播放位置之后
- **队列清空**：一键清空播放队列

### 2. 🔄 增强的播放模式
- **顺序播放** (`ORDER`)：按列表顺序播放
- **单曲循环** (`REPEAT_ONE`)：重复播放当前歌曲
- **列表循环** (`REPEAT_ALL`)：列表播放完后重新开始
- **随机播放** (`SHUFFLE`)：随机选择歌曲播放

### 3. 🎧 音质选择功能
- **标准音质** (128kbps)：节省流量，适合移动网络
- **高品质** (320kbps)：推荐设置，平衡音质与流量
- **无损音质** (FLAC)：完美音质体验
- **Hi-Res音质** (24bit/96kHz)：极致音质体验

### 4. 💾 离线下载支持
- **单曲下载**：下载喜欢的歌曲到本地
- **下载进度显示**：实时显示下载进度
- **下载管理器**：管理已下载的歌曲
- **离线播放**：无网络时播放已下载歌曲

## 功能使用指南

### 播放队列管理
1. 点击播放器右侧的 🎵 按钮打开播放队列
2. 在队列中可以：
   - 点击歌曲直接播放
   - 使用右侧菜单添加到队列或下一首播放
   - 拖拽重新排序（开发中）
   - 清空整个队列

### 播放模式切换
1. 点击播放器中的播放模式按钮（🔄/🔂/🔀）
2. 模式循环顺序：顺序 → 列表循环 → 单曲循环 → 随机播放
3. 当前模式会在按钮图标和提示中显示

### 音质设置
1. 点击播放器右侧的 🎵 (高音质)按钮
2. 在弹出的对话框中选择音质等级
3. 设置立即生效，影响后续播放的歌曲

### 下载功能
1. **下载单曲**：点击播放器中的 ⬇️ 按钮下载当前歌曲
2. **下载管理**：点击 ☁️ 按钮打开下载管理器
3. **离线播放**：在下载管理器中播放已下载的歌曲

## 技术实现细节

### 队列管理
- 使用 React Context 统一管理播放状态和队列
- 支持多种播放列表类型（搜索结果、收藏、专辑等）
- 队列操作实时更新UI状态

### 播放模式
- 播放结束时根据当前模式自动切换到下一首
- 随机播放避免重复选择当前歌曲
- 列表循环在末尾自动跳转到开头

### 音质选择
- 音质设置持久化保存
- 根据选择的音质获取对应的音频流
- 提供音质等级说明和建议

### 离线下载
- 使用 Fetch API 和 ReadableStream 实现下载
- 实时显示下载进度
- 使用 localStorage 保存下载文件（生产环境建议使用 IndexedDB）
- Base64 编码存储音频数据

## 组件结构

```
src/components/
├── AudioQualitySelector.tsx    # 音质选择组件
├── DownloadManager.tsx         # 下载管理器
├── QueueManager.tsx           # 队列管理器
└── GlobalPlayer.tsx           # 增强的全局播放器

src/contexts/
└── PlayerContext.tsx          # 播放器上下文（已增强）
```

## 类型定义

### 新增枚举
```typescript
enum AudioQuality {
  LOW = "low",        // 128kbps
  MEDIUM = "medium",  // 320kbps
  HIGH = "high",      // 无损
  LOSSLESS = "lossless" // Hi-Res
}

enum DownloadStatus {
  NOT_DOWNLOADED = "not_downloaded",
  DOWNLOADING = "downloading",
  DOWNLOADED = "downloaded",
  FAILED = "failed"
}

enum PlayMode {
  ORDER = "order",        // 按顺序播放
  REPEAT_ONE = "repeat_one", // 单曲循环
  SHUFFLE = "shuffle",    // 随机播放
  REPEAT_ALL = "repeat_all" // 列表循环
}
```

### 增强的接口
```typescript
interface Song {
  id: number;
  name: string;
  ar: Array<{ name: string; id?: number }>;
  al: { name: string; picUrl: string; id?: number };
  duration?: number;
  quality?: AudioQuality;
  downloadStatus?: DownloadStatus;
}

interface PlayerState {
  isPlaying: boolean;
  currentSongId: number | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  playMode: PlayMode;
  audioQuality: AudioQuality;  // 新增
}
```

## 后续优化建议

### 性能优化
1. 使用 IndexedDB 替代 localStorage 存储下载文件
2. 实现虚拟滚动优化大型播放列表
3. 添加歌曲预加载机制

### 用户体验
1. 添加下载进度通知
2. 支持批量下载
3. 添加播放历史记录
4. 实现拖拽排序功能

### 功能扩展
1. 支持播放列表导出/导入
2. 添加均衡器设置
3. 支持歌词卡拉OK模式
4. 添加音乐可视化效果

## 注意事项

1. **版权合规**：下载功能仅供个人使用，请遵守版权法规
2. **存储空间**：下载文件会占用浏览器存储空间，请定期清理
3. **网络使用**：高音质播放和下载会消耗更多流量
4. **浏览器兼容**：某些功能需要现代浏览器支持 
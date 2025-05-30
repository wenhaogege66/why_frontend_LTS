// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./font.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import SongDetail from "./pages/SongDetail";
import FavoritesPage from "./pages/FavoritesPage";
import Settings from "./pages/Settings";
import SearchResultsPage from "./pages/SearchResultsPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import RecommendPage from "./pages/RecommendPage";
import { PlayerProvider } from "./contexts/PlayerContext";
import GlobalPlayer from "./components/GlobalPlayer";
import Mood from "./pages/Mood";

// 创建一个包装组件来处理路由和播放器显示逻辑
function AppContent() {
  const location = useLocation();
  
  // 定义不显示播放器的路由
  const hidePlayerRoutes = ['/login', '/register'];
  const shouldHidePlayer = hidePlayerRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/song/:id" element={<SongDetail />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/artist/:artistId" element={<ArtistDetailPage />} />
        <Route path="/album/:albumId" element={<AlbumDetailPage />} />
      </Routes>
      {!shouldHidePlayer && <GlobalPlayer />}
    </>
  );
}

function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;

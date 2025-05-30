// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { PlayerProvider } from "./contexts/PlayerContext";
import GlobalPlayer from "./components/GlobalPlayer";
import Mood from "./pages/Mood";

function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/song/:id" element={<SongDetail />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/artist/:artistId" element={<ArtistDetailPage />} />
          <Route path="/album/:albumId" element={<AlbumDetailPage />} />
        </Routes>
        <GlobalPlayer />
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;

// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './font.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import SongDetail from './pages/SongDetail';
import Settings from './pages/Settings';
import SearchResultsPage from './pages/SearchResultsPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/song/:id" element={<SongDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<SearchResultsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App

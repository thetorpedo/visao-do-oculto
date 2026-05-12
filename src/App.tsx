import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import FolderLayout from './pages/FolderLayout';
import Home from './pages/Home';
import Origens from './pages/Origens';
import Poderes from './pages/Poderes';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FolderLayout />}>
        <Route index element={<Home />} />
        <Route path="/origens" element={<Origens />} />
        <Route path="/poderes" element={<Poderes />} />
        </Route>
        
      </Routes>
    </Router>
  );
}
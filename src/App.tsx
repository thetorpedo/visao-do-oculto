import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import FolderLayout from './pages/FolderLayout';
import Home from './pages/Home';
import Origens from './pages/Origens';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FolderLayout />}>
        <Route index element={<Home />} />
        <Route path="/origens" element={<Origens />} />
        </Route>
        
      </Routes>
    </Router>
  );
}
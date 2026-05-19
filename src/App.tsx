import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Equipamentos from './pages/Equipamentos';
import FolderLayout from './pages/FolderLayout';
import Home from './pages/Home';
import Origens from './pages/Origens';
import Poderes from './pages/Poderes';
import Trilhas from './pages/Trilhas';
import GlobalSearch from './components/GlobalSearch';
import Rituais from './pages/Rituais';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FolderLayout />}>
        <Route index element={<Home />} />
        <Route path="/origens" element={<Origens />} />
        <Route path="/poderes" element={<Poderes />} />
        <Route path="/trilhas" element={<Trilhas />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
        <Route path="/rituais" element={<Rituais />} />
        </Route>
        
      </Routes>
      <GlobalSearch />
    </Router>
  );
}
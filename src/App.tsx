import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Equipamentos from './pages/equipamentos/Equipamentos';
import FolderLayout from './pages/folderlayout/FolderLayout';
import Home from './pages/home/Home';
import Origens from './pages/origens/Origens';
import Poderes from './pages/poderes/Poderes';
import Trilhas from './pages/trilhas/Trilhas';
import GlobalSearch from './components/modals/global-search';
import Rituais from './pages/rituais/Rituais';
import Configuracoes from './pages/configurações/Configuracoes';
import TelaImportacao from './pages/telaimportação/TelaImportacao';
import Favoritos from './pages/favoritos/Favoritos';
import Fontes from './pages/fontes/Fontes';
import Regras from './pages/regras/Regras';
import DocumentReader from './components/modals/document-reader';
import ModalCriarRegistro from './components/modals/modal-create';
import { useData } from './context/DataContext';
import { UIProvider, useUI } from './context/UiContext';

// ─────────────────────────────────────────
// Modais globais — montados uma vez no topo
// ─────────────────────────────────────────

function GlobalModals() {
  const { leitor, fecharLeitor, modal, fecharModal } = useUI();

  return (
    <>
      <DocumentReader
        fonteId={leitor.fonteId}
        paginaImpressa={leitor.pagina}
        isOpen={leitor.isOpen}
        onClose={fecharLeitor}
      />
      {modal.isOpen && modal.categoria && (
        <ModalCriarRegistro
          categoria={modal.categoria}
          itemInicial={modal.itemInicial ?? undefined}
          onClose={fecharModal}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────

function AppRoutes() {
  const { status } = useData();

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%]">
        <p className="font-special text-2xl text-gray-700 animate-pulse tracking-widest uppercase">
          Carregando registros...
        </p>
      </div>
    );
  }

  if (status === 'empty') {
    return <TelaImportacao />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<FolderLayout />}>
          <Route index element={<Home />} />
          <Route path="/origens" element={<Origens />} />
          <Route path="/poderes" element={<Poderes />} />
          <Route path="/trilhas" element={<Trilhas />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/rituais" element={<Rituais />} />
          <Route path="/regras" element={<Regras />} />
          <Route path="/fontes" element={<Fontes />} />
          <Route path="/colecoes" element={<Favoritos />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
      <GlobalSearch />
      <GlobalModals />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <UIProvider>
        <AppRoutes />
      </UIProvider>
    </Router>
  );
}
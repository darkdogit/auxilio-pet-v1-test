import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Questionario from './pages/Questionario';
import Pagamento from './pages/Pagamento';
import StatusPedido from './pages/StatusPedido';
import Confirmacao from './pages/Confirmacao';
import Aprovacao from './pages/Aprovacao';

// 1. IMPORTAÇÕES DAS TELAS DE ADMIN
import Admin from './pages/Admin';
import AdminNew from './pages/AdminNew';

function App() {
  return (
    <Router>
      <Routes>
        {/* TELAS DO USUÁRIO */}
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/questionario" element={<Questionario />} />
        <Route path="/aprovacao" element={<Aprovacao />} />
        <Route path="/confirmacao" element={<Confirmacao />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/status" element={<StatusPedido />} />
        
        {/* 2. ROTAS DO ADMIN */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-painel" element={<AdminNew />} />
      </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Questionario from './pages/Questionario';
import Pagamento from './pages/Pagamento';
import StatusPedido from './pages/StatusPedido';
import Confirmacao from './pages/Confirmacao';
import Aprovacao from './pages/Aprovacao'; // <--- IMPORT NOVO

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/questionario" element={<Questionario />} />
        
        {/* TELA 1: VALOR + ONGS */}
        <Route path="/aprovacao" element={<Aprovacao />} />
        
        {/* TELA 2: BENEFÍCIOS */}
        <Route path="/confirmacao" element={<Confirmacao />} />
        
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/status" element={<StatusPedido />} />
      </Routes>
    </Router>
  );
}

export default App;
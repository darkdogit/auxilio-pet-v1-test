import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Heart } from 'lucide-react'; // Removi AlertCircle
import { useAnalytics } from '../hooks/useAnalytics';

export default function Aprovacao() {
  const navigate = useNavigate();
  const { trackButtonClick } = useAnalytics('aprovacao_valor');

  const handleContinue = () => {
    trackButtonClick('ver_beneficios');
    navigate('/confirmacao');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-32">
      <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-lg flex items-center justify-center gap-2">
          <span className="font-bold text-[#1351B4] text-lg flex items-center gap-2">
             <Shield size={20} /> Resultado da Análise
          </span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-lg animate-fadeIn">
        
        {/* CARD VALOR APROVADO */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6 text-center">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Valor Liberado Mensal</p>
          <div className="text-6xl font-black text-[#1351B4] tracking-tighter mb-4">
            R$ 450,00
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Infelizmente, no momento não é possível liberar um valor maior devido à alta demanda.
          </p>
        </div>

        {/* CARD EXPLICAÇÃO DA TAXA */}
        <div className="bg-[#1351B4] rounded-2xl p-6 shadow-lg text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Heart size={100} />
          </div>
          
          <div className="relative z-10">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
               Contribuição Solidária
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-4">
              Para concluir a liberação do Auxílio Pet, é necessário realizar a contribuição solidária única de <strong className="text-white bg-white/20 px-1 rounded">R$ 59,00</strong>.
            </p>
            
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <p className="text-xs leading-relaxed text-blue-50">
                Essa contribuição é destinada exclusivamente às ONGs e organizações sociais que trabalham no resgate, cuidado e proteção de animais — garantindo que mais famílias e seus pets também sejam ajudados.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex gap-3 items-start">
           <div className="bg-green-100 p-1.5 rounded-full shrink-0">
             <Shield size={16} className="text-green-700" />
           </div>
           <p className="text-green-800 text-xs leading-relaxed">
             Após a confirmação da contribuição e a análise final da necessidade, o auxílio é liberado imediatamente.
           </p>
        </div>

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="container mx-auto max-w-lg">
          <button 
            onClick={handleContinue}
            className="w-full bg-[#1351B4] hover:bg-[#0e3a80] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            Realizar Contribuição Solidária <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
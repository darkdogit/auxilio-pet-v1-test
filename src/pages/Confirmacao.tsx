import { useNavigate } from 'react-router-dom';
import { 
  Banknote, CheckCircle2, Stethoscope, Award, HeartPulse, ChevronRight 
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

export default function Confirmacao() {
  const navigate = useNavigate();
  const { trackButtonClick } = useAnalytics('confirmacao_beneficios');

  const handlePay = () => {
    trackButtonClick('ir_para_pagamento');
    navigate('/pagamento');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col relative">
      
      {/* HEADER - Ajustei py-4 para py-3 para ficar mais compacto como no print */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm sticky top-0 z-40 shrink-0">
        <div className="container mx-auto max-w-lg flex items-center gap-3">
          <div className="bg-[#1351B4] p-2 rounded-lg">
            <Award className="text-white" size={20} />
          </div>
          <span className="font-bold text-[#1351B4] text-lg">
             Benefícios do Programa
          </span>
        </div>
      </div>

      {/* CONTEÚDO - Ajustei py-6 para py-4 e pb-48 para pb-40 (ajuste fino do scroll final) */}
      <main className="flex-1 container mx-auto px-4 py-4 max-w-lg pb-40 flex flex-col">
        
        <div className="mb-4">
          <h2 className="text-[#333] font-bold text-lg mb-1">Confira seus benefícios</h2>
          <p className="text-gray-600 text-sm">
            Ao realizar a contribuição, você garante acesso imediato:
          </p>
        </div>

        {/* Ajustei space-y-4 para space-y-3 (cards mais próximos como na foto) */}
        <div className="space-y-3">
          
          <GovBenefitCard 
            icon={<Banknote size={22} />}
            title="Liberação Imediata"
            desc="Auxílio de até R$ 450,00 liberado em 24h."
          />

          <GovBenefitCard 
            icon={<CheckCircle2 size={22} />}
            title="Prioridade no Programa"
            desc="Prioridade nas próximas liberações e benefícios."
          />

          <GovBenefitCard 
            icon={<Stethoscope size={22} />}
            title="Suporte Veterinário"
            desc="Rede de veterinários com descontos exclusivos."
          />

          <GovBenefitCard 
            icon={<Award size={22} />}
            title="Certificado de Tutor"
            desc="Certificado digital oficial de tutor responsável."
          />

          <GovBenefitCard 
            icon={<HeartPulse size={22} />}
            title="Ajude Outros Pets"
            desc="Sua contribuição ajuda ONGs de resgate animal."
          />

        </div>
      </main>

      {/* FOOTER - Ajustei o padding interno (p-5 para p-4) para ocupar menos altura */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="container mx-auto max-w-lg p-4">
          
          <div className="flex justify-between items-end mb-3 px-1">
             <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wide">Valor da Contribuição</p>
                <p className="text-3xl font-black text-[#1351B4]">R$ 59,00</p>
             </div>
             <div className="text-right pb-1">
                <div className="inline-flex items-center gap-1 bg-green-50 text-[#00A91C] text-xs font-bold px-2 py-1 rounded border border-green-100">
                  <CheckCircle2 size={12} />
                  Até R$ 450/mês
                </div>
             </div>
          </div>
          
          <button 
            onClick={handlePay}
            className="w-full bg-[#1351B4] hover:bg-[#0c326f] text-white font-bold py-3.5 rounded-full shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            Confirmar e Pagar Agora <ChevronRight size={20} />
          </button>
          
          <p className="text-center text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-wide">
            Ambiente Seguro Gov.br
          </p>
        </div>
      </div>
    </div>
  );
}

// CARD - Reduzi o padding de p-5 para p-4 e o gap para gap-3 (visual mais denso)
function GovBenefitCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 items-center shadow-sm hover:border-[#1351B4] transition-colors group">
      <div className="bg-blue-50 text-[#1351B4] p-2.5 rounded-full shrink-0 group-hover:bg-[#1351B4] group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-[#1351B4] text-base mb-0.5 group-hover:text-[#0c326f]">{title}</h3>
        <p className="text-gray-600 text-xs leading-snug">{desc}</p>
      </div>
    </div>
  );
}
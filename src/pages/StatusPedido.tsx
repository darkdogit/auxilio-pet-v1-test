import { CheckCircle2, Clock, ShieldCheck, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StatusPedido() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      {/* 1. Header Padrão (Igual ao Cadastro) */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="container mx-auto max-w-2xl flex items-center justify-center">
          <span className="font-bold text-[#1351B4] text-lg flex items-center gap-2">
            <ShieldCheck size={24} />
            Cadastro Auxílio Pet
          </span>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* 2. Barra de Progresso (100% Azul - Indicando conclusão) */}
          <div className="h-1.5 w-full bg-gray-100">
            <div className="h-full w-full bg-[#1351B4]"></div>
          </div>

          <div className="p-8 text-center">
            
            {/* 3. Ícone de Sucesso Animado */}
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 p-4 rounded-full animate-bounce-slow">
                <CheckCircle2 className="text-emerald-600 w-16 h-16" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#1351B4] mb-3">
              Tudo Certo!
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Seu pagamento foi confirmado e sua solicitação já está em nosso sistema.
            </p>

            {/* 4. Card de Status "Em Análise" */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left mb-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
                  <Clock className="w-6 h-6 text-[#1351B4]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1351B4] text-lg">Em Análise</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    Nossa equipe já recebeu seus dados e o questionário.
                    A liberação do auxílio ocorre em breve após a validação das informações.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Botão Principal */}
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#1351B4] hover:bg-[#0e3a80] text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
            >
              <Home size={20} />
              Voltar ao Início
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
              <ShieldCheck className="w-4 h-4" />
              Processo finalizado com segurança.
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
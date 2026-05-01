import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, ShieldCheck, Home, Banknote, Award, HeartPulse, Stethoscope, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function StatusPedido() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetchStatus();
    // Continua atualizando automaticamente (Polling) para pegar as atualizações do Admin
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    const regId = localStorage.getItem('registration_id');
    if (!regId) {
      navigate('/');
      return;
    }

    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', regId)
      .single();

    if (data) {
      setUserData(data);
    }
    setLoading(false);
  };

  const handleRequestSaque = async () => {
    const regId = localStorage.getItem('registration_id');
    
    if (!regId) {
      alert("Sessão não encontrada.");
      return;
    }

    setIsRequesting(true);
    
    await (supabase.from('registrations') as any)
      .update({ status_saque: 'solicitado' })
      .eq('id', regId);

    await fetchStatus();
    setIsRequesting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1351B4] animate-spin" />
      </div>
    );
  }

  // Define quão cheia fica a barra de progresso no topo
  const getProgressWidth = () => {
    if (userData?.status_saque === 'pago') return 'w-full bg-emerald-500';
    if (userData?.status_saque === 'solicitado') return 'w-3/4 bg-green-500 animate-pulse';
    if (userData?.status_analise === 'aprovado') return 'w-1/2 bg-green-400';
    return 'w-1/4 bg-[#1351B4] animate-pulse';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="container mx-auto max-w-2xl flex items-center justify-center">
          <span className="font-bold text-[#1351B4] text-lg flex items-center gap-2">
            <ShieldCheck size={24} />
            Painel do Beneficiário
          </span>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* BARRA DE PROGRESSO DINÂMICA */}
          <div className="h-1.5 w-full bg-gray-100">
            <div className={`h-full transition-all duration-1000 ${getProgressWidth()}`}></div>
          </div>

          <div className="p-8 text-center">
            
            {/* TELA 1: EM ANÁLISE */}
            {userData?.status_analise === 'em_analise' && (
              <div className="animate-fadeIn">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 p-4 rounded-full animate-bounce-slow">
                    <Clock className="text-[#1351B4] w-16 h-16" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-[#1351B4] mb-3">Conta em Análise</h1>
                <p className="text-gray-600 mb-8 text-lg">
                  Sua solicitação está sendo avaliada por um de nossos administradores. Retorne a esta página em breve.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 text-left flex gap-3">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  Aguardando liberação do sistema...
                </div>
              </div>
            )}

            {/* TELA 2: APROVADO, MAS SAQUE AINDA NÃO SOLICITADO */}
            {userData?.status_analise === 'aprovado' && userData?.status_saque === 'nao_solicitado' && (
              <div className="animate-fadeIn">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="text-green-600 w-16 h-16" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-green-600 mb-2">Cadastro Aprovado!</h1>
                <p className="text-gray-600 mb-6">Você já pode requisitar o seu benefício mensal.</p>

                <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
                  <h3 className="font-bold text-[#333] border-b pb-2 mb-2">Seus Benefícios Ativos:</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Banknote className="text-green-600" size={20} /> Auxílio de até R$ 450,00 mensal
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Stethoscope className="text-blue-600" size={20} /> Consultas Veterinárias Gratuitas
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <HeartPulse className="text-red-500" size={20} /> Medicamentos e Vacinas
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Award className="text-yellow-500" size={20} /> Prioridade em Cirurgias
                  </div>
                </div>

                <button
                  onClick={handleRequestSaque}
                  disabled={isRequesting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                >
                  {isRequesting ? <Loader2 className="animate-spin" size={24} /> : <Banknote size={24} />}
                  REQUISITAR SAQUE (R$ 450,00)
                </button>
              </div>
            )}

            {/* TELA 3: SAQUE SOLICITADO (PENDENTE) */}
            {userData?.status_saque === 'solicitado' && (
              <div className="animate-fadeIn">
                <div className="flex justify-center mb-6">
                  <div className="bg-emerald-100 p-4 rounded-full">
                    <Clock className="text-emerald-600 w-16 h-16 animate-pulse" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-emerald-600 mb-3">Saque em Processamento!</h1>
                <p className="text-gray-600 mb-8 text-lg">
                  Sua requisição de <strong>R$ 450,00</strong> foi enviada ao sistema financeiro. O valor será depositado em breve na sua chave PIX cadastrada.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 text-left">
                  <strong>Chave PIX cadastrada:</strong> {userData?.chave_pix || 'Não informada'}
                </div>
              </div>
            )}

            {/* NOVA TELA 4: PAGAMENTO CONFIRMADO! */}
            {userData?.status_saque === 'pago' && (
              <div className="animate-fadeIn">
                <div className="flex justify-center mb-6">
                  <div className="bg-emerald-100 p-5 rounded-full border-4 border-emerald-200">
                    <CheckCircle2 className="text-emerald-600 w-16 h-16" />
                  </div>
                </div>
                <h1 className="text-3xl font-black text-emerald-600 mb-3 uppercase tracking-tight">Saque Concluído!</h1>
                <p className="text-gray-600 mb-8 text-lg">
                  O valor de <strong>R$ 450,00</strong> foi transferido com sucesso para a sua chave PIX. Verifique o extrato da sua conta bancária.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 text-left">
                  <strong>Status da Transação:</strong> Confirmado e Finalizado pelo Governo.
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-all mt-6 flex items-center justify-center gap-2"
            >
              <Home size={20} /> Voltar ao Início
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
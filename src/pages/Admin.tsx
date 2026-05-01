import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, ArrowLeft, LogOut, CheckCircle, Banknote, User, FileText, ShieldCheck, Lock, Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface Registration {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  ip_address: string;
  created_at: string;
  status_analise: string;
  status_saque: string;
  chave_pix: string;
  instituicao_bancaria: string;
  nome_titular: string;
  documento_titular: string;
  reside_brasil: boolean;
}

interface Questionnaire {
  quantidade_pets: number;
  alimentacao: string;
  frequencia_alimentacao: string;
  origem: string;
  emergencia_financeira: string;
  vacinas: string;
  castrado: string;
  controle_parasitas: string;
  dificuldade_financeira: string;
}

const BARUERI_LOGO_URL = "/logo_barueri.png";

function Admin() {
  const navigate = useNavigate();
  
  // Estados de Autenticação
  const [session, setSession] = useState<any>(null);
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Estados de Dados
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'saques'>('pendentes');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingAuth(false);
      if (session) loadData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: emailLogin,
      password: senhaLogin,
    });

    if (error) {
      setLoginError('E-mail ou senha incorretos.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const loadData = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao carregar dados:", error.message);
    } else {
      setRegistrations((data as Registration[]) || []);
    }
  };

  const handleOpenDetails = async (user: Registration) => {
    setSelectedUser(user);
    setQuestionnaire(null);

    const { data } = await supabase
      .from('pet_questionnaire')
      .select('*')
      .eq('registration_id', user.id)
      .single();

    if (data) setQuestionnaire(data as Questionnaire);
  };

  const handleApprove = async (id: string) => {
    await (supabase.from('registrations') as any)
      .update({ status_analise: 'aprovado' })
      .eq('id', id);
    alert('Usuário aprovado com sucesso!');
    loadData();
    if (selectedUser) setSelectedUser({ ...selectedUser, status_analise: 'aprovado' });
  };

  // --- NOVA FUNÇÃO: ALTERNAR STATUS DE PAGAMENTO ---
  const handleTogglePayment = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pago' ? 'solicitado' : 'pago';
    await (supabase.from('registrations') as any)
      .update({ status_saque: newStatus })
      .eq('id', id);
    
    alert(newStatus === 'pago' ? 'Pagamento confirmado com sucesso!' : 'Confirmação de pagamento desfeita.');
    loadData();
    if (selectedUser) setSelectedUser({ ...selectedUser, status_saque: newStatus });
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');

  const pendingUsers = registrations.filter(r => r.status_analise !== 'aprovado');
  // Agora a aba de saques mostra os solicitados e os que já foram pagos
  const withdrawalUsers = registrations.filter(r => r.status_saque === 'solicitado' || r.status_saque === 'pago');

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1351B4] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-[#1351B4] p-6 text-center flex flex-col items-center">
            <img src={BARUERI_LOGO_URL} alt="Barueri" className="h-16 w-auto brightness-0 invert mb-4" />
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <ShieldCheck /> Acesso Restrito
            </h2>
          </div>
          <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-6">
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm font-medium">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">E-mail de Administrador</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1351B4] focus:border-transparent transition-all outline-none"
                  placeholder="admin@barueri.sp.gov.br"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1351B4] focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#1351B4] hover:bg-[#0c326f] text-white font-bold py-3.5 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TELA DE DETALHES DO USUÁRIO ---
  if (selectedUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
        <div className="w-full bg-[#1351B4] py-1 px-4 text-xs flex justify-between items-center text-white">
          <span className="font-bold tracking-wider">PREFEITURA DE BARUERI - MÓDULO ADMINISTRATIVO</span>
        </div>
        <div className="w-full h-[4px] bg-gradient-to-r from-red-600 via-white to-black"></div>

        <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-[#1351B4] transition-colors flex items-center gap-1">
              <ArrowLeft size={20} /> Voltar
            </button>
            <div className="font-bold text-[#1351B4] text-lg flex items-center gap-2">
              <ShieldCheck size={20} /> Detalhes do Cadastro
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-black text-[#333] mb-6 border-b-2 border-gray-100 pb-4">
                Ficha Cadastral: {selectedUser.full_name}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-[#1351B4] flex items-center gap-2 text-lg">
                    <User size={20} /> Dados Pessoais
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 text-sm">
                    <p><strong className="text-gray-700">Nome:</strong> {selectedUser.full_name}</p>
                    <p><strong className="text-gray-700">Email:</strong> {selectedUser.email}</p>
                    <p><strong className="text-gray-700">WhatsApp:</strong> {selectedUser.whatsapp}</p>
                    <p><strong className="text-gray-700">IP de Registro:</strong> <span className="font-mono bg-gray-200 px-1 rounded">{selectedUser.ip_address || 'Não capturado'}</span></p>
                    <p><strong className="text-gray-700">Data do Cadastro:</strong> {formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-green-700 flex items-center gap-2 text-lg">
                    <Banknote size={20} /> Dados de Repasse (PIX)
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3 text-sm">
                    <p><strong className="text-green-900">Chave PIX:</strong> {selectedUser.chave_pix || 'Não informada'}</p>
                    <p><strong className="text-green-900">Banco:</strong> {selectedUser.instituicao_bancaria || 'Não informado'}</p>
                    <p><strong className="text-green-900">Nome do Titular:</strong> {selectedUser.nome_titular || 'Não informado'}</p>
                    <p><strong className="text-green-900">Documento (CPF/RG):</strong> {selectedUser.documento_titular || 'Não informado'}</p>
                    <p><strong className="text-green-900">Reside no Brasil?</strong> {selectedUser.reside_brasil ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="font-bold text-orange-700 flex items-center gap-2 text-lg">
                  <FileText size={20} /> Questionário do Pet
                </h3>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {questionnaire ? (
                    <>
                      <p><strong className="text-orange-900">Quantidade de Pets:</strong> {questionnaire.quantidade_pets}</p>
                      <p><strong className="text-orange-900">Alimentação:</strong> {questionnaire.alimentacao || 'Não informado'}</p>
                      <p><strong className="text-orange-900">Dificuldade Financeira:</strong> {questionnaire.dificuldade_financeira || 'Não informado'}</p>
                      <p><strong className="text-orange-900">Castrado:</strong> {questionnaire.castrado || 'Não informado'}</p>
                      <p><strong className="text-orange-900">Vacinas:</strong> {questionnaire.vacinas || 'Não informado'}</p>
                      <p><strong className="text-orange-900">Emergência Financeira:</strong> {questionnaire.emergencia_financeira || 'Não informado'}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic col-span-2">Nenhum questionário encontrado para este usuário.</p>
                  )}
                </div>
              </div>

              {/* AÇÕES DO ADMIN: APROVAÇÃO OU PAGAMENTO */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-4">
                
                {/* Se a conta AINDA NÃO FOI APROVADA */}
                {selectedUser.status_analise !== 'aprovado' && (
                  <button 
                    onClick={() => handleApprove(selectedUser.id)} 
                    className="w-full md:w-auto bg-[#1351B4] hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <CheckCircle size={22} /> Aprovar Conta
                  </button>
                )}

                {/* Se o SAQUE FOI SOLICITADO */}
                {selectedUser.status_saque === 'solicitado' && (
                  <button 
                    onClick={() => handleTogglePayment(selectedUser.id, selectedUser.status_saque)} 
                    className="w-full md:w-auto bg-[#00A91C] hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <Banknote size={22} /> Confirmar Pagamento do PIX
                  </button>
                )}

                {/* Se o SAQUE JÁ FOI PAGO (Botão para desfazer caso clicado por engano) */}
                {selectedUser.status_saque === 'pago' && (
                  <button 
                    onClick={() => handleTogglePayment(selectedUser.id, selectedUser.status_saque)} 
                    className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <ArrowLeft size={22} /> Pagamento Confirmado (Desfazer)
                  </button>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- TELA PRINCIPAL (LISTAGEM DE USUÁRIOS) ---
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      <div className="w-full bg-[#1351B4] py-1 px-4 text-xs flex justify-between items-center text-white">
        <span className="font-bold tracking-wider">PREFEITURA DE BARUERI - GESTÃO</span>
      </div>
      <div className="w-full h-[4px] bg-gradient-to-r from-red-600 via-white to-black"></div>

      <header className="bg-white border-b border-gray-200 py-3 px-4 md:px-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={BARUERI_LOGO_URL} alt="Barueri" className="h-10 md:h-12 object-contain" />
          <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
          <div className="font-bold text-[#1351B4] text-lg flex items-center gap-2">
            <ShieldCheck size={24} /> Central do Auxílio Pet
          </div>
        </div>
        <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors text-sm">
          <LogOut size={16} /> Sair do Sistema
        </button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('pendentes')} 
            className={`flex-1 py-4 px-6 font-bold rounded-t-lg border-b-4 transition-all ${activeTab === 'pendentes' ? 'bg-white text-[#1351B4] border-[#1351B4] shadow-sm' : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'}`}
          >
            Contas em Análise ({pendingUsers.length})
          </button>
          <button 
            onClick={() => setActiveTab('saques')} 
            className={`flex-1 py-4 px-6 font-bold rounded-t-lg border-b-4 transition-all ${activeTab === 'saques' ? 'bg-white text-[#00A91C] border-[#00A91C] shadow-sm' : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'}`}
          >
            Aba de Saques (PIX)
          </button>
        </div>

        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#f1f5f9] border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-bold">Solicitante</th>
                <th className="px-6 py-4 font-bold">Contato</th>
                <th className="px-6 py-4 font-bold">Data</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(activeTab === 'pendentes' ? pendingUsers : withdrawalUsers).map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#333]">{user.full_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{user.whatsapp}</td>
                  <td className="px-6 py-4 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    {activeTab === 'pendentes' ? (
                      <span className="bg-blue-100 text-[#1351B4] px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Em Análise</span>
                    ) : user.status_saque === 'pago' ? (
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 flex items-center gap-1 w-max">
                        <CheckCircle2 size={14} /> Pago
                      </span>
                    ) : (
                      <span className="bg-green-100 text-[#00A91C] px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-max animate-pulse">
                        <Banknote size={14} /> Saque Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenDetails(user)} 
                        className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs font-bold" 
                      >
                        <Eye size={16}/> Ficha
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(activeTab === 'pendentes' ? pendingUsers : withdrawalUsers).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">Nenhum registro encontrado nesta categoria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Admin;
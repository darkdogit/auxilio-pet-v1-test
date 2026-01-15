import { useState, useEffect } from 'react';
import { Heart, Lock, LogOut, Users, FileText, Phone, Mail, Info, Trash2, AlertTriangle, Globe, BarChart3, Activity, Download, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Registration {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  ip_address?: string;
  selfie_url: string | null;
  pet_photos: string[] | null;
  created_at: string;
}

interface PetQuestionnaire {
  id: string;
  registration_id: string;
  alimentacao: string;
  frequencia_alimentacao: string;
  origem: string;
  emergencia_financeira: string;
  vacinas: string;
  castrado: string;
  controle_parasitas: string;
  created_at: string;
}

interface Pet {
  id: string;
  registration_id: string;
  pet_type: string;
  breed: string;
  age: string;
  name: string;
  created_at: string;
}

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [questionnaires, setQuestionnaires] = useState<PetQuestionnaire[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'questionnaires' | 'pets'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      loadData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedEmail === 'adm@adm.com' && trimmedPassword === 'Admin123!') {
      setIsLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      loadData();
    } else {
      setError('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
    setEmail('');
    setPassword('');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: regsData, error: regsError } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (regsError) throw regsError;
      setRegistrations(regsData || []);

      const { data: questData, error: questError } = await supabase
        .from('pet_questionnaire')
        .select('*')
        .order('created_at', { ascending: false });

      if (questError) throw questError;
      setQuestionnaires(questData || []);

      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (petsError) throw petsError;
      setPets(petsData || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhotoUrl = (fileName: string | null) => {
    if (!fileName) return null;
    const { data } = supabase.storage
      .from('user-photos')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleClearDatabase = async () => {
    setLoading(true);
    setDeleteMessage('');
    try {
      const { error: petsError } = await supabase
        .from('pets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (petsError) throw petsError;

      const { error: questError } = await supabase
        .from('pet_questionnaire')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (questError) throw questError;

      const { error: regsError } = await supabase
        .from('registrations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (regsError) throw regsError;

      setDeleteMessage('Banco de dados limpo com sucesso!');
      setRegistrations([]);
      setQuestionnaires([]);
      setPets([]);
      setShowDeleteModal(false);
      setConfirmText('');

      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao limpar banco de dados:', err);
      setDeleteMessage('Erro ao limpar banco de dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setConfirmText('');
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.whatsapp.includes(searchTerm) ||
    (reg.ip_address && reg.ip_address.includes(searchTerm))
  );

  const getRegistrationPets = (regId: string) => {
    return pets.filter(pet => pet.registration_id === regId);
  };

  const getRegistrationQuestionnaire = (regId: string) => {
    return questionnaires.find(q => q.registration_id === regId);
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'WhatsApp', 'IP', 'Data de Cadastro'];
    const rows = registrations.map(reg => [
      reg.full_name,
      reg.email,
      reg.whatsapp,
      reg.ip_address || 'N/A',
      formatDate(reg.created_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadastros-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-5"></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl p-4 shadow-xl">
                <Heart className="text-white" size={40} fill="currentColor" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">Admin Panel</h1>
            <p className="text-white/60 text-center mb-8">AUXILIO PET Management</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="adm@adm.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02]"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-5"></div>

      <nav className="relative z-20 bg-gradient-to-r from-slate-900/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl p-2.5 shadow-lg">
                <Heart className="text-white" size={26} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">AUXILIO PET</h1>
                <p className="text-emerald-400 text-xs font-medium">Dashboard Administrativo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Limpar BD</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {deleteMessage && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm ${
            deleteMessage.includes('sucesso')
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
              : 'bg-red-500/20 border-red-500/50 text-red-200'
          } shadow-lg`}>
            {deleteMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 rounded-xl p-3">
                <Users className="text-blue-400" size={24} />
              </div>
              <Activity className="text-blue-400/50" size={20} />
            </div>
            <p className="text-blue-200/70 text-sm font-medium mb-1">Total de Cadastros</p>
            <p className="text-white text-3xl font-bold">{registrations.length}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-400/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/20 rounded-xl p-3">
                <Heart className="text-emerald-400" size={24} fill="currentColor" />
              </div>
              <Activity className="text-emerald-400/50" size={20} />
            </div>
            <p className="text-emerald-200/70 text-sm font-medium mb-1">Pets Cadastrados</p>
            <p className="text-white text-3xl font-bold">{pets.length}</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-400/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-violet-500/20 rounded-xl p-3">
                <FileText className="text-violet-400" size={24} />
              </div>
              <Activity className="text-violet-400/50" size={20} />
            </div>
            <p className="text-violet-200/70 text-sm font-medium mb-1">Questionários</p>
            <p className="text-white text-3xl font-bold">{questionnaires.length}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-400/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-500/20 rounded-xl p-3">
                <BarChart3 className="text-amber-400" size={24} />
              </div>
              <Activity className="text-amber-400/50" size={20} />
            </div>
            <p className="text-amber-200/70 text-sm font-medium mb-1">Taxa de Conversão</p>
            <p className="text-white text-3xl font-bold">
              {registrations.length > 0 ? Math.round((questionnaires.length / registrations.length) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-white/10">
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'registrations'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Cadastros ({registrations.length})
              </button>
              <button
                onClick={() => setActiveTab('pets')}
                className={`px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'pets'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Pets ({pets.length})
              </button>
            </div>

            {activeTab === 'registrations' && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-16 h-16 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-white/60 mt-4 text-lg">Carregando dados...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                          <Users className="text-blue-400" size={20} />
                          Últimos Cadastros
                        </h3>
                        <div className="space-y-3">
                          {registrations.slice(0, 5).map((reg) => (
                            <div key={reg.id} className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all">
                              <p className="text-white font-semibold">{reg.full_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-white/60 text-xs">{reg.email}</p>
                                {reg.ip_address && (
                                  <span className="flex items-center gap-1 text-emerald-400 text-xs">
                                    <Globe size={12} />
                                    {reg.ip_address}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                          <Heart className="text-emerald-400" size={20} fill="currentColor" />
                          Últimos Pets
                        </h3>
                        <div className="space-y-3">
                          {pets.slice(0, 5).map((pet) => (
                            <div key={pet.id} className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all">
                              <p className="text-white font-semibold">{pet.name}</p>
                              <p className="text-white/60 text-xs">{pet.pet_type} - {pet.breed} - {pet.age}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <BarChart3 className="text-amber-400" size={20} />
                        Estatísticas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/60 text-sm mb-1">Média de pets por cadastro</p>
                          <p className="text-white text-2xl font-bold">
                            {registrations.length > 0 ? (pets.length / registrations.length).toFixed(1) : '0'}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/60 text-sm mb-1">Questionários completos</p>
                          <p className="text-white text-2xl font-bold">{questionnaires.length}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/60 text-sm mb-1">IPs únicos</p>
                          <p className="text-white text-2xl font-bold">
                            {new Set(registrations.map(r => r.ip_address).filter(Boolean)).size}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'registrations' && (
                  <div className="space-y-4">
                    {filteredRegistrations.length === 0 ? (
                      <div className="text-center py-20">
                        <Users className="mx-auto text-white/20 mb-4" size={64} />
                        <p className="text-white/60 text-lg">Nenhum cadastro encontrado</p>
                      </div>
                    ) : (
                      filteredRegistrations.map((reg) => {
                        const regPets = getRegistrationPets(reg.id);
                        const regQuestionnaire = getRegistrationQuestionnaire(reg.id);

                        return (
                          <div key={reg.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                              <div className="flex-1 space-y-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2">
                                      <Users className="text-white" size={20} />
                                    </div>
                                    <div>
                                      <h3 className="text-white text-xl font-bold">{reg.full_name}</h3>
                                      <p className="text-white/60 text-sm">{formatDate(reg.created_at)}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                    <Mail className="text-blue-400" size={18} />
                                    <div>
                                      <p className="text-white/60 text-xs">Email</p>
                                      <p className="text-white font-medium text-sm">{reg.email}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                    <Phone className="text-emerald-400" size={18} />
                                    <div>
                                      <p className="text-white/60 text-xs">WhatsApp</p>
                                      <p className="text-white font-medium text-sm">{reg.whatsapp}</p>
                                    </div>
                                  </div>

                                  {reg.ip_address && (
                                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                      <Globe className="text-violet-400" size={18} />
                                      <div>
                                        <p className="text-white/60 text-xs">Endereço IP</p>
                                        <p className="text-white font-medium text-sm font-mono">{reg.ip_address}</p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                    <Info className="text-amber-400" size={18} />
                                    <div>
                                      <p className="text-white/60 text-xs">Status</p>
                                      <p className="text-white font-medium text-sm">
                                        {regQuestionnaire ? 'Completo' : 'Pendente'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {regPets.length > 0 && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                    <p className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
                                      <Heart size={16} fill="currentColor" />
                                      Pets cadastrados ({regPets.length})
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {regPets.map((pet) => (
                                        <div key={pet.id} className="bg-white/5 rounded-lg p-2">
                                          <p className="text-white font-medium text-sm">{pet.name}</p>
                                          <p className="text-white/60 text-xs">{pet.pet_type} - {pet.breed}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {(reg.selfie_url || (reg.pet_photos && reg.pet_photos.length > 0)) && (
                                <div className="lg:w-64">
                                  <p className="text-white/80 font-semibold mb-3 text-sm">Fotos Enviadas</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {reg.selfie_url && (
                                      <div className="relative group">
                                        <div className="absolute -top-2 -right-2 z-10 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg">
                                          Selfie
                                        </div>
                                        <img
                                          src={getPhotoUrl(reg.selfie_url) || ''}
                                          alt="Selfie"
                                          className="w-full h-24 object-cover rounded-lg border-2 border-blue-400/40 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                                          onClick={() => window.open(getPhotoUrl(reg.selfie_url) || '', '_blank')}
                                        />
                                      </div>
                                    )}
                                    {reg.pet_photos?.slice(0, 3).map((photo, index) => (
                                      <div key={index} className="relative group">
                                        <div className="absolute -top-2 -right-2 z-10 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg">
                                          Pet
                                        </div>
                                        <img
                                          src={getPhotoUrl(photo) || ''}
                                          alt={`Pet ${index + 1}`}
                                          className="w-full h-24 object-cover rounded-lg border-2 border-emerald-400/40 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                                          onClick={() => window.open(getPhotoUrl(photo) || '', '_blank')}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'pets' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <Heart className="mx-auto text-white/20 mb-4" size={64} fill="currentColor" />
                        <p className="text-white/60 text-lg">Nenhum pet cadastrado</p>
                      </div>
                    ) : (
                      pets.map((pet) => (
                        <div key={pet.id} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-400/20 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-emerald-500/20 rounded-xl p-2.5">
                              <Heart className="text-emerald-400" size={20} fill="currentColor" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-lg">{pet.name}</h3>
                              <p className="text-emerald-400 text-xs font-medium">{pet.pet_type}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/60 text-sm">Raça</span>
                              <span className="text-white font-medium text-sm">{pet.breed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60 text-sm">Idade</span>
                              <span className="text-white font-medium text-sm">{pet.age}</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-white/10">
                              <p className="text-white/60 text-xs">Cadastrado em</p>
                              <p className="text-white text-xs">{formatDate(pet.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center px-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/20 rounded-full p-4 animate-pulse">
                <AlertTriangle className="text-red-400" size={48} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Limpar Banco de Dados?
            </h2>

            <p className="text-white/70 text-center mb-6">
              Esta ação irá deletar permanentemente todos os cadastros, pets e questionários.
              Esta operação não pode ser desfeita.
            </p>

            <div className="mb-6">
              <p className="text-white/80 text-sm mb-3 text-center">
                Para confirmar, digite <span className="font-bold text-red-400">EXCLUIR TUDO</span> abaixo:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite aqui..."
                className="w-full px-4 py-3 bg-white/10 border border-red-500/30 rounded-xl text-white placeholder-white/40 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={loading}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearDatabase}
                disabled={loading || confirmText !== 'EXCLUIR TUDO'}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Limpando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;

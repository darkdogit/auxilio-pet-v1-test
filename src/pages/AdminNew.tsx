import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Users,
  Activity,
  TrendingUp,
  MousePointer,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Trash2,
  Filter,
  Download
} from 'lucide-react';

interface Registration {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  ip_address: string;
  session_id: string;
  user_agent: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  created_at: string;
}

interface UserEvent {
  id: string;
  session_id: string;
  registration_id: string;
  event_type: string;
  event_name: string;
  page_path: string;
  event_data: any;
  ip_address: string;
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

interface Questionnaire {
  id: string;
  registration_id: string;
  quantidade_pets: number;
  alimentacao: string;
  frequencia_alimentacao: string;
  origem: string;
  emergencia_financeira: string;
  vacinas: string;
  castrado: string;
  controle_parasitas: string;
  dificuldade_financeira: string;
  created_at: string;
}

function AdminNew() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [userQuestionnaire, setUserQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    total_events: 0,
    page_views: 0,
    button_clicks: 0,
    form_submits: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: regData } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: eventData } = await supabase
        .from('user_events')
        .select('*')
        .order('created_at', { ascending: false });

      setRegistrations(regData || []);
      setEvents(eventData || []);

      const pageViews = eventData?.filter(e => e.event_type === 'page_view').length || 0;
      const buttonClicks = eventData?.filter(e => e.event_type === 'button_click').length || 0;
      const formSubmits = eventData?.filter(e => e.event_type === 'form_submit').length || 0;

      setStats({
        total_users: regData?.length || 0,
        total_events: eventData?.length || 0,
        page_views: pageViews,
        button_clicks: buttonClicks,
        form_submits: formSubmits,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (user: Registration) => {
    setSelectedUser(user);

    const { data: eventsData } = await supabase
      .from('user_events')
      .select('*')
      .or(`session_id.eq.${user.session_id},registration_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    const { data: petsData } = await supabase
      .from('pets')
      .select('*')
      .eq('registration_id', user.id);

    const { data: questionnaireData } = await supabase
      .from('pet_questionnaire')
      .select('*')
      .eq('registration_id', user.id)
      .single();

    setUserEvents(eventsData || []);
    setUserPets(petsData || []);
    setUserQuestionnaire(questionnaireData);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view':
        return <Eye size={16} className="text-blue-500" />;
      case 'button_click':
        return <MousePointer size={16} className="text-green-500" />;
      case 'form_submit':
        return <TrendingUp size={16} className="text-purple-500" />;
      case 'form_start':
        return <Activity size={16} className="text-yellow-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes do Usuário</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Pessoais</h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Users size={16} />
                      Nome Completo
                    </div>
                    <div className="font-semibold text-gray-900">{selectedUser.full_name}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Mail size={16} />
                      Email
                    </div>
                    <div className="font-semibold text-gray-900">{selectedUser.email}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Phone size={16} />
                      WhatsApp
                    </div>
                    <div className="font-semibold text-gray-900">{selectedUser.whatsapp}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <MapPin size={16} />
                      Endereço IP
                    </div>
                    <div className="font-semibold text-gray-900">{selectedUser.ip_address || 'N/A'}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Calendar size={16} />
                      Data de Cadastro
                    </div>
                    <div className="font-semibold text-gray-900">{formatDate(selectedUser.created_at)}</div>
                  </div>
                </div>

                {selectedUser.utm_source && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Origem do Tráfego</h3>
                    <div className="space-y-2 text-sm">
                      {selectedUser.utm_source && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fonte:</span>
                          <span className="font-medium">{selectedUser.utm_source}</span>
                        </div>
                      )}
                      {selectedUser.utm_medium && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Meio:</span>
                          <span className="font-medium">{selectedUser.utm_medium}</span>
                        </div>
                      )}
                      {selectedUser.utm_campaign && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Campanha:</span>
                          <span className="font-medium">{selectedUser.utm_campaign}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {userPets.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Pets Cadastrados</h3>
                    <div className="space-y-3">
                      {userPets.map((pet) => (
                        <div key={pet.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-900">{pet.name}</div>
                          <div className="text-sm text-gray-600">
                            {pet.pet_type} • {pet.breed} • {pet.age}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Jornada do Usuário (Funil)</h2>

                {userEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum evento registrado</p>
                ) : (
                  <div className="space-y-3">
                    {userEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getEventIcon(event.event_type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{event.event_name}</span>
                            <span className="text-xs text-gray-500">({event.event_type})</span>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            Página: {event.page_path}
                          </div>

                          {event.event_data && Object.keys(event.event_data).length > 0 && (
                            <div className="text-xs bg-white rounded p-2 border border-gray-200">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(event.event_data, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock size={12} />
                            {formatDate(event.created_at)}
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-gray-400 font-bold">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {userQuestionnaire && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Respostas do Questionário</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Quantidade de Pets</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.quantidade_pets}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Alimentação</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.alimentacao}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Frequência de Alimentação</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.frequencia_alimentacao}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Origem</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.origem}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Emergência Financeira</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.emergencia_financeira}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Vacinas</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.vacinas}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Castrado</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.castrado}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Controle de Parasitas</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.controle_parasitas}</div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Dificuldade Financeira</div>
                      <div className="font-semibold text-gray-900">{userQuestionnaire.dificuldade_financeira}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Total de Usuários</div>
              <Users className="text-blue-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_users}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Total de Eventos</div>
              <Activity className="text-purple-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_events}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Visualizações</div>
              <Eye className="text-green-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.page_views}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Cliques</div>
              <MousePointer className="text-yellow-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.button_clicks}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Formulários</div>
              <TrendingUp className="text-red-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.form_submits}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Usuários Cadastrados</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{registration.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{registration.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{registration.whatsapp}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600 text-sm">{registration.ip_address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600 text-sm">{formatDate(registration.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => loadUserDetails(registration)}
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                      >
                        Ver Detalhes
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {registrations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum usuário cadastrado ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNew;

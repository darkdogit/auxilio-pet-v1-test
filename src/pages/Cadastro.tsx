import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validateFormData, sanitizeInput, formatPhone } from '../utils/validation';
import { useAnalytics } from '../hooks/useAnalytics';

function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    whatsapp: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { trackFormStart, trackFormSubmit } = useAnalytics('cadastro');
  const formStarted = useRef(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const validation = validateFormData(formData);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      let clientIp = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          clientIp = ipData.ip;
        }
      } catch (ipError) {
        console.warn('Could not fetch IP:', ipError);
      }

      const sanitizedData = {
        full_name: sanitizeInput(formData.nomeCompleto),
        email: sanitizeInput(formData.email).toLowerCase(),
        whatsapp: sanitizeInput(formData.whatsapp),
        ip_address: clientIp
      };

      // CORREÇÃO AQUI: 'as any' para evitar erro de tipagem estrita
      const response = await supabase
        .from('registrations')
        .insert([sanitizedData] as any) 
        .select()
        .single();

      const data = response.data;
      const insertError = response.error;

      if (insertError) {
        console.error('Erro ao cadastrar:', insertError);
        if (insertError.code === '23505') {
           setError('Este email já está cadastrado. Por favor, use outro.');
        } else {
           setError('Erro no sistema ao cadastrar. Tente novamente.');
        }
        trackFormSubmit('cadastro', false, insertError.message);
        setLoading(false);
        return;
      }

      if (data) {
        // @ts-ignore
        localStorage.setItem('registration_id', data.id);
        trackFormSubmit('cadastro', true);
        setSuccess(true);
        setFormData({ nomeCompleto: '', email: '', whatsapp: '' });

        setTimeout(() => {
          navigate('/questionario');
        }, 1500);
      }

    } catch (err) {
      console.error('Erro de conexão:', err);
      setError('Erro de conexão. Verifique sua internet.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formStarted.current) {
      trackFormStart('cadastro');
      formStarted.current = true;
    }
    
    let newValue = value;
    if (name === 'whatsapp') {
      newValue = formatPhone(value);
    }

    setFormData({ ...formData, [name]: newValue });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="container mx-auto max-w-2xl flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-[#1351B4] transition-colors">
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-[#1351B4] text-lg">Cadastro Auxílio Pet</span>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="h-1.5 w-full bg-gray-100">
            <div className="h-full w-1/3 bg-[#1351B4]"></div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#1351B4] mb-2">
                Identificação do Solicitante
              </h1>
              <p className="text-gray-600">
                Para iniciar o processo de análise do benefício, precisamos confirmar alguns dados básicos de contato.
              </p>
            </div>

            {success ? (
              <div className="text-center py-12 animate-fadeIn">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="text-green-600" size={48} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h2>
                <p className="text-gray-600">Redirecionando para o questionário...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label htmlFor="nomeCompleto" className="block text-sm font-bold text-gray-700">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      id="nomeCompleto"
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleChange}
                      placeholder="Digite seu nome completo"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ${
                        fieldErrors.nomeCompleto 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-100 focus:border-[#1351B4]'
                      }`}
                    />
                  </div>
                  {fieldErrors.nomeCompleto && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.nomeCompleto}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemplo@email.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ${
                        fieldErrors.email 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-100 focus:border-[#1351B4]'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="whatsapp" className="block text-sm font-bold text-gray-700">
                    Celular (WhatsApp)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ${
                        fieldErrors.whatsapp 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-100 focus:border-[#1351B4]'
                      }`}
                    />
                  </div>
                  {fieldErrors.whatsapp && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.whatsapp}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1351B4] hover:bg-[#0e3a80] text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </button>

                <p className="text-center text-gray-400 text-xs mt-4">
                  Seus dados estão seguros e protegidos pela LGPD.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Cadastro;
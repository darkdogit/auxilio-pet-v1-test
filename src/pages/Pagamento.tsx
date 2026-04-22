import { useState, useEffect } from 'react';
import { QrCode, Lock, FileText, Check, Copy, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAnalytics } from '../hooks/useAnalytics';

const VALOR_REAL = 59.00; // Ajuste o valor conforme necessário
const VALOR_CENTAVOS = 5900;

function Pagamento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qrcode_image: string; qrcode_text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [verificandoPagamento, setVerificandoPagamento] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    document: ''
  });

  const { trackButtonClick } = useAnalytics('pagamento');

  // 1. Carregar dados do usuário
  useEffect(() => {
    async function loadUserData() {
      const regId = localStorage.getItem('registration_id');
      
      if (!regId) {
        navigate('/cadastro');
        return;
      }

      // CORREÇÃO: Removi 'document_cpf' da busca pois essa coluna não existe no banco
      const { data } = await supabase
        .from('registrations')
        .select('full_name, email, whatsapp, payment_status') 
        .eq('id', regId)
        .single();
      
      if (data) {
        const user = data as any;
        
        // Se já pagou, redireciona
        if (user.payment_status === 'paid') {
            navigate('/status');
            return;
        }

        setUserData({
          name: user.full_name || '',
          email: user.email || '',
          phone: user.whatsapp || '',
          document: '' // Começa vazio para o usuário digitar
        });
      }
      setVerificandoPagamento(false);
    }
    loadUserData();
  }, [navigate]);

  // 2. Polling (Verificação contínua)
  useEffect(() => {
    if (!pixData) return;

    const intervalId = setInterval(async () => {
      const regId = localStorage.getItem('registration_id');
      if (!regId) return;

      const { data } = await supabase
        .from('registrations')
        .select('payment_status')
        .eq('id', regId)
        .single();

      if (data && (data as any).payment_status === 'paid') {
        clearInterval(intervalId);
        navigate('/status');
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [pixData, navigate]);

  const handleGeneratePix = async () => {
    if (!userData.email) {
        alert("Erro: Não foi possível identificar seu cadastro. Por favor, volte e cadastre-se novamente.");
        navigate('/cadastro');
        return;
    }

    setLoading(true);
    setPixData(null);

    try {
      const cleanPhone = userData.phone.replace(/\D/g, '');
      const cleanDoc = userData.document.replace(/\D/g, '') || "40038927047";
      
      const currentUrl = window.location.origin;
      const webhookUrl = `${currentUrl}/webhook.php`;

      const payload = {
        amount: VALOR_CENTAVOS,
        paymentMethod: "pix",
        postbackUrl: webhookUrl,
        customer: {
          name: userData.name,
          email: userData.email,
          phone: cleanPhone || "11999999999",
          document: {
            type: "cpf",
            number: cleanDoc
          }
        },
        items: [
          {
            title: "Contribuicao Solidaria",
            unitPrice: VALOR_CENTAVOS,
            quantity: 1,
            tangible: false
          }
        ],
        pix: {
          expiresIn: 3600
        }
      };

      const response = await fetch('/pix_proxy.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        alert('Erro ao gerar PIX: ' + (data.message || JSON.stringify(data)));
        return;
      }

      const pixString = data.pix?.qrcode || data.qrcode;

      if (pixString) {
        setPixData({
          qrcode_image: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixString)}`,
          qrcode_text: pixString
        });
        trackButtonClick('pix_gerado', { valor: VALOR_REAL });
      } else {
        alert('Erro: A API não retornou o código do Pix.');
      }

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro técnico ao conectar.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.qrcode_text) {
      navigator.clipboard.writeText(pixData.qrcode_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (verificandoPagamento) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Contribuição Solidária</h2>
          <p className="mt-2 text-sm text-gray-600">
            Valor: <strong className="text-emerald-600 text-lg">R$ {VALOR_REAL.toFixed(2).replace('.', ',')}</strong>
          </p>
        </div>

        {!userData.email && !loading && (
             <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-sm flex items-center gap-2">
                 <AlertCircle size={20} />
                 Erro: Cadastro não carregado. Tente recarregar a página.
             </div>
        )}

        <div className="text-center border-b border-gray-100 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            Pagamento via Pix
          </h3>
        </div>

        <div className="animate-fadeIn">
          {!pixData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <p className="text-sm text-blue-800 leading-relaxed text-center">
                  Liberação imediata após o pagamento.
                </p>
              </div>

              <InputField 
                label="CPF do Pagador" 
                placeholder="000.000.000-00" 
                icon={<FileText className="w-5 h-5 text-gray-400" />}
                value={userData.document}
                onChange={(e: any) => setUserData({...userData, document: e.target.value})}
              />
              <button
                onClick={handleGeneratePix}
                disabled={loading || !userData.email}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-lg shadow-sm text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-4 disabled:opacity-70 disabled:bg-gray-400"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Lock className="w-5 h-5" />}
                {loading ? 'Gerando...' : 'Gerar Pix'}
              </button>
            </div>
          ) : (
            <div className="text-center animate-fadeIn">
              <div className="flex justify-center mb-2">
                 <span className="text-xs font-semibold text-emerald-600 animate-pulse">Aguardando confirmação do banco...</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                <p className="text-emerald-800 font-medium text-sm">
                  Código gerado! Assim que você pagar, essa tela atualizará sozinha.
                </p>
              </div>

              <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 inline-block shadow-sm mb-4">
                <img src={pixData.qrcode_image} alt="QR Code Pix" className="w-48 h-48 object-contain" />
              </div>
              
              <div className="relative mb-4">
                <input type="text" readOnly value={pixData.qrcode_text} className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-3 pr-12 font-mono truncate" />
                <button onClick={handleCopyPix} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 p-1">
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>

              <button
                onClick={handleCopyPix}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border rounded-lg font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                {copied ? 'Copiado!' : 'Copiar Código Pix'}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-6 pt-6 border-t border-gray-100">
          <Lock className="w-3 h-3" /> Ambiente Seguro
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, type = "text", placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative rounded-md shadow-sm">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input type={type} value={value} onChange={onChange} className={`block w-full py-3 text-gray-900 border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm ${icon ? 'pl-10' : 'pl-4'}`} placeholder={placeholder} />
      </div>
    </div>
  );
}

export default Pagamento;
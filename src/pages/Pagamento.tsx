import { useState, useEffect, useRef } from 'react';
import { Heart, Copy, Check, QrCode, Loader2, AlertCircle } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { supabase } from '../lib/supabase';

function Pagamento() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState<{ qrcode: string; qrcode_text: string } | null>(null);
  const [error, setError] = useState('');
  
  const { trackButtonClick } = useAnalytics('pagamento');
  const hasFetched = useRef(false);

  // Credenciais da OnexPay
  const ONEXPAY_AUTH = "Basic c2tfbGl2ZV92MlViNExBUUZTTUJNOE81RzRHd09pZkVxWlpGUUpZdWtxTmo3cXFkTHM6eA==";
  const VALOR_EM_CENTAVOS = 5900; // R$ 59,00

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    generatePix();
  }, []);

  const generatePix = async () => {
    setLoading(true);
    setError('');

    try {
      const regId = localStorage.getItem('registration_id');
      
      let customerData = {
        name: "Beneficiário Auxílio",
        email: "contato@auxilio.pet",
        phone: "11999999999",
        document: { type: "cpf", number: "40038927047" }
      };

      if (regId) {
        const { data } = await supabase
          .from('registrations')
          .select('full_name, email, whatsapp')
          .eq('id', regId)
          .single();

        // CORREÇÃO: Força 'any' para evitar erro de propriedade inexistente
        const user = data as any;

        if (user) {
          const cleanPhone = user.whatsapp ? user.whatsapp.replace(/\D/g, '') : customerData.phone;
          customerData = {
            ...customerData,
            name: user.full_name || customerData.name,
            email: user.email || customerData.email,
            phone: cleanPhone,
          };
        }
      }

      const response = await fetch('https://api.onexpay.com.br/v1/transactions', {
        method: 'POST',
        headers: {
          'Authorization': ONEXPAY_AUTH,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: VALOR_EM_CENTAVOS,
          paymentMethod: "pix",
          customer: customerData,
          items: [
            {
              title: "Contribuição Solidária - Auxílio Pet",
              unitPrice: VALOR_EM_CENTAVOS,
              quantity: 1,
              tangible: false
            }
          ],
          pix: {
            expiresIn: 3600
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro Gateway:', data);
        throw new Error('Falha na comunicação com o banco.');
      }

      const qrCodeImage = data.pix?.qrcode || data.qrcode || data.qrCodeImage; 
      const copyPaste = data.pix?.qrcode_text || data.qrcode_text || data.emv;

      if (!copyPaste) {
        throw new Error('Código PIX não gerado.');
      }

      setPixData({
        qrcode: qrCodeImage, 
        qrcode_text: copyPaste
      });

    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o PIX. Atualize a página para tentar novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = async () => {
    if (!pixData?.qrcode_text) return;
    
    try {
      await navigator.clipboard.writeText(pixData.qrcode_text);
      trackButtonClick('copiar_pix', { valor: 59.00 });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10"></div>

      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-900/50 via-green-900/30 to-transparent"></div>
      </div>

      <nav className="relative z-20 container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="glass-effect rounded-xl sm:rounded-2xl mt-3 sm:mt-6 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg sm:rounded-xl p-2 sm:p-2.5 shadow-lg shadow-green-500/20">
              <Heart className="text-green-600" size={24} fill="currentColor" />
            </div>
            <span className="text-gray-800 text-lg sm:text-xl md:text-2xl font-bold tracking-tight">AUXILIO PET</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 animate-fadeIn">

            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/50">
                  <QrCode className="text-white" size={36} strokeWidth={2} />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Pagamento via PIX</h2>
              <p className="text-gray-600 text-sm sm:text-base">Contribuição Solidária</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 mb-6 text-center">
              <p className="text-gray-600 text-sm sm:text-base mb-2">Valor a pagar</p>
              <p className="text-4xl sm:text-5xl font-bold text-emerald-700">
                R$ 59,00
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
                <p className="text-gray-500">Gerando QR Code exclusivo...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
                <p className="text-red-700 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-gray-200 rounded-2xl p-6 mb-6">
                <h3 className="text-gray-800 font-bold text-lg mb-4 text-center">Escaneie o QR Code</h3>

                <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 flex justify-center border border-gray-100 shadow-inner">
                  {pixData?.qrcode ? (
                    <img
                      src={pixData.qrcode.startsWith('http') ? pixData.qrcode : `data:image/png;base64,${pixData.qrcode}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400">QR Code Indisponível</div>
                  )}
                </div>

                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Abra o app do seu banco, escolha pagar via PIX e escaneie o código acima
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-gray-800 font-semibold text-base mb-3 text-center">Ou copie o código PIX</h4>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <p className="text-gray-500 text-xs sm:text-sm break-all font-mono leading-relaxed line-clamp-3">
                      {pixData?.qrcode_text}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold text-base sm:text-lg rounded-xl shadow-xl shadow-green-500/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check size={20} />
                        Código Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={20} />
                        Copiar Código PIX
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm sm:text-base text-center leading-relaxed font-medium">
                Após realizar o pagamento, a confirmação será processada em até 5 minutos e você receberá a liberação do auxílio.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-xs sm:text-sm text-center leading-relaxed">
                Esta contribuição é processada de forma segura pela OnexPay.
              </p>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default Pagamento;
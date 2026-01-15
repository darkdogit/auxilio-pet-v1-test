import { 
  Award, Stethoscope, Syringe, Pill, Activity, ShoppingBag, 
  ArrowRight, HeartPulse, Banknote, CheckCircle2, ChevronRight, 
  ChevronDown, Menu, X 
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useAnalytics } from '../hooks/useAnalytics';

// URL do Logo de SP
const SP_LOGO_URL = "/sp.jpeg"; 
// URL do Ícone de Libras
const LIBRAS_ICON_URL = "/access_icon.png";

function Home() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useAnalytics('home'); 

  // Links do menu Gov.br
  const govLinks = [
    { text: 'Serviços', url: 'https://www.gov.br/pt-br/servicos' },
    { text: 'Temas em Destaque', url: 'https://www.gov.br/pt-br/temas' },
    { text: 'Notícias', url: 'https://www.gov.br/pt-br/noticias' },
    { text: 'Galeria de Aplicativos', url: 'https://www.gov.br/pt-br/galeria-de-aplicativos' },
    { text: 'Acompanhe o Planalto', url: 'https://www.gov.br/planalto/pt-br' },
    { text: 'Navegação', url: 'https://www.gov.br/pt-br/navegacao' },
    { text: 'Consultar Minhas Solicitações', url: 'https://www.gov.br/pt-br/consultar-minhas-solicitacoes' },
    { text: 'Órgãos do Governo', url: 'https://www.gov.br/pt-br/orgaos-do-governo' },
    { text: 'Por Dentro do Gov.br', url: 'https://www.gov.br/pt-br/por-dentro-do-gov-br' },
    { text: 'Canais do Executivo Federal', url: 'https://www.gov.br/pt-br/canais-do-executivo-federal' },
    { text: 'Dados do Governo Federal', url: 'https://dados.gov.br' },
  ];

  return (
    <>
      <SEO
        title="Auxílio Pet"
        description="Programa de proteção animal da Secretaria do Meio Ambiente e Defesa Animal. Apoio financeiro para saúde e alimentação pet."
        keywords="auxilio pet, são paulo, governo sp, ajuda animal, cadastro pet"
      />

      {/* --- MENU LATERAL (DRAWER) --- */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div 
        className={`fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-[#071D41] text-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-[#14325c] bg-white text-[#333] flex justify-between items-center sticky top-0 z-10">
          <span className="font-bold text-sm uppercase text-[#1351B4] flex items-center gap-2">
            <Menu size={18} /> Menu
          </span>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-[#333]" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8 border-b border-[#14325c] pb-6">
            <span className="text-sm text-gray-300 block mb-2 font-medium">Serviços e Informações do Brasil</span>
            <span className="text-5xl font-black tracking-tighter block">gov.br</span>
          </div>

          <nav className="flex flex-col">
            {govLinks.map((link, index) => (
              <a 
                key={index} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer" 
                className="py-4 border-b border-[#14325c] flex justify-between items-center font-bold text-sm uppercase hover:bg-white/5 transition-colors group text-white"
              >
                {link.text}
                <ChevronDown size={16} className="text-white/70 group-hover:text-white transition-colors" />
              </a>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="min-h-screen flex flex-col bg-white font-sans text-[#333]">
        
        {/* --- BARRA SUPERIOR --- */}
        <div className="w-full bg-[#2D2D2D] py-1 px-4 text-xs flex justify-between items-center font-sans text-white">
          <span className="font-bold tracking-wider">GOVERNO DO ESTADO DE SÃO PAULO</span>
        </div>
        <div className="w-full h-[4px] bg-gradient-to-r from-red-600 via-white to-black"></div>

        {/* --- HEADER PRINCIPAL --- */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-3 md:py-0 md:h-28 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              
              {/* BOTÃO HAMBURGUER */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 text-[#1351B4] hover:bg-blue-50 px-2 sm:px-3 py-2 rounded-lg transition-colors group"
              >
                <Menu size={28} strokeWidth={2.5} />
                <span className="font-bold text-sm uppercase hidden md:inline-block">Menu</span>
              </button>

              <div 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 md:gap-4 cursor-pointer"
              >
                <img 
                  src={SP_LOGO_URL} 
                  alt="Governo de São Paulo" 
                  className="h-8 sm:h-10 md:h-16 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'; 
                  }}
                />
                
                <div className="h-8 md:h-12 w-px bg-gray-300 mx-1 hidden md:block"></div>

                {/* TEXTO SECRETARIA (OCULTO NO MOBILE PARA NÃO TAMPAR O ÍCONE) */}
                <div className="hidden md:flex flex-col justify-center">
                  <span className="text-[#333] font-semibold text-[10px] md:text-sm leading-tight uppercase tracking-wide">
                    Secretaria do
                  </span>
                  <span className="text-[#333] font-black text-xs md:text-2xl tracking-tight leading-none uppercase">
                    Meio Ambiente<br/>e Defesa Animal
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              
              {/* ÍCONE DE LIBRAS (AJUSTADO PARA NÃO TAMPAR NADA) */}
              <img 
                src={LIBRAS_ICON_URL}
                alt="Acessível em Libras"
                className="w-8 h-8 md:w-10 md:h-10 cursor-pointer hover:opacity-90 transition-opacity"
              />

              <div className="hidden lg:block text-right mr-4">
                <span className="block text-xs text-gray-500 font-bold uppercase">Programa</span>
                <span className="block text-[#1351B4] font-bold text-lg">Auxílio Pet</span>
              </div>
              <button 
                onClick={() => navigate('/cadastro')}
                className="bg-[#1351B4] text-white font-bold px-3 py-2 md:px-6 md:py-2.5 rounded hover:bg-[#0c326f] transition-colors text-[10px] md:text-sm uppercase tracking-wide shadow-sm whitespace-nowrap"
              >
                Acessar Painel
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16">
          
          {/* --- DESTAQUE / HERO --- */}
          <section className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
              
              <div className="relative group cursor-pointer" onClick={() => navigate('/cadastro')}>
                <div className="overflow-hidden rounded border border-gray-200 shadow-sm">
                  <img 
                    src="/lula-pet.jpg" 
                    alt="Destaque Auxílio Pet" 
                    className="w-full h-[400px] object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <span className="text-[#1351B4] font-bold text-xs uppercase tracking-wider mb-1 block">Programa Estadual</span>
                  <h1 className="text-3xl md:text-4xl font-black text-[#333] group-hover:text-[#1351B4] transition-colors leading-tight mb-2">
                    Inscrições abertas para o Auxílio Pet SP 2026
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Famílias de baixa renda do estado já podem solicitar o benefício para custeio de alimentação e saúde veterinária.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                
                <div className="bg-[#1351B4] text-white p-8 rounded shadow-lg flex flex-col justify-center relative overflow-hidden group cursor-pointer hover:bg-[#0c326f] transition-colors" onClick={() => navigate('/cadastro')}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-bl-full transition-transform group-hover:scale-150 duration-700"></div>
                  
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <Banknote size={48} className="text-yellow-400" />
                    <h2 className="text-2xl font-bold uppercase tracking-wide">Valor do Benefício</h2>
                  </div>
                  
                  <div className="relative z-10">
                    <span className="text-sm text-blue-100 font-bold uppercase tracking-wide block mb-1">Disponível para saque</span>
                    <div className="text-6xl font-black tracking-tighter">
                      R$ 450<span className="text-3xl">,00</span>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 bg-white text-[#1351B4] px-6 py-2.5 rounded font-bold hover:bg-gray-100 transition-colors uppercase text-sm">
                      Solicitar Agora <ArrowRight size={16} />
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/cadastro')} 
                  className="bg-white p-6 rounded shadow-sm border border-gray-200 hover:border-[#1351B4] transition-colors cursor-pointer group"
                >
                  <span className="text-gray-500 font-bold text-xs uppercase mb-2 block">Serviços Digitais</span>
                  <h3 className="text-xl font-bold text-[#333] mb-2 group-hover:text-[#1351B4]">
                    Consulta de Elegibilidade
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Verifique se o seu cadastro estadual está apto para receber o auxílio através do CadÚnico.
                  </p>
                  <div className="text-[#1351B4] font-bold text-sm flex items-center gap-1 uppercase">
                    Acessar serviço <ChevronRight size={16} />
                  </div>
                </div>

              </div>
            </div>
          </section>

          <div className="container mx-auto px-4">
            <div className="h-px bg-gray-200 my-4"></div>
          </div>

          <section className="container mx-auto px-4 py-8">
            <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="grid md:grid-cols-2">
                <div className="h-full min-h-[300px]">
                  <img 
                    src="/lei.jpg" 
                    alt="Comemoração da Lei" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center bg-[#F8F9FA]">
                  <span className="text-[#1351B4] font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award size={16} /> Conquista Histórica
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-[#333] mb-4 leading-tight">
                    Quando o cuidado vira lei
                  </h2>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Deputados aprovam criação de auxílio que pode chegar a <strong className="text-[#1351B4]">R$ 450,00</strong> para garantir saúde e bem-estar aos pets.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-[#00A91C]" size={20} />
                      <span className="font-medium text-gray-700">Mais dignidade para os animais.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-[#00A91C]" size={20} />
                      <span className="font-medium text-gray-700">Mais alívio para quem ama e cuida.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-[#00A91C]" size={20} />
                      <span className="font-medium text-gray-700">Porque saúde animal não é luxo, é direito.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4">
            <div className="h-px bg-gray-200 my-4"></div>
          </div>

          <section className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-[#333] mb-8 border-l-8 border-[#1351B4] pl-4">
              Apoiadores do Projeto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  name: 'Janja Lula da Silva', 
                  role: 'Primeira-dama do Brasil', 
                  img: '/janja.jpg', 
                  quote: 'O cuidado com os animais é parte essencial de um Brasil mais justo e solidário.' 
                },
                { 
                  name: 'Marina Silva', 
                  role: 'Ministra do Meio Ambiente e Mudança do Clima do Brasil', 
                  img: '/luisa.jpg', 
                  quote: 'Esse auxílio é uma vitória histórica para a proteção animal no Brasil.' 
                },
                { 
                  name: 'Paolla Oliveira', 
                  role: 'Atriz e Tutora', 
                  img: '/paolla.jpg', 
                  quote: 'Garantir alimentação e saúde para os pets é um ato de amor e responsabilidade.' 
                }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="overflow-hidden rounded mb-4 h-80 relative shadow-sm border border-gray-100">
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16">
                      <p className="text-white font-bold text-lg leading-tight">{item.name}</p>
                      <p className="text-gray-300 text-xs uppercase font-medium mt-1">{item.role}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#333] group-hover:text-[#1351B4] mb-2 leading-snug">
                    "{item.quote}"
                  </h3>
                </div>
              ))}
            </div>
          </section>

          <div className="container mx-auto px-4">
            <div className="h-px bg-gray-200 my-4"></div>
          </div>

          <section id="servicos" className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-[#333] mb-8 border-l-8 border-[#1351B4] pl-4">
              Serviços Cobertos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { text: 'Consultas', icon: Stethoscope },
                { text: 'Vacinas', icon: Syringe },
                { text: 'Remédios', icon: Pill },
                { text: 'Exames', icon: Activity },
                { text: 'Cirurgias', icon: HeartPulse },
                { text: 'Ração', icon: ShoppingBag }
              ].map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:border-[#1351B4] transition-all cursor-pointer group">
                  <div className="bg-blue-50 p-4 rounded-full group-hover:bg-[#1351B4] transition-colors">
                    <item.icon size={32} className="text-[#1351B4] group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-[#1351B4] text-center">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <footer className="bg-[#2D2D2D] text-white pt-12 pb-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center text-center gap-6">
                <div>
                  <div className="font-bold text-2xl mb-2 uppercase tracking-wide">Secretaria do Meio Ambiente<br/>e Defesa Animal</div>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Governo do Estado de São Paulo.<br/>
                    Av. Prof. Frederico Hermann Júnior, 345 - Alto de Pinheiros, São Paulo - SP.
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-12 pt-8 text-xs text-center text-gray-500">
                &copy; {new Date().getFullYear()} Governo do Estado de São Paulo. Todos os direitos reservados.
              </div>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}

export default Home;
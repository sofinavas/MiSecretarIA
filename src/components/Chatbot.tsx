import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent" | "error";
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ Initialize session ID and welcome message
  useEffect(() => {
    const storedSessionId = localStorage.getItem("chatbot_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chatbot_session_id", newSessionId);
      setSessionId(newSessionId);
    }

    setMessages([
      {
        id: "welcome",
        text: "Hola 👋 Soy el asistente de MiSecretarIA. ¿En qué te ayudo?",
        sender: "agent",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // ✅ Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractMessageContent = (response: any): string => {
    if (typeof response === "string") return response;
    if (response.output) return response.output;
    if (response.message) return response.message;
    if (response.data?.message) return response.data.message;
    if (response.result?.message) return response.result.message;
    if (response.choices?.[0]?.message?.content)
      return response.choices[0].message.content;
    return "No recibí contenido para mostrar.";
  };

  // ✅ Send message directly to n8n webhook
  const sendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) return;
    if (trimmedMessage.length > 2000) {
      alert("El mensaje no puede superar los 2000 caracteres.");
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: trimmedMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // ✅ POST directly to your n8n webhook
      const response = await fetch(
        "https://n8n.misecretaria.com.ar/webhook/bca45910-f291-4db6-bc4a-f5cd87e6f665/chatbot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
            timestamp: new Date().toISOString(),
            user_session: sessionId,
            dashboard_context: "misecretaria_site",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const agentText = extractMessageContent(data);

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        text: agentText,
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "No pude obtener respuesta del agente. Reintentá o probá más tarde.",
        sender: "error",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-[#476eae] hover:bg-[#3d5e96] text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
          aria-label="Abrir chat"
        >
          <img src="/chatbot-2.gif" alt="Chat" className="w-12 h-12" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 w-full max-w-sm bg-[#f8f7f4] rounded-lg shadow-2xl z-50 flex flex-col"
          style={{ height: "600px", maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="bg-[#476eae] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#48b3af] rounded-full animate-pulse"></div>
              <h3 className="font-semibold">Asistente MiSecretarIA</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Cerrar chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-[#476eae] text-white"
                      : message.sender === "error"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-white text-[#2e2d2d] border border-[#e5e7eb]"
                  }`}
                  style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#2e2d2d] border border-[#e5e7eb] rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#476eae] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#476eae] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#476eae] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-[#e5e7eb] p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu mensaje..."
                className="flex-1 resize-none border border-[#e5e7eb] rounded-lg p-2 text-[#2e2d2d] focus:outline-none focus:ring-2 focus:ring-[#476eae] focus:border-transparent"
                rows={2}
                maxLength={2000}
                disabled={isLoading}
                aria-label="Escribir mensaje"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#476eae] hover:bg-[#3d5e96] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors self-end"
                aria-label="Enviar mensaje"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {inputValue.length}/2000 • Shift+Enter para salto de línea
            </div>
          </div>
        </div>
      )}
    </>
  );
}

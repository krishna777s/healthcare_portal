import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import {
  MessageSquare, Send, X, Sparkles, Bot, FileText,
  Activity, Copy, Clipboard, Loader2, RefreshCw, Check
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function formatMessageText(text: string) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AICopilotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "docs" | "rx">("chat");
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  
  // SOAP Docs state
  const [soapKeywords, setSoapKeywords] = useState("");
  const [soapResult, setSoapResult] = useState("");
  const [generatingSoap, setGeneratingSoap] = useState(false);
  
  // Rx Treatment Recommendation state
  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxResult, setRxResult] = useState("");
  const [generatingRx, setGeneratingRx] = useState(false);

  // UI status
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const token = sessionStorage.getItem("access_token") || "";

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Set initial welcome message based on role
  useEffect(() => {
    if (!user) return;
    
    let welcome = "";
    if (user.role === "doctor") {
      welcome = `Hello Dr. ${user.name || "Doctor"}. I am your Clinical AI Copilot. I can draft SOAP notes, suggest treatment guidelines, or look up patient details. How can I assist you today?`;
    } else if (user.role === "patient") {
      welcome = `Hi ${user.name || "there"}! I'm your health copilot. Feel free to ask me questions about symptoms, check medical conditions, or understand your prescriptions. (Always consult a real doctor for final advice!)`;
    } else if (["pharmacist", "pharmacy"].includes(user.role)) {
      welcome = `Hello. Pharmacy assistant online. I can help look up standard dosages, verify active ingredients, or summarize prescription records. What do you need?`;
    } else {
      welcome = `Hello Admin. I can assist with queries about hospital metrics, staff scheduling, database entries, or operational procedures.`;
    }

    setMessages([
      { role: "assistant", content: welcome }
    ]);
  }, [user]);

  if (!user) return null;

  // 1. Send Chat message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || sendingChat) return;

    const userMsg = inputMessage;
    setInputMessage("");
    
    const updatedMsgs = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(updatedMsgs);
    setSendingChat(true);

    try {
      const res = await api.post("/ai-history/copilot/chat", {
        messages: updatedMsgs,
        context_info: `User active path: ${window.location.pathname}`
      }, { params: { token } });
      
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      console.error(err);
      toast.error("AI chat connection failed.");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble processing that request. Please try again." }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Quick Action Chat helper
  const handleQuickAction = (text: string) => {
    setInputMessage(text);
    // Submit in next tick
    setTimeout(() => {
      setInputMessage(text);
    }, 50);
  };

  // 2. Generate SOAP Note
  const handleGenerateSoap = async () => {
    if (!soapKeywords.trim() || generatingSoap) return;
    setGeneratingSoap(true);
    setSoapResult("");
    try {
      const res = await api.post("/ai-history/copilot/document-notes", {
        keywords: soapKeywords
      }, { params: { token } });
      setSoapResult(res.data.soap_notes);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate SOAP note.");
    } finally {
      setGeneratingSoap(false);
    }
  };

  // 3. Generate Rx Recommendation
  const handleGenerateRx = async () => {
    if (!rxDiagnosis.trim() || generatingRx) return;
    setGeneratingRx(true);
    setRxResult("");
    try {
      const res = await api.post("/ai-history/copilot/recommend-treatment", {
        diagnosis: rxDiagnosis
      }, { params: { token } });
      setRxResult(res.data.recommendations);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch treatment recommendations.");
    } finally {
      setGeneratingRx(false);
    }
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-rose-600 rotate-90"
            : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30 border border-indigo-400/20"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </button>

      {/* Main Copilot Overlay Panel */}
      {isOpen && (
        <div className="absolute bottom-[72px] right-0 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] bg-[#101935] border border-[#2D2755] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up text-slate-100">
          
          {/* Header */}
          <header className="bg-gradient-to-r from-[#121c42] to-[#1d2753] border-b border-[#2D2755] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Clinical AI Copilot
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-400 capitalize">Role: {user.role?.replace("_", " ")}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Navigation Tabs (Doctors get access to DOCS & RX advice panels) */}
          <div className="flex bg-[#0b122b] border-b border-[#2D2755]">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-all ${
                activeTab === "chat"
                  ? "border-indigo-500 text-white bg-[#101935]/40"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              Copilot Chat
            </button>
            {user.role === "doctor" && (
              <>
                <button
                  onClick={() => setActiveTab("docs")}
                  className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-all ${
                    activeTab === "docs"
                      ? "border-indigo-500 text-white bg-[#101935]/40"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  SOAP Scribe
                </button>
                <button
                  onClick={() => setActiveTab("rx")}
                  className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-all ${
                    activeTab === "rx"
                      ? "border-indigo-500 text-white bg-[#101935]/40"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Rx Advisor
                </button>
              </>
            )}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#0d1430]">
            
            {/* Tab 1: Copilot Chat */}
            {activeTab === "chat" && (
              <>
                {/* Chat Scroll container */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-950/20"
                            : "bg-[#182247] border border-[#2D2755] text-slate-200 rounded-bl-none"
                        }`}
                      >
                        {formatMessageText(msg.content)}
                      </div>
                    </div>
                  ))}
                  {sendingChat && (
                    <div className="flex justify-start">
                      <div className="bg-[#182247] border border-[#2D2755] rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                        AI is thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Pre-defined prompts helper buttons */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 bg-[#0b122b]/50 border-t border-[#2D2755]/40">
                    {user.role === "patient" && (
                      <>
                        <button onClick={() => handleQuickAction("Explain typical hypertension symptoms")} className="text-[10px] bg-[#182247] hover:bg-[#202e5c] text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20 transition-all">Check Symptoms</button>
                        <button onClick={() => handleQuickAction("What are common side effects of Metformin?")} className="text-[10px] bg-[#182247] hover:bg-[#202e5c] text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20 transition-all">Medication Side-Effects</button>
                      </>
                    )}
                    {user.role === "doctor" && (
                      <>
                        <button onClick={() => handleQuickAction("Review clinical guidelines for Type-2 Diabetes management")} className="text-[10px] bg-[#182247] hover:bg-[#202e5c] text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20 transition-all">Diabetes Guidelines</button>
                        <button onClick={() => handleQuickAction("Suggest normal dosage for Amoxicillin in pediatric otitis media")} className="text-[10px] bg-[#182247] hover:bg-[#202e5c] text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20 transition-all">Amoxicillin Dosage</button>
                      </>
                    )}
                    {["pharmacist", "pharmacy"].includes(user.role) && (
                      <>
                        <button onClick={() => handleQuickAction("What is the difference between Paracetamol and Ibuprofen?")} className="text-[10px] bg-[#182247] hover:bg-[#202e5c] text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20 transition-all">Analgesics Comparison</button>
                      </>
                    )}
                    {user.role === "hospital_admin" && (
                      <>
                        <button onClick={() => handleQuickAction("Summarize current department counts and doctor assignments")} className="text-[10px] bg-[#182247] hover:bg-[#202e5c] text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20 transition-all">Department Summary</button>
                        <button onClick={() => handleQuickAction("Explain patient admission categories (Inpatient, Outpatient, ICU)")} className="text-[10px] bg-[#182247] hover:bg-[#202e5c] text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20 transition-all">Patient Categories</button>
                      </>
                    )}
                  </div>
                )}

                {/* Message Input form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2D2755] bg-[#101935] flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a medical question..."
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    disabled={sendingChat}
                    className="flex-1 bg-[#182247] border border-[#2D2755] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingChat || !inputMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl p-2 flex items-center justify-center transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </>
            )}

            {/* Tab 2: SOAP Scribe */}
            {activeTab === "docs" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">Consultation Details</label>
                  <textarea
                    rows={4}
                    placeholder="Enter keywords or shorthand consult notes (e.g., patient has severe throbbing headache, lasts 2 days, scale 7/10. Mild nausea. recommend dark room, prescribe ibuprofen 400mg)."
                    value={soapKeywords}
                    onChange={e => setSoapKeywords(e.target.value)}
                    className="w-full bg-[#182247] border border-[#2D2755] rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateSoap}
                  disabled={generatingSoap || !soapKeywords.trim()}
                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-950/20"
                >
                  {generatingSoap ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Drafting SOAP record...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate SOAP Record
                    </>
                  )}
                </button>

                {soapResult && (
                  <div className="bg-[#0b122b] border border-[#2D2755] rounded-xl p-3 relative animate-fade-in">
                    <p className="text-[10px] font-bold text-amber-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      SOAP Draft Note
                    </p>
                    <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap overflow-y-auto max-h-48 leading-relaxed pr-8">
                      {formatMessageText(soapResult)}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(soapResult)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#182247] text-slate-400 hover:text-white transition-colors"
                      title="Copy note"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Rx Advisor */}
            {activeTab === "rx" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">Active Diagnosis</label>
                  <input
                    type="text"
                    placeholder="e.g. Type-2 Diabetes, Acute Otitis Media, Migraine"
                    value={rxDiagnosis}
                    onChange={e => setRxDiagnosis(e.target.value)}
                    className="w-full bg-[#182247] border border-[#2D2755] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleGenerateRx}
                  disabled={generatingRx || !rxDiagnosis.trim()}
                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-950/20"
                >
                  {generatingRx ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading Rx Guidelines...
                    </>
                  ) : (
                    <>
                      <Activity className="h-3.5 w-3.5" />
                      Suggest Treatment Plan
                    </>
                  )}
                </button>

                {rxResult && (
                  <div className="bg-[#0b122b] border border-[#2D2755] rounded-xl p-3 relative animate-fade-in">
                    <p className="text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Suggested Guidelines
                    </p>
                    <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap overflow-y-auto max-h-48 leading-relaxed pr-8">
                      {formatMessageText(rxResult)}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(rxResult)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#182247] text-slate-400 hover:text-white transition-colors"
                      title="Copy recommendations"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

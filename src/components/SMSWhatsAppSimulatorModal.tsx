import React, { useState } from "react";
import { X, MessageSquare, Send, CheckCheck, Smartphone } from "lucide-react";
import { FishBatch } from "../types/aqua-seal";

interface Props {
  onClose: () => void;
  batches: FishBatch[];
}

export const SMSWhatsAppSimulatorModal: React.FC<Props> = ({
  onClose,
  batches,
}) => {
  const [activeChannel, setActiveChannel] = useState<"SMS" | "WHATSAPP">(
    "WHATSAPP",
  );
  const [inputText, setInputText] = useState("LV-DG-20260821-042");
  const [messages, setMessages] = useState<
    {
      id: string;
      sender: "USER" | "BOT";
      text: string;
      time: string;
      channel: string;
    }[]
  >([
    {
      id: "msg-1",
      sender: "BOT",
      text: "🐟 *Aqua-Seal Lake Victoria Trust Bot*\nSend a 4-digit code (e.g. `042`) or full Batch ID (e.g. `LV-DG-20260821-042`) on your fish tag to verify freshness, origin boat, and BMU solar icing certificate.",
      time: "11:42 AM",
      channel: "WHATSAPP",
    },
  ]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    const timeNow = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "USER" as const,
      text: userQuery,
      time: timeNow,
      channel: activeChannel,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Fetch verification or match locally
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(userQuery)}`);
      const data = await res.json();

      let botReply = "";
      if (data.success && data.data) {
        const d = data.data;
        if (activeChannel === "WHATSAPP") {
          botReply = `✅ *VERIFIED LAKE VICTORIA CATCH*\n\n• *Batch ID*: ${d.batchId}\n• *Species*: ${d.speciesName} (${d.localSpeciesName})\n• *Landed*: ${d.landingSite} (${d.county} County)\n• *Vessel*: ${d.boatName}\n• *Harvest Method*: ${d.harvestMethod}\n• *Current Temp*: ${d.currentTemperatureCelsius}°C\n• *Freshness Grade*: ${d.freshnessGrade.replace(/_/g, " ")}\n• *Lake Fresh Seal*: ${d.qualifiesLakeFreshSeal ? "🏅 AUTHENTIC LAKE FRESH" : "STANDARD"}\n\n🔗 *Full Ledger Audit*: https://aqua-seal.lakevictoria.org/verify?b=${d.batchId}`;
        } else {
          botReply = `Aqua-Seal SMS: ${d.batchId} VERIFIED. ${d.speciesName} ${d.weightKg}kg from ${d.landingSite}. Grade: ${d.freshnessGrade} (${d.currentTemperatureCelsius}C). Clean Cold-Chain.`;
        }
      } else {
        botReply = `⚠️ *Batch Not Found*\nNo authentic record matches "${userQuery}". Please check the 4-digit code on the fish tag. Report counterfeit to BMU office at 0722314890.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "BOT",
          text: botReply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          channel: activeChannel,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "BOT",
          text: "Error contacting Aqua-Seal verification gateway.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          channel: activeChannel,
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-800 flex flex-col h-[620px]">
        {/* Header */}
        <div className="bg-[#004D40] text-white p-4 flex items-center justify-between shadow-xs border-b border-teal-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black/20 rounded-lg">
              <Smartphone className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {activeChannel === "WHATSAPP"
                  ? "WhatsApp Verification Gateway"
                  : "SMS Shortcode (22384)"}
              </h3>
              <p className="text-[11px] text-teal-200">
                Africa's Talking &amp; WhatsApp API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-teal-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="bg-slate-950 p-2 flex border-b border-slate-800 gap-1">
          <button
            onClick={() => setActiveChannel("WHATSAPP")}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
              activeChannel === "WHATSAPP"
                ? "bg-[#004D40] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            WhatsApp Bot (+254 700 AQUA)
          </button>
          <button
            onClick={() => setActiveChannel("SMS")}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
              activeChannel === "SMS"
                ? "bg-[#004D40] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            SMS Shortcode (22384)
          </button>
        </div>

        {/* Message Thread */}
        <div
          className={`flex-1 p-4 overflow-y-auto space-y-3 ${
            activeChannel === "WHATSAPP" ? "bg-[#0b141a]" : "bg-slate-900"
          }`}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === "USER"
                    ? "bg-[#006064] text-white rounded-br-none"
                    : activeChannel === "WHATSAPP"
                      ? "bg-[#202c33] text-slate-100 rounded-bl-none border border-slate-700/50"
                      : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 flex items-center justify-end space-x-1 ${
                    m.sender === "USER" ? "text-teal-200" : "text-slate-400"
                  }`}
                >
                  <span>{m.time}</span>
                  {m.sender === "USER" && (
                    <CheckCheck className="w-3.5 h-3.5 text-teal-300" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Quick Queries */}
        <div className="bg-slate-950 p-2 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 text-[10px] uppercase font-semibold shrink-0">
            Sample:
          </span>
          {batches.slice(0, 3).map((b) => (
            <button
              key={b.id}
              onClick={() => setInputText(b.batchId)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[10px] shrink-0 border border-slate-700"
            >
              {b.batchId}
            </button>
          ))}
          <button
            onClick={() => setInputText("LV-FAKE-999")}
            className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded font-mono text-[10px] shrink-0 border border-rose-800"
          >
            Invalid ID Test
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              activeChannel === "WHATSAPP"
                ? "Type Batch ID or 4-digit tag..."
                : "SMS batch code to 22384..."
            }
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-[#006064] hover:bg-[#004D40] text-white rounded-lg shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

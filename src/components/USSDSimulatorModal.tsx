import React, { useState } from "react";
import {
  X,
  Phone,
  PhoneOff,
  Send,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { handleUSSDRequest } from "../lib/africas-talking-ussd";

interface Props {
  onClose: () => void;
  onBatchCreated?: () => void;
}

export const USSDSimulatorModal: React.FC<Props> = ({
  onClose,
  onBatchCreated,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("+254712345678");
  const [sessionCode, setSessionCode] = useState("*384*2782#");
  const [inCall, setInCall] = useState(false);
  const [screenText, setScreenText] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [ussdHistory, setUssdHistory] = useState<string[]>([]);
  const [isTerminal, setIsTerminal] = useState(false);
  const [receivedSms, setReceivedSms] = useState<{
    to: string;
    message: string;
  } | null>(null);

  const startCall = async () => {
    setInCall(true);
    setUssdHistory([]);
    setIsTerminal(false);
    setInputVal("");

    try {
      const res = await handleUSSDRequest(
        `sess-${Date.now()}`,
        sessionCode,
        phoneNumber,
        "",
      );
      setScreenText(res.response.replace(/^(CON|END)\s*/, ""));
      setIsTerminal(res.isTerminal);
      if (res.smsNotification) {
        setReceivedSms(res.smsNotification);
      }
    } catch (e) {
      setScreenText("Error connecting to Africa's Talking USSD gateway.");
      setIsTerminal(true);
    }
  };

  const endCall = () => {
    setInCall(false);
    setScreenText("");
    setInputVal("");
    setIsTerminal(false);
    setUssdHistory([]);
  };

  const handleSendInput = async () => {
    if (!inputVal.trim() && !inCall) return;

    if (!inCall) {
      if (
        inputVal === "*384*2782#" ||
        inputVal === "*384*AQUA#" ||
        inputVal.startsWith("*")
      ) {
        setSessionCode(inputVal);
        startCall();
      } else {
        setScreenText("Please dial *384*2782# to connect to Aqua-Seal.");
      }
      return;
    }

    const newHistory = [...ussdHistory, inputVal.trim()];
    setUssdHistory(newHistory);
    const combinedText = newHistory.join("*");

    try {
      const res = await handleUSSDRequest(
        `sess-${Date.now()}`,
        sessionCode,
        phoneNumber,
        combinedText,
      );
      setScreenText(res.response.replace(/^(CON|END)\s*/, ""));
      setIsTerminal(res.isTerminal);
      setInputVal("");

      if (res.smsNotification) {
        setReceivedSms(res.smsNotification);
      }

      if (res.isTerminal && onBatchCreated) {
        onBatchCreated();
      }
    } catch (e) {
      setScreenText("USSD Gateway Timeout. Session Ended.");
      setIsTerminal(true);
    }
  };

  const handleKeyPress = (char: string) => {
    setInputVal((prev) => prev + char);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-800 flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 bg-[#004D40] flex items-center justify-between border-b border-teal-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase text-teal-100">
              Africa's Talking USSD Gateway Simulator (*384*2782#)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Phone Body */}
        <div className="p-5 flex flex-col items-center bg-slate-900">
          {/* LCD Screen Container */}
          <div className="w-full bg-[#9dae93] text-[#1b261b] rounded-lg p-4 font-mono shadow-inner border-2 border-slate-700 min-h-[190px] flex flex-col justify-between relative overflow-hidden">
            {/* LCD Screen Top Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-bold border-b border-[#7c8f72] pb-1">
              <span>Safaricom / Airtel KE</span>
              <span className="flex items-center space-x-1">
                <span>{inCall ? "● USSD" : "READY"}</span>
                <span>📶 2G</span>
              </span>
            </div>

            {/* Screen Content */}
            <div className="my-2 whitespace-pre-line text-xs font-semibold leading-relaxed flex-1 overflow-y-auto max-h-36">
              {!inCall ? (
                <div className="text-center py-4 space-y-1">
                  <div className="text-sm font-bold">
                    Aqua-Seal USSD Terminal
                  </div>
                  <div className="text-[11px]">
                    Dial <span className="underline font-bold">*384*2782#</span>{" "}
                    or press Dial button below.
                  </div>
                  <div className="text-[10px] text-[#3b4c3b] mt-2">
                    SIM: {phoneNumber}
                  </div>
                </div>
              ) : (
                screenText || "Connecting to Aqua-Seal..."
              )}
            </div>

            {/* In-Call User Input Line */}
            {inCall && !isTerminal && (
              <div className="pt-1 border-t border-[#7c8f72] flex items-center space-x-1">
                <span className="text-xs font-bold">&gt;</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInput()}
                  placeholder="Enter response..."
                  className="w-full bg-transparent border-none outline-hidden text-xs font-mono font-bold text-[#111c11] placeholder-[#4d5f47]"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Quick presets for testing */}
          <div className="w-full mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              onClick={() => {
                if (!inCall) startCall();
                else setInputVal("1");
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-center truncate border border-slate-700 font-semibold"
            >
              1. Catch Log
            </button>
            <button
              onClick={() => {
                if (!inCall) startCall();
                else setInputVal("2");
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-center truncate border border-slate-700 font-semibold"
            >
              2. Log Ice
            </button>
            <button
              onClick={() => {
                if (!inCall) startCall();
                else setInputVal("3");
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-center truncate border border-slate-700 font-semibold"
            >
              3. Check Batch
            </button>
          </div>

          {/* Phone Keypad */}
          <div className="w-full mt-4 grid grid-cols-3 gap-2 max-w-[280px]">
            {/* Call Control Buttons */}
            <button
              onClick={inCall ? handleSendInput : startCall}
              className="py-2.5 rounded-lg bg-[#006064] hover:bg-[#004D40] text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center space-x-1 shadow-xs transition-all active:scale-95"
            >
              {inCall ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <Phone className="w-3.5 h-3.5" />
              )}
              <span>{inCall ? "Send" : "Dial"}</span>
            </button>

            <button
              onClick={() => {
                setInputVal("");
                if (isTerminal) startCall();
              }}
              className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wide flex items-center justify-center space-x-1 active:scale-95 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={endCall}
              disabled={!inCall}
              className={`py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide flex items-center justify-center space-x-1 shadow-xs transition-all active:scale-95 ${
                inCall
                  ? "bg-rose-700 hover:bg-rose-600 text-white"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800"
              }`}
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End</span>
            </button>

            {/* Digits 1-9 */}
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
              (char) => (
                <button
                  key={char}
                  onClick={() => handleKeyPress(char)}
                  className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-base border border-slate-700/60 shadow-xs active:bg-slate-600 transition-colors"
                >
                  {char}
                </button>
              ),
            )}
          </div>

          {/* SIM & Phone number selector */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Caller SIM:</span>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-200 font-mono text-xs w-36 text-right"
            />
          </div>
        </div>

        {/* Incoming Simulated SMS Drawer */}
        {receivedSms && (
          <div className="p-4 bg-[#004D40] border-t border-teal-900/60 flex items-start space-x-3 text-xs text-teal-100">
            <div className="p-1.5 bg-black/20 rounded-lg text-teal-200 shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-teal-200">
                SMS Notification Received (Africa's Talking)
              </div>
              <div className="mt-1 text-slate-900 bg-white p-2.5 rounded-lg border border-teal-200 font-mono">
                {receivedSms.message}
              </div>
            </div>
            <button
              onClick={() => setReceivedSms(null)}
              className="text-teal-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const SEND_URL = "https://functions.poehali.dev/5208ef17-79d8-4c21-9919-b3970c52b1e6";
const POLL_URL = "https://functions.poehali.dev/f8b3be3c-4e52-480e-a344-9a380fd1fd0c";
const POLL_INTERVAL = 4000;

function genSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getSessionId(): string {
  let id = sessionStorage.getItem("chat_session_id");
  if (!id) {
    id = genSessionId();
    sessionStorage.setItem("chat_session_id", id);
  }
  return id;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  created_at: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const sinceIdRef = useRef(0);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionId = useRef(getSessionId());

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `${POLL_URL}?session_id=${sessionId.current}&since_id=${sinceIdRef.current}`
      );
      const data = await res.json();
      if (data.ok && data.messages.length > 0) {
        setMessages((prev) => {
          const newMsgs = data.messages.filter(
            (m: Message) => !prev.find((p) => p.id === m.id)
          );
          if (newMsgs.length > 0) {
            sinceIdRef.current = Math.max(...data.messages.map((m: Message) => m.id));
            if (!open) setHasUnread(true);
            return [...prev, ...newMsgs];
          }
          return prev;
        });
      }
    } catch {
      // silent
    }
  }, [open]);

  useEffect(() => {
    if (started) {
      pollerRef.current = setInterval(poll, POLL_INTERVAL);
      return () => {
        if (pollerRef.current) clearInterval(pollerRef.current);
      };
    }
  }, [started, poll]);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const optimistic: Message = {
      id: Date.now(),
      role: "user",
      text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);
    if (!started) setStarted(true);

    try {
      await fetch(SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId.current, text }),
      });
      // Запускаем poll сразу после отправки
      setTimeout(poll, 1000);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Кнопка-пузырь */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Открыть чат"
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--blue)" }}
      >
        {open ? (
          <Icon name="X" size={22} color="#fff" />
        ) : (
          <Icon name="MessageSquare" size={22} color="#fff" />
        )}
        {hasUnread && !open && (
          <span
            className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: "#ef4444" }}
          />
        )}
      </button>

      {/* Окно чата */}
      {open && (
        <div
          className="fixed bottom-44 right-5 md:bottom-28 md:right-8 z-50 flex flex-col"
          style={{
            width: "min(370px, calc(100vw - 24px))",
            height: "min(520px, calc(100vh - 160px))",
            background: "var(--bg-white)",
            border: "1px solid var(--border-c)",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(15,44,90,0.16)",
            overflow: "hidden",
          }}
        >
          {/* Шапка */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border-c)", background: "var(--surface)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--blue-dim)" }}
            >
              <Icon name="Scale" size={18} color="var(--blue)" />
            </div>
            <div>
              <p className="font-body font-semibold text-sm" style={{ color: "var(--navy)" }}>
                Юридический помощник
              </p>
              <p className="font-body text-xs" style={{ color: "var(--success)" }}>
                ● Онлайн
              </p>
            </div>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div
                className="font-body text-sm leading-relaxed p-3 rounded-2xl rounded-tl-sm"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  maxWidth: "85%",
                }}
              >
                Здравствуйте! Я помогу разобраться с вашим вопросом. Опишите ситуацию — отвечу в течение нескольких минут.
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className="font-body text-sm leading-relaxed px-3 py-2 rounded-2xl"
                  style={{
                    maxWidth: "85%",
                    ...(msg.role === "user"
                      ? {
                          background: "var(--blue)",
                          color: "#fff",
                          borderBottomRightRadius: 4,
                        }
                      : {
                          background: "var(--surface)",
                          color: "var(--text)",
                          borderBottomLeftRadius: 4,
                        }),
                  }}
                >
                  {msg.text}
                </div>
                <span
                  className="font-body text-xs mt-1 px-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatTime(msg.created_at)}
                </span>
              </div>
            ))}
            {sending && (
              <div className="flex items-start">
                <div
                  className="px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1"
                  style={{ background: "var(--surface)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "var(--text-muted)",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Поле ввода */}
          <div
            className="shrink-0 px-3 py-3"
            style={{ borderTop: "1px solid var(--border-c)" }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{ background: "var(--surface-2)" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Напишите ваш вопрос..."
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none font-body text-sm leading-relaxed"
                style={{
                  color: "var(--text)",
                  maxHeight: 96,
                  minHeight: 24,
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 96) + "px";
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-opacity"
                style={{
                  background: input.trim() ? "var(--blue)" : "var(--border-c)",
                  opacity: input.trim() ? 1 : 0.5,
                }}
              >
                <Icon name="Send" size={15} color="#fff" />
              </button>
            </div>
            <p className="font-body text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>
              Среднее время ответа — до 5 минут
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}

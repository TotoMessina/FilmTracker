"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  MessageSquare, 
  Send, 
  User, 
  Circle, 
  Film,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { Profile, Message } from "@/lib/supabase/types";

function ChatContent() {
  const searchParams = useSearchParams();
  const targetUserIdParam = searchParams.get("id");

  const { user, profile: myProfile, isGuest } = useAuth();
  const { refreshUnreadCount } = useApp();

  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load contacts
  useEffect(() => {
    async function loadContacts() {
      setLoadingContacts(true);
      try {
        if (user) {
          // Fetch following
          const { data: rels } = await supabase
            .from("relationships")
            .select("following:profiles!relationships_following_id_fkey(*)")
            .eq("follower_id", user.id);

          let list: Profile[] = [];
          if (rels) {
            list = rels.map((r: any) => r.following).filter(Boolean);
          }

          // If no following, fetch some community users to chat with
          if (list.length === 0) {
            const { data: others } = await supabase
              .from("profiles")
              .select("*")
              .neq("id", user.id)
              .limit(5);

            if (others) list = others as Profile[];
          }

          setContacts(list);

          // If targetParam specified, select that user
          if (targetUserIdParam) {
            const target = list.find((c) => c.id === targetUserIdParam);
            if (target) setSelectedUser(target);
          } else if (list.length > 0) {
            setSelectedUser(list[0]);
          }
        } else if (isGuest) {
          // Demo contacts
          const demoContacts: Profile[] = [
            {
              id: "demo-critico-1",
              username: "Cinefilo_Pro",
              avatar_url: "https://ui-avatars.com/api/?name=Cinefilo&background=e50914&color=fff",
            },
            {
              id: "demo-critico-2",
              username: "Sofia_Film",
              avatar_url: "https://ui-avatars.com/api/?name=Sofia&background=d4af37&color=fff",
            },
          ];
          setContacts(demoContacts);
          setSelectedUser(demoContacts[0]);
        }
      } catch (err) {
        console.warn("Chat contacts error:", err);
      } finally {
        setLoadingContacts(false);
      }
    }

    loadContacts();
  }, [user, isGuest, targetUserIdParam]);

  // Load conversation when selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;

    async function loadMessages() {
      const targetUser = selectedUser;
      if (!targetUser) return;

      if (user) {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true })
          .limit(50);

        if (!error && data) {
          setMessages(data as Message[]);
          scrollToBottom();

          // Mark incoming as read
          await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("receiver_id", user.id)
            .eq("sender_id", targetUser.id);

          refreshUnreadCount();
        }
      } else if (isGuest) {
        // Demo mock messages
        setMessages([
          {
            id: "msg-1",
            sender_id: targetUser.id,
            receiver_id: "guest-user-123",
            content: `¡Hola! ¿Viste alguna buena película esta semana? Te recomiendo mirar el torneo eliminatorio.`,
            is_read: true,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
        scrollToBottom();
      }
    }

    loadMessages();

    // Setup Supabase Realtime channel
    if (user && selectedUser) {
      const channel = supabase
        .channel(`chat_${user.id}_${selectedUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.sender_id === selectedUser.id) {
              setMessages((prev) => [...prev, newMsg]);
              scrollToBottom();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser, user, isGuest]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser) return;

    const content = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    try {
      if (user) {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            sender_id: user.id,
            receiver_id: selectedUser.id,
            content,
            is_read: false,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages((prev) => [...prev, data as Message]);
          scrollToBottom();
        }
      } else if (isGuest) {
        // Guest mode simulated echo
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          sender_id: "guest-user-123",
          receiver_id: selectedUser.id,
          content,
          is_read: true,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();

        // Automated reply after 1s
        setTimeout(() => {
          const reply: Message = {
            id: `reply-${Date.now()}`,
            sender_id: selectedUser.id,
            receiver_id: "guest-user-123",
            content: `¡Totalmente de acuerdo! Las calificaciones en FilmTracker reflejan muy bien la calidad del cine.`,
            is_read: true,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, reply]);
          scrollToBottom();
        }, 1200);
      }
    } catch (err) {
      console.warn("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-[#141424] rounded-3xl border border-white/10 p-8 max-w-xl mx-auto space-y-5 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
          <MessageSquare className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Mensajería en Tiempo Real</h2>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
            Inicia sesión con tu cuenta para chatear en directo con otros cinéfilos, recomendar películas y compartir impresiones.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/auth"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition"
          >
            Crear Cuenta Gratis
          </Link>
          <Link
            href="/auth"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/10 transition"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] rounded-3xl bg-[#12121e] border border-white/5 overflow-hidden flex shadow-2xl">
      {/* Left Contacts List */}
      <div className={`w-full sm:w-80 border-r border-white/5 flex flex-col bg-[#0e0e17] ${selectedUser ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-base text-white">Mensajes</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loadingContacts ? (
            <div className="p-8 text-center text-xs text-zinc-500">Cargando contactos...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Sigue a otros cinéfilos en la pestaña de Comunidad para chatear con ellos.
            </div>
          ) : (
            contacts.map((c) => {
              const isSelected = selectedUser?.id === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedUser(c)}
                  className={`w-full p-4 flex items-center gap-3 transition text-left ${
                    isSelected ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <img
                    src={c.avatar_url || `https://ui-avatars.com/api/?name=${c.username}&background=e50914&color=fff`}
                    alt={c.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate">{c.username}</p>
                    <span className="text-xs text-zinc-400">En línea</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Conversation View */}
      <div className={`flex-1 flex flex-col bg-[#12121e] ${!selectedUser ? "hidden sm:flex" : "flex"}`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="sm:hidden p-1 text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=e50914&color=fff`}
                  alt={selectedUser.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedUser.username}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <Circle className="w-2 h-2 fill-emerald-400" />
                    <span>Conectado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Bubbles Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender_id === (user?.id || "guest-user-123");

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} max-w-full`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md break-words overflow-hidden ${
                        isMe
                          ? "bg-red-600 text-white rounded-br-xs"
                          : "bg-[#1d1d2f] text-zinc-200 border border-white/5 rounded-bl-xs"
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje cinematográfico..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 placeholder-zinc-500"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="p-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50 active:scale-95 shadow-md shadow-red-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
            <MessageSquare className="w-12 h-12 mb-3 text-zinc-600" />
            <p className="text-sm font-semibold">Selecciona una conversación para comenzar a chatear.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Cargando chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}

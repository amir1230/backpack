import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js";
import { Button } from "../components/ui/button.js";
import { Badge } from "../components/ui/badge.js";
import { ScrollArea } from "../components/ui/scroll-area.js";
import { useToast } from "../hooks/use-toast.js";
import { apiRequest, queryClient } from "../lib/queryClient.js";
import { Link, useLocation } from "wouter";
import { 
  MessageCircle, 
  Trash2, 
  Clock,
  Bot,
  Sparkles,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import AiChat from "../components/ai-chat.js";

interface ChatSession {
  id: number;
  userId: string;
  title: string;
  messages: any[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AiAssistant() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined);

  // Check for initial message from home page
  useEffect(() => {
    const storedMessage = sessionStorage.getItem('initialAiMessage');
    if (storedMessage) {
      setInitialMessage(storedMessage);
      sessionStorage.removeItem('initialAiMessage');
      // Clear after a short delay to allow AiChat to process it
      const timer = setTimeout(() => {
        setInitialMessage(undefined);
      }, 1000);
      
      // Cleanup timeout on unmount
      return () => clearTimeout(timer);
    }
  }, []);

  // Scroll to chat area when page loads
  useEffect(() => {
    // Wait for the page to fully render
    const scrollTimer = setTimeout(() => {
      // Find the chat area and scroll it into view (centered)
      const chatArea = document.querySelector('.lg\\:col-span-3');
      if (chatArea) {
        chatArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback: scroll to a reasonable position (not top, not bottom)
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, []);

  const { data: sessions = [], isLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-sessions"]
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest(`/api/chat-sessions/${sessionId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
      toast({
        title: t('chat_history.deleted_title'),
        description: t('chat_history.deleted_desc'),
      });
      if (selectedSession?.id === deleteMutation.variables) {
        setSelectedSession(null);
      }
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('chat_history.delete_error'),
        variant: "destructive"
      });
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleNewChat = () => {
    setSelectedSession(null);
    setInitialMessage(undefined); // Clear initial message for fresh chat
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-teal-500 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  {t('ai_assistant.title')}
                </h1>
                <p className="text-gray-600">
                  {t('ai_assistant.subtitle')}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                {t('common.back')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-t-4 border-t-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    {t('chat_history.your_conversations')}
                  </CardTitle>
                  <Badge variant="secondary">{sessions.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3 border-b">
                  <Button 
                    onClick={handleNewChat}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    data-testid="button-new-chat"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('chat_history.new_chat')}
                  </Button>
                </div>
                <ScrollArea className="h-[600px]">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">{t('chat_history.no_sessions')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`relative group rounded-lg transition-all border-2 ${
                            selectedSession?.id === session.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="w-full text-left p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">
                                  {session.title}
                                </h3>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {session.messages?.length || 0} {t('chat_history.messages')}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatDate(session.lastMessageAt)}
                              </div>
                            </div>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(session.id);
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {selectedSession ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedSession.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('common.created')}: {new Date(selectedSession.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleNewChat}
                      data-testid="button-start-new-chat"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('chat_history.new_chat')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      {t('ai_assistant.viewing_history')}
                    </p>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {selectedSession.messages.map((message: any, index: number) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                message.sender === 'user'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white border'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <span className="text-xs opacity-70 mt-2 block">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AiChat className="h-full" initialMessage={initialMessage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

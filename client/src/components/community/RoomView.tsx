import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Send, Loader2, RefreshCw, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MessageItem } from './MessageItem';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

interface Message {
  id: number;
  room_id: number;
  user_id?: string;
  author_name?: string;
  message: string;
  created_at: string;
  message_type?: string;
  is_deleted?: boolean;
}

interface RoomViewProps {
  roomId: number;
  roomName?: string;
  roomDescription?: string;
}

export function RoomView({ roomId, roomName, roomDescription }: RoomViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get guest name from localStorage
  useEffect(() => {
    const storedGuestName = localStorage.getItem('tripwise_guest_name') || '';
    setGuestName(storedGuestName);
  }, []);

  // Save guest name to localStorage
  const saveGuestName = (name: string) => {
    localStorage.setItem('tripwise_guest_name', name);
    setGuestName(name);
  };

  // Fetch messages for the room
  const { 
    data: messages = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/chat/messages', roomId],
    queryFn: () => apiRequest(`/api/chat/messages/${roomId}`),
    enabled: !!roomId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
    retry: false
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; author_name?: string }) => {
      return apiRequest('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          room_id: roomId,
          ...messageData
        })
      });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', roomId] });
      scrollToBottom();
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Can't send message",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || sendMessageMutation.isPending) return;

    // Anti-spam check
    if (trimmedMessage.length > 2000) {
      toast({
        title: "Message too long",
        description: "Please keep messages under 2000 characters",
        variant: "destructive"
      });
      return;
    }

    // Guest mode: ask for name if not provided
    if (!guestName.trim()) {
      const name = prompt("What's your name? (This will be saved for future messages)");
      if (!name?.trim()) return;
      saveGuestName(name.trim());
    }

    // Send message
    sendMessageMutation.mutate({
      message: trimmedMessage,
      author_name: guestName || 'Guest'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || messages.length === 0) return;
    
    setIsLoadingMore(true);
    try {
      // TODO: Implement pagination for message history
      // This would need to be implemented in the API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!roomId) {
    return (
      <Card className="flex-1 h-full flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <Hash className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Select a chat room</h3>
            <p className="text-gray-500">Choose a room from the sidebar to start chatting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 h-full flex flex-col">
      {/* Room Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              {roomName || `Room ${roomId}`}
            </CardTitle>
            {roomDescription && (
              <p className="text-sm text-gray-600 mt-1">{roomDescription}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Unable to load messages</p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
              <p className="text-gray-500">Be the first to say hi!</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {/* Load More Button */}
              {messages.length >= 30 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadMoreMessages}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Load Earlier Messages
                  </Button>
                </div>
              )}

              {/* Messages */}
              {Array.isArray(messages) && messages
                .filter((msg: Message) => !msg.is_deleted)
                .map((message: Message) => (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                  />
                ))
              }
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Composer */}
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder={`Message #${roomName || roomId}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
                className="resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  {guestName ? (
                    <span>Posting as: <strong>{guestName}</strong></span>
                  ) : (
                    <span>You'll be asked for your name when sending</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="lg"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
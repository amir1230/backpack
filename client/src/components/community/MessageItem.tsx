import { useState } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { formatDistanceToNow, format } from 'date-fns';
import { User, Bot } from 'lucide-react';

interface Message {
  id: number;
  room_id: number;
  user_id?: string;
  author_name?: string;
  message: string;
  created_at: string;
  message_type?: string;
  is_deleted?: boolean;
  is_edited?: boolean;
  edited_at?: string;
}

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const [imageError, setImageError] = useState(false);
  
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatFullTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'PPP pp');
    } catch {
      return timestamp;
    }
  };

  const getAvatarContent = () => {
    const authorName = message.author_name || 'Guest';
    const firstLetter = authorName.charAt(0).toUpperCase();
    
    // Generate a consistent color based on the author name
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = authorName.length % colors.length;
    
    return (
      <AvatarFallback className={`${colors[colorIndex]} text-white font-medium`}>
        {firstLetter}
      </AvatarFallback>
    );
  };

  const renderMessageContent = () => {
    // Handle different message types
    if (message.message_type === 'system') {
      return (
        <div className="italic text-gray-500 text-sm">
          {message.message}
        </div>
      );
    }

    // Regular text message with basic formatting
    const messageText = message.message || '';
    
    // Simple URL detection and linking
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = messageText.split(urlRegex);
    
    return (
      <div className="text-gray-800 whitespace-pre-wrap break-words">
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </div>
    );
  };

  return (
    <div className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
      <Avatar className="w-10 h-10 flex-shrink-0">
        {getAvatarContent()}
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {message.author_name || (message.user_id ? `User ${message.user_id.slice(0, 8)}` : 'Guest')}
          </span>
          
          {!message.user_id && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              Guest
            </Badge>
          )}
          
          {message.is_edited && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              edited
            </Badge>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-gray-500 hover:text-gray-700">
                  {formatTime(message.created_at)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  {formatFullTime(message.created_at)}
                  {message.is_edited && message.edited_at && (
                    <>
                      <br />
                      <span className="text-xs text-gray-400">
                        Edited: {formatFullTime(message.edited_at)}
                      </span>
                    </>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="text-sm">
          {renderMessageContent()}
        </div>
      </div>
    </div>
  );
}
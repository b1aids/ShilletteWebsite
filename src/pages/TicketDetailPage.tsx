import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useSocket } from '../contexts/SocketContext';

interface Message {
  sender_id: string;
  sender_username: string;
  text: string;
  timestamp: string;
}

interface Ticket {
  _id: string;
  subject: string;
  status: string;
  user_id: string;
  username: string;
  messages: Message[];
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useUser();
  const { socket, connected, joinTicketRoom, sendMessage } = useSocket();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  const API_BASE_URL = 'https://api.shillette.com';
  
  useEffect(() => {
    if (!loading && !user.logged_in) {
      navigate('/');
      return;
    }
    
    if (id) {
      fetchTicketDetails();
      
      if (socket && connected) {
        joinTicketRoom(id);
      }
    }
    
    return () => {
      // Clean up socket listeners if needed
    };
  }, [id, user, loading, socket, connected, navigate]);
  
  useEffect(() => {
    if (socket) {
      // Set up socket event listeners
      socket.on('new_message', handleNewMessage);
      socket.on('message_deleted', handleMessageDeleted);
      socket.on('ticket_status_updated', handleTicketStatusUpdated);
      
      return () => {
        // Clean up listeners
        socket.off('new_message');
        socket.off('message_deleted');
        socket.off('ticket_status_updated');
      };
    }
  }, [socket, id]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [ticket?.messages]);
  
  const fetchTicketDetails = async () => {
    if (!id) return;
    
    setTicketLoading(true);
    setTicketError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, { 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("You don't have permission to view this ticket");
        }
        if (response.status === 404) {
          throw new Error("Ticket not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTicket(data);
      setTicketLoading(false);
      
      // Join socket room for this ticket
      if (socket && connected) {
        joinTicketRoom(id);
      }
      
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setTicketError(error instanceof Error ? error.message : "Failed to load ticket details");
      setTicketLoading(false);
    }
  };
  
  const handleNewMessage = (data: any) => {
    if (data.ticket_id === id) {
      setTicket(prev => {
        if (!prev) return prev;
        
        const newMessage = {
          sender_id: data.sender_id,
          sender_username: data.username,
          text: data.text,
          timestamp: data.timestamp
        };
        
        return {
          ...prev,
          messages: [...prev.messages, newMessage]
        };
      });
    }
  };
  
  const handleMessageDeleted = (data: any) => {
    if (data.ticket_id === id) {
      setTicket(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          messages: prev.messages.filter(msg => msg.timestamp !== data.timestamp)
        };
      });
    }
  };
  
  const handleTicketStatusUpdated = (data: any) => {
    if (data.ticket_id === id) {
      setTicket(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          status: data.status
        };
      });
      
      // Show a message to the user
      // @ts-ignore - Using window method defined in MessagePopup
      if (window.showTicketMessage) {
        window.showTicketMessage(`Ticket status updated to ${data.status}.`);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !socket || !connected || !id) {
      return;
    }
    
    setSending(true);
    sendMessage(id, messageText);
    setMessageText('');
    setSending(false);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (ticketLoading) {
    return (
      <div className="flex-grow container mx-auto px-6 py-10">
        <div className="flex justify-start mb-8">
          <Link 
            to="/tickets" 
            className="text-orange-400 hover:text-orange-300 flex items-center space-x-2 transition duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Back to Tickets</span>
          </Link>
        </div>
        <div className="text-center text-gray-400">Loading ticket details...</div>
      </div>
    );
  }
  
  if (ticketError || !ticket) {
    return (
      <div className="flex-grow container mx-auto px-6 py-10">
        <div className="flex justify-start mb-8">
          <Link 
            to="/tickets" 
            className="text-orange-400 hover:text-orange-300 flex items-center space-x-2 transition duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Back to Tickets</span>
          </Link>
        </div>
        <div className="text-center text-red-400">{ticketError || "Ticket not found"}</div>
      </div>
    );
  }
  
  return (
    <div className="flex-grow container mx-auto px-6 py-10">
      <div className="flex justify-start mb-8">
        <Link 
          to="/tickets" 
          className="text-orange-400 hover:text-orange-300 flex items-center space-x-2 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Back to Tickets</span>
        </Link>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
        {ticket.subject || `Ticket #${id?.slice(-6)}`}
      </h2>
      
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        <div 
          id="chat-messages" 
          ref={chatMessagesRef}
          className="h-64 md:h-80 overflow-y-auto mb-4 p-3 bg-slate-900/50 rounded-md border border-slate-700 space-y-2"
        >
          {ticket.messages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No messages in this ticket yet.</p>
          ) : (
            ticket.messages.map((message, index) => (
              <div 
                key={index} 
                className="text-sm break-words p-1 rounded hover:bg-slate-800/50 transition-colors"
                data-timestamp={message.timestamp}
                data-sender-id={message.sender_id}
              >
                <span 
                  className="username font-semibold text-orange-400 mr-2 cursor-pointer hover:underline"
                  onClick={() => {/* Handle user info click */}}
                >
                  {message.sender_username}:
                </span>
                {message.text}
                <span className="timestamp text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form 
          id="chat-input-form" 
          className="flex space-x-2"
          onSubmit={handleSubmit}
        >
          <input 
            type="text" 
            id="chat-input" 
            placeholder="Type your message..." 
            required
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500"
          />
          <button 
            type="submit" 
            id="send-chat-button"
            disabled={!connected || sending}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
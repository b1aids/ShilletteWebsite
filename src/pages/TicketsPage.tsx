import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useSocket } from '../contexts/SocketContext';

interface Ticket {
  _id: string;
  subject: string;
  status: string;
  created_at: string;
  username: string;
}

export default function TicketsPage() {
  const { user, loading } = useUser();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const API_BASE_URL = 'https://api.shillette.com';
  
  useEffect(() => {
    if (!loading && !user.logged_in) {
      navigate('/');
      return;
    }
    
    fetchTickets();
    
    // Listen for ticket list updates from socket
    if (socket) {
      socket.on('ticket_list_updated', fetchTickets);
      
      return () => {
        socket.off('ticket_list_updated');
      };
    }
  }, [user, loading, socket, navigate]);
  
  const fetchTickets = async () => {
    if (!user.logged_in) return;
    
    setTicketsLoading(true);
    setTicketsError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets`, { 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (user.is_moderator) {
        // For moderators, split tickets into active and archived
        const active = data.filter((ticket: Ticket) => ticket.status === 'open');
        const archived = data.filter((ticket: Ticket) => ticket.status !== 'open');
        
        setActiveTickets(active);
        setArchivedTickets(archived);
      } else {
        // For regular users, just set all tickets
        setTickets(data);
      }
      
      setTicketsLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTicketsError("Failed to load tickets");
      setTicketsLoading(false);
    }
  };
  
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please fill out both subject and message.' });
      return;
    }
    
    setSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setSubmitStatus({ type: 'success', message: 'Ticket submitted successfully!' });
      setSubject('');
      setMessage('');
      
      // Refresh ticket list
      fetchTickets();
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to submit ticket' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };
  
  return (
    <div className="flex-grow container mx-auto px-6 py-10">
      <div className="flex justify-start mb-8">
        <Link 
          to="/products" 
          className="text-orange-400 hover:text-orange-300 flex items-center space-x-2 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Back to Products</span>
        </Link>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Support Tickets</h2>
      
      {user.is_moderator ? (
        // Moderator View
        <div className="mb-8 bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">Ticket Management</h3>
          
          <details className="mb-6" open>
            <summary className="cursor-pointer text-lg font-semibold text-white mb-3 hover:text-orange-400 transition-colors">
              Active Tickets
            </summary>
            <div className="ticket-list-container mt-3 space-y-3 max-h-96 overflow-y-auto pr-2">
              {ticketsLoading ? (
                <p className="text-sm text-gray-500">Loading active tickets...</p>
              ) : activeTickets.length === 0 ? (
                <p className="text-sm text-gray-500">No active tickets found.</p>
              ) : (
                activeTickets.map(ticket => (
                  <div 
                    key={ticket._id}
                    className="bg-slate-700/50 p-4 rounded-md mb-3 flex justify-between items-center cursor-pointer hover:bg-slate-600/50 transition-colors"
                    onClick={() => handleTicketClick(ticket._id)}
                    data-ticket-id={ticket._id}
                    data-ticket-status={ticket.status}
                  >
                    <div>
                      <p className="font-medium text-white">
                        #{ticket._id.slice(-6)}: {ticket.subject}
                      </p>
                      <p className="text-xs text-gray-400">
                        User: {ticket.username} | Opened: {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-green-500 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      Open
                    </span>
                  </div>
                ))
              )}
            </div>
          </details>
          
          <details>
            <summary className="cursor-pointer text-lg font-semibold text-white mb-3 hover:text-orange-400 transition-colors">
              Archived Tickets
            </summary>
            <div className="ticket-list-container mt-3 space-y-3 max-h-96 overflow-y-auto pr-2">
              {ticketsLoading ? (
                <p className="text-sm text-gray-500">Loading archived tickets...</p>
              ) : archivedTickets.length === 0 ? (
                <p className="text-sm text-gray-500">No archived tickets found.</p>
              ) : (
                archivedTickets.map(ticket => (
                  <div 
                    key={ticket._id}
                    className="bg-slate-700/50 p-4 rounded-md mb-3 flex justify-between items-center cursor-pointer hover:bg-slate-600/50 transition-colors"
                    onClick={() => handleTicketClick(ticket._id)}
                    data-ticket-id={ticket._id}
                    data-ticket-status={ticket.status}
                  >
                    <div>
                      <p className="font-medium text-white">
                        #{ticket._id.slice(-6)}: {ticket.subject}
                      </p>
                      <p className="text-xs text-gray-400">
                        User: {ticket.username} | Opened: {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-red-500 text-red-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      Closed
                    </span>
                  </div>
                ))
              )}
            </div>
          </details>
        </div>
      ) : (
        // User View
        <div className="mb-8 bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">My Tickets</h3>
          <div className="ticket-list-container space-y-3 max-h-96 overflow-y-auto pr-2">
            {ticketsLoading ? (
              <p className="text-sm text-gray-500">Loading tickets...</p>
            ) : ticketsError ? (
              <p className="text-sm text-red-400">{ticketsError}</p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-gray-500">You have no support tickets.</p>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket._id}
                  className="bg-slate-700/50 p-4 rounded-md mb-3 flex justify-between items-center cursor-pointer hover:bg-slate-600/50 transition-colors"
                  onClick={() => handleTicketClick(ticket._id)}
                  data-ticket-id={ticket._id}
                  data-ticket-status={ticket.status}
                >
                  <div>
                    <p className="font-medium text-white">
                      #{ticket._id.slice(-6)}: {ticket.subject}
                    </p>
                    <p className="text-xs text-gray-400">
                      Opened: {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`${ticket.status === 'open' ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900'} text-xs font-bold px-2 py-0.5 rounded-full`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Create New Ticket</h3>
        <form onSubmit={handleCreateTicket}>
          <div className="mb-4">
            <label htmlFor="ticket-subject" className="block text-sm font-medium text-gray-300 mb-1">
              Subject
            </label>
            <input 
              type="text" 
              id="ticket-subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="ticket-message-input" className="block text-sm font-medium text-gray-300 mb-1">
              Message
            </label>
            <textarea 
              id="ticket-message-input" 
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500"
            ></textarea>
          </div>
          <div 
            className={`h-6 text-sm mt-4 mb-4 text-center ${
              submitStatus?.type === 'success' ? 'text-green-400' : 
              submitStatus?.type === 'error' ? 'text-red-400' : ''
            }`}
          >
            {submitStatus?.message}
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPaymentHistory } from '../api/paymentService';
import '../styles/payment.css';

const Tickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tickets' } });
      return;
    }

    // Check if user came from successful payment
    if (location.state?.paymentSuccess) {
      setShowSuccess(true);
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await getPaymentHistory();
        
        if (response.success) {
          setTickets(response.data);
        } else {
          setError('Could not load your tickets');
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="tickets-page">
        <div className="loading">Loading your tickets...</div>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      <div className="tickets-container">
        <h1>My Tickets</h1>
        
        {showSuccess && (
          <div className="payment-success-banner">
            <p>Payment successful! Your ticket has been issued.</p>
            {location.state?.ticketId && (
              <Link to={`/tickets/${location.state.ticketId}`} className="view-ticket-link">
                View Ticket
              </Link>
            )}
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {!loading && tickets.length === 0 ? (
          <div className="no-tickets">
            <p>You don't have any tickets yet.</p>
            <Link to="/events" className="browse-events-link">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-item">
                <div className="ticket-item-details">
                  <h3>{ticket.event.title}</h3>
                  <p className="ticket-date">
                    {new Date(ticket.event.startDateTime).toLocaleDateString()} at {' '}
                    {new Date(ticket.event.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="ticket-venue">{ticket.event.venue}</p>
                  <span className={`ticket-status ${ticket.ticket.status.toLowerCase()}`}>
                    {ticket.ticket.status}
                  </span>
                </div>
                <div className="ticket-item-actions">
                  <Link to={`/tickets/${ticket.payment.id}`} className="view-details-button">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets; 
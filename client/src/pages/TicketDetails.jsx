import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode.react';
import { getPaymentDetails } from '../api/paymentService';

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [payment, setPayment] = useState(null);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tickets/${ticketId}` } });
      return;
    }

    const fetchTicketData = async () => {
      try {
        setLoading(true);
        // Fetch ticket and payment details
        const response = await getPaymentDetails(ticketId);
        
        if (response.success) {
          setPayment(response.data.payment);
          setTicket(response.data.ticket);
          setEvent(response.data.event);
        } else {
          setError('Ticket not found');
        }
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        setError('Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId, isAuthenticated, navigate]);

  const handleDownloadTicket = () => {
    const canvas = document.getElementById('ticket-qr-code');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `ticket-${ticket.ticketCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (loading) {
    return (
      <div className="ticket-details-page">
        <div className="loading">Loading ticket details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-details-page">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/tickets')} className="back-button">
          Back to My Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-details-page">
      <div className="ticket-container">
        <h2>Your Ticket</h2>
        
        {ticket && event && (
          <div className="ticket-card">
            <div className="ticket-header">
              <h3>{event.title}</h3>
              <span className={`ticket-status ${ticket.status.toLowerCase()}`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="ticket-info">
              <p><strong>Date:</strong> {new Date(event.startDateTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(event.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p><strong>Venue:</strong> {event.venue}</p>
              <p><strong>Address:</strong> {event.address}</p>
              <p><strong>Ticket Code:</strong> {ticket.ticketCode}</p>
            </div>
            
            <div className="ticket-qr-container">
              <QRCode 
                id="ticket-qr-code"
                value={ticket.ticketCode} 
                size={150}
                level="H"
                includeMargin={true}
              />
              <button 
                onClick={handleDownloadTicket} 
                className="download-ticket-button"
              >
                Download QR Code
              </button>
            </div>
            
            {payment && (
              <div className="payment-info">
                <h4>Payment Information</h4>
                <p><strong>Amount Paid:</strong> ${(payment.amount / 100).toFixed(2)}</p>
                <p><strong>Payment Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Status:</strong> {payment.status}</p>
                {payment.receiptUrl && (
                  <a 
                    href={payment.receiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="receipt-link"
                  >
                    View Receipt
                  </a>
                )}
              </div>
            )}
          </div>
        )}
        
        <button onClick={() => navigate('/tickets')} className="back-button">
          Back to My Tickets
        </button>
      </div>
    </div>
  );
};

export default TicketDetails; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context with default values
const TicketContext = createContext({
  tickets: [],
  loading: false,
  error: null,
  fetchUserTickets: () => Promise.resolve({ success: false }),
  getTicketById: () => Promise.resolve({ success: false }),
  clearTickets: () => {}
});

// Custom hook for using the ticket context
export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  return context;
};

// Provider component
export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tickets for the current user
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/tickets/my-tickets');
      
      if (response.data && response.data.success) {
        setTickets(response.data.data || []);
        return { success: true, tickets: response.data.data };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch tickets';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get a specific ticket by ID
  const getTicketById = async (ticketId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/tickets/${ticketId}`);
      
      if (response.data && response.data.success) {
        return { success: true, ticket: response.data.data };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch ticket');
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear all tickets from state
  const clearTickets = () => {
    setTickets([]);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        loading,
        error,
        fetchUserTickets,
        getTicketById,
        clearTickets
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export default TicketContext; 
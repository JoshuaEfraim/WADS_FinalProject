import axios from 'axios';

const URL = import.meta.env.VITE_API_URL

const API_URL = "/tickets"; // Match your backend route

const ticketService = {
  /**
   * Create a new ticket
   * @param {Object} ticketData
   * @param {string} ticketData.subject
   * @param {string} ticketData.description
   * @param {string} ticketData.priority
   */
  createTicket: async (ticketData) => {
    try {
      const response = await axios.post(`${API_URL}/create`, ticketData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Ticket service error:', error.response?.data);
      
      // Return error from backend response
      if (error.response?.data) {
        throw error.response.data;
      }
      
      // Return generic error for network issues
      throw {
        message: 'Network error. Please try again.'
      };
    }
  },

  // You can add other ticket-related API calls here later
  // Like getTickets, updateTicket, deleteTicket, etc.
};

export default ticketService; 
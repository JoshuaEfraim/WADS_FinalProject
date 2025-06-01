import axios from 'axios';

const API_URL = 'http://localhost:3000/service/user'; // Replace with your backend URL


//signin
const authService = {
  /**
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, { email, password }, {
        withCredentials: true
      });
      return response.data;
    } catch (/** @type {any} */ error) {
      console.error('Auth service error:', error.response?.data);
      
      // Return error from backend response
      if (error.response?.data) {
        return {
          error: error.response.data
        };
      }
      
      // Return generic error for network issues
      return {
        error: {
          message: 'Network error. Please try again.'
        }
      };
    }
  },

  /**
   * Get the current logged in user's profile
   * @returns {Promise<{name: string, email: string, department: string, role: string}>}
   */
  getCurrentUser: async () => {
    try {
      console.log('Making request to:', `${API_URL}/profile`);
      const response = await axios.get(`${API_URL}/profile`, {
        withCredentials: true
      });
      console.log('Response received:', response);
      return response.data;
    } catch (/** @type {any} */ error) {
      console.error('getCurrentUser error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      throw error.response?.data || { message: 'Failed to fetch user profile' };
    }
  },

  //signup
  /**
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.password
   */
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (/** @type {any} */ error) {
      console.error('Auth service error:', error.response?.data);
      
      // Return error from backend response
      if (error.response?.data) {
        return {
          error: error.response.data
        };
      }
      
      // Return generic error for network issues
      return {
        error: {
          message: 'Network error. Please try again.'
        }
      };
    }
  },

  //update profile and/or change password
  /**
   * @param {string} userId
   * @param {Object} userData
   * @param {string} [userData.name]
   * @param {string} [userData.email]
   * @param {string} [userData.department]
   * @param {string} [userData.phoneNumber]
   * @param {string} [userData.currentPassword]
   * @param {string} [userData.newPassword]
   */
  updateProfile: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/update/${userId}`, userData, {
        withCredentials: true
      });
      return response.data;
    } catch (/** @type {any} */ error) {
      throw error.response?.data || { message: 'An error occurred while updating profile' };
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  googleLogin: () => {
    // Redirect to Google auth - backend handles all redirects
    window.location.href = `${API_URL}/auth/google`;
  },

  /**
   * Send password reset email
   * @param {string} email - The email address to send the reset link to
   */
  sendPasswordResetEmail: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (/** @type {any} */ error) {
      console.error('Password reset email error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || { message: 'Failed to send password reset email' };
    }
  },

  /**
   * Reset password using token
   * @param {string} token - The reset password token from the URL
   * @param {string} newPassword - The new password
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword
      });
      return response.data;
    } catch (/** @type {any} */ error) {
      console.error('Reset password error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Handle specific error cases
      if (error.response?.data) {
        throw error.response.data;
      }

      // Handle JWT verification errors
      if (error.name === 'JsonWebTokenError') {
        throw { message: 'Invalid reset token' };
      }

      throw { message: 'Error resetting password' };
    }
  }
};

export default authService; 
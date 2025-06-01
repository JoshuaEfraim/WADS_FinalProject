// @ts-nocheck
import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {('default'|'destructive')} variant
 */

/**
 * @typedef {Object} ToastOptions
 * @property {string} title
 * @property {string} description
 * @property {('default'|'destructive')} [variant]
 */

export function useToast() {
  const [toasts, setToasts] = useState([]);

  /**
   * @param {ToastOptions} options
   */
  const toast = ({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      title,
      description,
      variant
    };

    setToasts((currentToasts) => [...currentToasts, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((currentToasts) => 
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, 5000);
  };

  return {
    toast,
    toasts
  };
} 
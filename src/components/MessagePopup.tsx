import { useState, useEffect, useRef } from 'react';

interface MessagePopupProps {
  id: string;
  isError?: boolean;
}

export default function MessagePopup({ id, isError = false }: MessagePopupProps) {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Function to show a message
  const showMessage = (text: string, duration = 3500) => {
    setMessage(text);
    setIsVisible(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout to hide the message
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, duration);
  };
  
  // Expose the showMessage function to the window object
  useEffect(() => {
    const element = document.getElementById(id);
    if (element) {
      // @ts-ignore - Adding custom property to window
      window[`show${id.charAt(0).toUpperCase() + id.slice(1)}`] = showMessage;
    }
    
    return () => {
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Remove the function from window
      // @ts-ignore - Removing custom property from window
      delete window[`show${id.charAt(0).toUpperCase() + id.slice(1)}`];
    };
  }, [id]);
  
  return (
    <div 
      id={id} 
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 
                 ${isError ? 'bg-red-600' : 'bg-green-600'} 
                 text-white text-sm font-medium py-2 px-5 rounded-lg shadow-lg 
                 transition-opacity duration-500 ease-in-out z-50 pointer-events-none
                 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {message}
    </div>
  );
}
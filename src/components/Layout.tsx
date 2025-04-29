import { ReactNode, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { useUser } from '../contexts/UserContext';
import Header from './Header';
import Footer from './Footer';
import SnowBackground from './SnowBackground';
import MessagePopup from './MessagePopup';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { config } = useConfig();
  const { user, loading } = useUser();
  const navigate = useNavigate();

  // Redirect to home if accessing protected routes while not logged in
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/tickets'];
    const currentPath = window.location.pathname;
    
    if (!loading && !user.logged_in && 
        (protectedRoutes.includes(currentPath) || 
         currentPath.startsWith('/tickets/'))) {
      navigate('/', { replace: true });
    }
  }, [user.logged_in, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <SnowBackground />
      
      <MessagePopup id="payment-message" />
      <MessagePopup id="ticket-message" />
      <MessagePopup id="error-message" isError={true} />
      <MessagePopup id="config-message" />
      <MessagePopup id="product-message" />
      
      <div id="loading-overlay">
        <div className="loader">
          <span className="loader-bar"></span>
          <span className="loader-bar"></span>
          <span className="loader-bar"></span>
        </div>
      </div>
      
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
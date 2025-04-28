import React, { useEffect } from 'react';
import { Home } from './components/Home';
import { Products } from './components/Products';
import { Dashboard } from './components/Dashboard';
import { Tickets } from './components/Tickets';
import { TicketDetail } from './components/TicketDetail';
import { ProductDetail } from './components/ProductDetail';

function App() {
  const [activePage, setActivePage] = React.useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'home';
      setActivePage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      <div id="snow-container"></div>

      {/* Messages */}
      <div id="payment-message">Placeholder</div>
      <div id="ticket-message">Placeholder</div>
      <div id="error-message">Placeholder</div>
      <div id="config-message">Placeholder</div>
      <div id="product-message">Placeholder</div>

      {/* Loading Overlay */}
      <div id="loading-overlay">
        <div className="loader">
          <span className="loader-bar"></span>
          <span className="loader-bar"></span>
          <span className="loader-bar"></span>
        </div>
      </div>

      {/* Header */}
      <header className="py-4 sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img id="header-site-icon" src="/assets/images/icon.png" alt="Site Icon" className="w-8 h-8" />
            <span id="site-title-display" className="text-2xl font-bold text-white">Shillette</span>
          </div>
          <div className="flex items-center space-x-6">
            <nav id="main-navigation" className="hidden md:flex space-x-6">
              {/* Navigation items added dynamically */}
            </nav>
            <div id="user-area" className="flex items-center">
              <a id="login-button" href="https://api.shillette.com/login" className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.54 6.04a13.27 13.27 0 00-2.66-1.89 12.4 12.4 0 00-1.6-1.3c-.4-.3-.82-.53-1.28-.71-.18-.07-.37-.13-.56-.19a.82.82 0 00-.5-.06 11.85 11.85 0 00-5.88 0 .82.82 0 00-.5.06c-.19.06-.38.12-.56.19-.46.18-.88.4-1.28.7a12.34 12.34 0 00-1.6 1.3A13.23 13.23 0 004.46 6.04 14.31 14.31 0 003 11.7c0 .1 0 .19.02.28a13.8 13.8 0 001.44 4.61c.56 1.1 1.24 2.1 2.04 3 .5.56 1.04 1.07 1.63 1.53.17.13.34.25.52.37a.8.8 0 00.57.19.78.78 0 00.57-.19 11.07 11.07 0 005.56 0 .78.78 0 00.57.19.8.8 0 00.57-.19c.18-.12.35-.24.52-.37a12.06 12.06 0 003.67-4.53 13.85 13.85 0 001.44 4.61c0-.1 0-.19.02-.28a14.31 14.31 0 00-1.46-5.66zm-4.61 7.03a1.93 1.93 0 01-3.86 0 1.93 1.93 0 013.86 0zm-5.72 0a1.93 1.93 0 01-3.86 0 1.93 1.93 0 013.86 0z"></path>
                </svg>
                <span>Login with Discord</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {activePage === 'home' && <Home />}
        {activePage === 'products' && <Products />}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'tickets' && <Tickets />}
        {activePage === 'ticket-detail' && <TicketDetail />}
        {activePage === 'product-detail' && <ProductDetail />}
      </main>

      {/* Footer */}
      <footer className="bg-black mt-auto py-6 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; <span id="footer-year">2025</span> Shillette. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
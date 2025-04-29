import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { useUser } from '../contexts/UserContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { config } = useConfig();
  const { user, logout } = useUser();
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="py-4 sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            id="header-site-icon" 
            src={config?.siteIconUrl || "/images/icon.png"} 
            alt="Site Icon" 
            className="w-8 h-8" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/icon.png';
              target.onerror = null;
            }}
          />
          <Link to="/" className="text-2xl font-bold text-white">
            {config?.siteTitle || "Shillette"}
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-6">
            {config?.headerLinks?.map((link, index) => (
              link.target === '_blank' ? (
                <a 
                  key={index}
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  {link.name}
                </a>
              ) : (
                <NavLink 
                  key={index}
                  to={link.href} 
                  className={({ isActive }) => 
                    `text-gray-300 hover:text-white transition duration-200 ${isActive ? 'text-white' : ''}`
                  }
                >
                  {link.name}
                </NavLink>
              )
            ))}
          </nav>
          
          <div id="user-area" className="flex items-center">
            {!user.logged_in ? (
              <a 
                href="https://api.shillette.com/login" 
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.54 6.04a13.27 13.27 0 00-2.66-1.89 12.4 12.4 0 00-1.6-1.3c-.4-.3-.82-.53-1.28-.71-.18-.07-.37-.13-.56-.19a.82.82 0 00-.5-.06 11.85 11.85 0 00-5.88 0 .82.82 0 00-.5.06c-.19.06-.38.12-.56.19-.46.18-.88.4-1.28.7a12.34 12.34 0 00-1.6 1.3A13.23 13.23 0 004.46 6.04 14.31 14.31 0 003 11.7c0 .1 0 .19.02.28a13.8 13.8 0 001.44 4.61c.56 1.1 1.24 2.1 2.04 3 .5.56 1.04 1.07 1.63 1.53.17.13.34.25.52.37a.8.8 0 00.57.19.78.78 0 00.57-.19 11.07 11.07 0 005.56 0 .78.78 0 00.57.19.8.8 0 00.57-.19c.18-.12.35-.24.52-.37a12.06 12.06 0 003.67-4.53 13.85 13.85 0 001.44 4.61c0-.1 0-.19.02-.28a14.31 14.31 0 00-1.46-5.66zm-4.61 7.03a1.93 1.93 0 01-3.86 0 1.93 1.93 0 013.86 0zm-5.72 0a1.93 1.93 0 01-3.86 0 1.93 1.93 0 013.86 0z"></path>
                </svg>
                <span>Login with Discord</span>
              </a>
            ) : (
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-3 hover:bg-slate-700/50 p-1.5 rounded-lg transition duration-200 cursor-pointer"
              >
                <img 
                  src={user.user_id && user.avatar 
                    ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=32` 
                    : 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?'
                  } 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full border-2 border-slate-600" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/32x32/7f8c8d/ecf0f1?text=?';
                  }}
                />
                <span className="text-white text-sm font-medium">{user.username}</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="text-gray-400 hover:text-white text-xs font-medium bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded-md transition duration-200"
                >
                  Logout
                </button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm p-4 space-y-2 border-t border-gray-700/50 md:hidden z-30">
          {config?.headerLinks?.map((link, index) => (
            link.target === '_blank' ? (
              <a 
                key={index}
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-white transition duration-200 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ) : (
              <NavLink 
                key={index}
                to={link.href} 
                className={({ isActive }) => 
                  `block text-gray-300 hover:text-white transition duration-200 py-1 ${isActive ? 'text-white' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            )
          ))}
        </div>
      )}
    </header>
  );
}
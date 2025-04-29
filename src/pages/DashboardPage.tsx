import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface RegisteredProduct {
  _id: string;
  product_id: string;
  product_name: string;
  order_id: string;
  registered_at: string;
  email_used?: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();
  const [registeredProducts, setRegisteredProducts] = useState<RegisteredProduct[]>([]);
  
  useEffect(() => {
    if (!loading && !user.logged_in) {
      navigate('/');
    }
    
    if (user.logged_in && user.registered_product_details) {
      setRegisteredProducts(user.registered_product_details);
    }
  }, [user, loading, navigate]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const displayUserRoles = () => {
    if (!user.roles || user.roles.length === 0) {
      return <p className="text-gray-400 text-xs w-full">No roles found.</p>;
    }
    
    return user.roles.map((role) => {
      // Determine color and text contrast
      let hexColor = '#9CA3AF'; // Default gray
      if (role.color && role.color !== 0) {
        // Convert decimal color to hex
        hexColor = '#' + role.color.toString(16).padStart(6, '0');
      }
      
      // Calculate luminance to decide text color (black or white)
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const textColorClass = luminance > 0.5 ? 'text-black' : 'text-white';
      
      return (
        <span 
          key={role.id} 
          className={`role-span px-2 py-0.5 rounded-md text-xs font-medium mr-1 mb-1 inline-block ${textColorClass}`}
          style={{ backgroundColor: hexColor }}
        >
          {role.name}
        </span>
      );
    });
  };
  
  if (loading) {
    return (
      <div className="flex-grow container mx-auto px-6 py-10">
        <div className="text-center text-gray-400">Loading dashboard...</div>
      </div>
    );
  }
  
  return (
    <div className="flex-grow container mx-auto px-6 py-10">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src={user.user_id && user.avatar 
                ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=64` 
                : 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?'
              } 
              alt="User Avatar" 
              className="w-16 h-16 rounded-full border-2 border-orange-500" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/64x64/7f8c8d/ecf0f1?text=?';
              }}
            />
            <div>
              <p className="text-xl font-semibold text-white">{user.username}</p>
              <div className="mt-2 space-y-1 flex flex-wrap gap-1">
                {displayUserRoles()}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
        
        {user.is_moderator && (
          <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Admin Dashboard</h3>
            <p className="text-gray-400">
              You have moderator privileges. You can access additional admin features.
            </p>
            {/* Admin features would go here */}
          </div>
        )}
        
        <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">My Products</h3>
          {registeredProducts.length === 0 ? (
            <p className="text-gray-400">You have no registered products.</p>
          ) : (
            <div className="space-y-3">
              {registeredProducts.map((product) => (
                <div 
                  key={product.product_id} 
                  className="bg-slate-700/50 p-3 rounded-md flex items-center space-x-3 hover:bg-slate-600/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/products/${product.product_id}`)}
                >
                  <img 
                    src={`https://placehold.co/40x40/7f8c8d/ecf0f1?text=${product.product_name?.charAt(0) || 'P'}`} 
                    alt={`${product.product_name || 'Product'} thumbnail`} 
                    className="w-10 h-10 rounded object-cover flex-shrink-0" 
                  />
                  <div>
                    <p className="text-white font-medium">{product.product_name || 'Unnamed Product'}</p>
                    <p className="text-xs text-gray-400">Registered</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
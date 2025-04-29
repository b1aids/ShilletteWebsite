import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface RegisteredProduct {
  product_id: string;
  product_name: string;
  order_id: string;
  registered_at: string;
}

interface User {
  logged_in: boolean;
  user_id?: string;
  username?: string;
  avatar?: string;
  is_moderator?: boolean;
  roles?: Role[];
  registered_product_details?: RegisteredProduct[];
}

interface UserContextType {
  user: User;
  loading: boolean;
  error: string | null;
  checkLoginStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ logged_in: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const checkLoginStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user`, { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || response.status === 404) {
          // Consider these as normal "not logged in" states
          setUser({ logged_in: false });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.warn("Error checking login status:", error);
      // Don't show error to user for login check failures, just set as logged out
      setUser({ logged_in: false });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Logout API call failed, clearing user state anyway');
      }
    } catch (error) {
      console.warn("Error during logout:", error);
    } finally {
      setUser({ logged_in: false });
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, checkLoginStatus, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface HeaderLink {
  name: string;
  href: string;
  target?: string;
}

interface SiteConfig {
  siteTitle: string;
  siteIconUrl: string;
  headerLinks: HeaderLink[];
}

interface ConfigContextType {
  config: SiteConfig | null;
  loading: boolean;
  error: string | null;
}

const defaultConfig: SiteConfig = {
  siteTitle: "Shillette",
  siteIconUrl: "/images/icon.png",
  headerLinks: [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Tickets", href: "/tickets" },
    { name: "Discord", href: "https://discord.gg/shillette", target: "_blank" }
  ]
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/config`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('Config API not available, using default config');
          setConfig(defaultConfig);
          return;
        }

        const configData = await response.json();
        
        // Convert hash links to pretty URLs
        if (configData.headerLinks) {
          configData.headerLinks = configData.headerLinks.map((link: HeaderLink) => {
            if (link.href.startsWith('/#')) {
              return {
                ...link,
                href: link.href.replace('/#', '/')
              };
            }
            return link;
          });
        }
        
        setConfig(configData);
      } catch (error) {
        console.warn("Error loading site config, using defaults:", error);
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
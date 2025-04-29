import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  tag: string;
  tagColor: string;
  customBorderHex?: string;
  thumbnailUrl?: string;
  description?: string;
  features?: string[];
  averageRating?: number;
  sellsnSid?: string;
  sellsnPid?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);
  
  const API_BASE_URL = 'https://api.shillette.com';
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setProducts(data);
        
        // Extract unique tags
        const tags = [...new Set(data.map((p: Product) => p.tag).filter(Boolean))];
        setUniqueTags(tags);
        
        setFilteredProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  useEffect(() => {
    // Apply filters and sorting
    let result = [...products];
    
    // Filter by tag
    if (selectedTag !== 'all') {
      result = result.filter(product => product.tag === selectedTag);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.name?.toLowerCase().includes(term)) ||
        (product.description?.toLowerCase().includes(term)) ||
        (product.features?.some(f => f.toLowerCase().includes(term)))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'name_asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        // Default sorting (could be by featured or id)
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, selectedTag, sortOption]);
  
  const getSortLabel = () => {
    switch (sortOption) {
      case 'name_asc': return 'Sort: Name (A-Z)';
      case 'name_desc': return 'Sort: Name (Z-A)';
      case 'price_asc': return 'Sort: Price (Low-High)';
      case 'price_desc': return 'Sort: Price (High-Low)';
      default: return 'Sort: Default';
    }
  };
  
  const cycleSortOption = () => {
    const options = ['default', 'name_asc', 'name_desc', 'price_asc', 'price_desc'];
    const currentIndex = options.indexOf(sortOption);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortOption(options[nextIndex]);
  };
  
  return (
    <div className="flex-grow container mx-auto px-6 py-10">
      <div className="flex justify-start mb-8">
        <Link 
          to="/" 
          className="text-orange-400 hover:text-orange-300 flex items-center space-x-2 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Our Products</h2>
      
      <div className="mb-8 space-y-4">
        <div className="relative w-full">
          <input 
            type="text" 
            id="product-search-input" 
            placeholder="Search products..." 
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            type="button" 
            className="w-full sm:w-auto bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 hover:bg-slate-600 transition duration-150 whitespace-nowrap"
            onClick={cycleSortOption}
          >
            {getSortLabel()}
          </button>
          
          <div className="w-full sm:w-auto relative">
            <select 
              className="w-full sm:w-auto bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none pr-8"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="all">Filter by Tag (All)</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center text-gray-400">Loading products...</p>
      ) : error ? (
        <p className="text-center text-red-400">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-400">No products match your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  // Determine border style
  const tagColor = product.tagColor || 'gray';
  const customHex = product.customBorderHex;
  let borderClasses = '';
  let inlineStyle = {};
  
  if (customHex && /^#[0-9A-F]{6}$/i.test(customHex)) {
    borderClasses = 'custom-border';
    inlineStyle = {
      borderColor: customHex,
      '--custom-hover-shadow': `0 0 8px 1px ${customHex}99, 0 0 16px 4px ${customHex}66, 0 0 32px 8px ${customHex}33`
    } as React.CSSProperties;
  } else if (tagColor !== 'custom') {
    borderClasses = `card-gradient-border ${tagColor}-border`;
  } else {
    borderClasses = `card-gradient-border gray-border`; // Fallback
  }
  
  // Determine tag display color
  const displayTagColor = (tagColor === 'custom' && !customHex) ? 'gray' : tagColor;
  const tagBgClass = `bg-${displayTagColor}-500/20`;
  const tagTextClass = `text-${displayTagColor}-300`;
  
  const [imageError, setImageError] = useState(false);
  
  const handleCardClick = () => {
    window.location.href = `/products/${product._id}`;
  };
  
  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle purchase logic here
    if (product.sellsnSid && product.sellsnPid) {
      // SellSN integration would go here
      console.log(`Purchase clicked for product: ${product.name}`);
    }
  };
  
  return (
    <div 
      className={`product-card flex flex-col ${borderClasses}`}
      style={inlineStyle}
      onClick={handleCardClick}
    >
      {product.thumbnailUrl && !imageError ? (
        <img 
          src={product.thumbnailUrl} 
          alt={`${product.name || 'Product'} thumbnail`} 
          className="product-thumbnail"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="product-thumbnail-placeholder flex">
          <span className="text-xs">Image not found</span>
        </div>
      )}
      
      <div className="product-card-inner">
        <div className="flex justify-between items-center mb-4">
          <span className={`${tagBgClass} ${tagTextClass} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
            {product.tag || 'PRODUCT'}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2 truncate" title={product.name || ''}>
          {product.name || 'Unnamed Product'}
        </h3>
        
        <p className="text-3xl font-bold text-white mb-4">
          ${product.price?.toFixed(2) || 'N/A'}
        </p>
        
        <ul className="text-sm text-gray-400 space-y-1.5 mb-6 flex-grow min-h-[50px]">
          {(product.features || []).slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="break-words">{feature}</span>
            </li>
          ))}
          
          {(product.features?.length || 0) > 3 && (
            <li className="text-xs text-gray-500 mt-1">... and more</li>
          )}
          
          {!(product.features && product.features.length > 0) && (
            <li className="text-gray-500 text-xs italic">No features listed.</li>
          )}
        </ul>
        
        <div className="mt-auto space-y-3 pt-4 border-t border-slate-700/50">
          {product.sellsnSid && product.sellsnPid ? (
            <button 
              className="purchase-button w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePurchaseClick}
              data-sellsn-sid={product.sellsnSid}
              data-sellsn-pid={product.sellsnPid}
            >
              Purchase Now
            </button>
          ) : (
            <button 
              className="purchase-button w-full bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Purchase Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
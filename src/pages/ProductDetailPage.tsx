import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, Info } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  thumbnailUrl?: string;
  features?: string[];
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  sellerName: string;
  sellerAvatarUrl?: string;
  sellerEstablishedDate: string;
}

interface Review {
  _id: string;
  rating: number;
  text?: string;
  reviewerName: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const API_BASE_URL = 'https://api.shillette.com';
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Product not found");
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError(error instanceof Error ? error.message : "Failed to load product details");
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleQuantityIncrease = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      // Calculate difference in months
      const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (diffMonths < 1) return 'less than a month ago';
      if (diffMonths === 1) return '1 month ago';
      return `${diffMonths} months ago`;
    } catch (e) {
      // Fallback if date string is invalid
      return 'a while ago';
    }
  };
  
  if (loading) {
    return (
      <div className="flex-grow container mx-auto px-6 py-10">
        <div className="text-center text-gray-400">Loading product details...</div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="flex-grow container mx-auto px-6 py-10">
        <div className="text-center text-red-400">
          {error || "Product not found"}
        </div>
        <div className="text-center mt-4">
          <Link 
            to="/products" 
            className="text-orange-400 hover:text-orange-300 transition duration-200"
          >
            Return to Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-grow container mx-auto px-6 py-10">
      <div className="flex justify-start mb-8">
        <Link 
          to="/products" 
          className="text-orange-400 hover:text-orange-300 flex items-center space-x-2 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Back to Products</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <img 
            src={product.thumbnailUrl || "https://placehold.co/600x400/374151/9ca3af?text=No+Image"} 
            alt={product.name} 
            className="w-full aspect-video object-cover rounded-lg shadow-lg bg-slate-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/600x400/374151/9ca3af?text=No+Image";
            }}
          />
          
          <h1 className="text-3xl md:text-4xl font-bold text-white">{product.name}</h1>
          
          <p className="text-4xl font-extrabold text-white">${product.price?.toFixed(2) || 'N/A'}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="star-rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`inline-block ${i < Math.round(product.averageRating) ? 'text-yellow-400' : 'text-gray-600'}`} 
                  size={18} 
                  fill={i < Math.round(product.averageRating) ? "currentColor" : "none"} 
                />
              ))}
            </div>
            <span>{product.stock} in stock</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 border-t border-slate-700/50">
            <button className="buy-now-button w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 shadow-md">
              Buy Now
            </button>
            <button className="add-basket-button w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 shadow-md">
              Add to Basket
            </button>
            <div className="flex items-center quantity-selector ml-auto">
              <button 
                onClick={handleQuantityDecrease}
                className="bg-slate-600 hover:bg-slate-500 text-white font-bold w-8 h-8 rounded-md transition duration-200 flex items-center justify-center"
              >
                <Minus size={16} />
              </button>
              <input 
                type="text" 
                value={quantity} 
                readOnly 
                className="w-12 text-center bg-slate-700 border border-slate-600 rounded-md py-1 mx-2 text-white"
              />
              <button 
                onClick={handleQuantityIncrease}
                className="bg-slate-600 hover:bg-slate-500 text-white font-bold w-8 h-8 rounded-md transition duration-200 flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {product.description && (
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-400 text-sm">{product.description}</p>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/70 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Seller Information</h3>
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src={product.sellerAvatarUrl || "https://placehold.co/40x40/7f8c8d/ecf0f1?text=S"} 
                alt="Seller Avatar" 
                className="w-10 h-10 rounded-full bg-slate-600"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/40x40/7f8c8d/ecf0f1?text=S";
                }}
              />
              <div>
                <p className="font-medium text-white">{product.sellerName}</p>
                <p className="text-xs text-gray-400">
                  Established {formatTimeAgo(product.sellerEstablishedDate)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/70 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Need help?</h3>
            <Link 
              to="/tickets" 
              className="text-orange-400 hover:text-orange-300 text-sm flex items-center space-x-1.5"
            >
              <Info size={16} />
              <span>Open a ticket</span>
            </Link>
          </div>
          
          <div className="bg-slate-800/70 backdrop-blur-sm p-5 rounded-lg shadow-lg space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">Not quite sure?</h3>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-white">Instant delivery</p>
                <p className="text-xs text-gray-400">Your product will be delivered within minutes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-white">Integrated tickets with sellers</p>
                <p className="text-xs text-gray-400">You can contact the seller directly if you have any issues</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-white">Good average review score</p>
                <p className="text-xs text-gray-400">
                  The seller has an average review score of {product.averageRating.toFixed(1)} stars out of 5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {product.reviews && product.reviews.length > 0 && (
        <div className="lg:col-span-3 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-left">Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.reviews.map((review) => (
              <div key={review._id} className="bg-slate-700/50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-green-400 font-medium">Verified purchase</span>
                  <div className="star-rating text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`inline-block ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`} 
                        size={14} 
                        fill={i < review.rating ? "currentColor" : "none"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-1">
                  {review.text || 'Automatically left after 3 days of purchase'}
                </p>
                <p className="text-xs text-gray-500">
                  Reviewed by {review.reviewerName} on {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
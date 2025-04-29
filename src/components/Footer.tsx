import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-black mt-auto py-6 border-t border-gray-800">
      <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
        <p>&copy; {currentYear} Shillette. All rights reserved.</p>
      </div>
    </footer>
  );
}
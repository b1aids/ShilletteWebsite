import { useEffect, useRef } from 'react';

export default function SnowBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    container.innerHTML = ''; // Clear existing snowflakes
    
    const numberOfSnowflakes = 75;
    
    for (let i = 0; i < numberOfSnowflakes; i++) {
      const snowflake = document.createElement('div');
      snowflake.classList.add('snowflake');
      
      const size = Math.random() * 3 + 2; // Size between 2px and 5px
      const duration = Math.random() * 10 + 5; // Duration between 5s and 15s
      const delay = Math.random() * 10; // Delay up to 10s
      const startLeft = Math.random() * 100; // Start anywhere horizontally
      const opacity = Math.random() * 0.5 + 0.5; // Opacity between 0.5 and 1.0

      snowflake.style.width = `${size}px`;
      snowflake.style.height = `${size}px`;
      snowflake.style.left = `${startLeft}vw`;
      snowflake.style.opacity = opacity.toString();
      snowflake.style.animationDuration = `${duration}s`;
      snowflake.style.animationDelay = `-${delay}s`; // Negative delay starts animation partway through
      
      container.appendChild(snowflake);
    }
  }, []);
  
  return <div id="snow-container" ref={containerRef}></div>;
}
import React from 'react';
import { Rocket } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center space-x-3">
            <Rocket className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl font-bold">Welcome to Shillette</h1>
          </div>
          <p className="text-xl text-gray-300 text-center max-w-2xl">
            Your application is now running successfully. Start building your amazing project!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
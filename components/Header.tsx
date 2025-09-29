import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-10 border-b border-zinc-800">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <h1 className="text-5xl font-logo text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400 tracking-wider">
          Craft Pricer AI
        </h1>
        <p className="text-zinc-400 mt-2">Price your handcrafted goods with confidence.</p>
      </div>
    </header>
  );
};

export default Header;
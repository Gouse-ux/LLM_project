
import React from 'react';
import { BrainCircuitIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <BrainCircuitIcon className="h-8 w-8 text-indigo-400" />
            <h1 className="ml-3 text-2xl font-bold text-gray-100 tracking-tight">
              Intelligent Document Q&A
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

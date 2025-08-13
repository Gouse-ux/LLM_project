
import React from 'react';
import { QueryResult } from '../types';
import { DocumentTextIcon, LightBulbIcon } from './Icons';

interface ResultDisplayProps {
  result: QueryResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Answer Section */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2" />
          Answer
        </h3>
        <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-200 leading-relaxed">
            {result.answer}
          </p>
        </div>
      </div>

      {/* Source Section */}
      <div>
        <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2" />
          Source from Document
        </h3>
        <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
          <blockquote className="border-l-4 border-teal-500 pl-4 text-gray-400 italic">
            {result.source || "No specific source was cited."}
          </blockquote>
        </div>
      </div>
    </div>
  );
};

// Add fade-in animation to tailwind config if possible, or define here
// This is a simple way to do it without modifying tailwind.config.js
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

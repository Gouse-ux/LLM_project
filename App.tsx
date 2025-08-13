
import React, { useState, useCallback } from 'react';
import { QueryResult } from './types';
import { queryDocument } from './services/geminiService';
import { DocumentInput } from './components/DocumentInput';
import { ResultDisplay } from './components/ResultDisplay';
import { Header } from './components/Header';
import { SparklesIcon, ExclamationTriangleIcon } from './components/Icons';

export default function App(): React.ReactNode {
  const [documentText, setDocumentText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClearDocument = useCallback(() => {
    setDocumentText('');
    setFileName('');
    setResult(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!documentText.trim()) {
      setError('Please upload a document first.');
      return;
    }
    if (!query.trim()) {
      setError('Please provide a question.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResult = await queryDocument(documentText, query);
      setResult(apiResult);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [documentText, query]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Input */}
          <div className="flex flex-col space-y-6">
            <DocumentInput
              fileName={fileName}
              setDocumentText={setDocumentText}
              setFileName={setFileName}
              onClearDocument={handleClearDocument}
              query={query}
              setQuery={setQuery}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Output */}
          <div className="mt-8 lg:mt-0 bg-gray-800/50 rounded-xl border border-gray-700 h-[calc(100vh-12rem)] flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-200 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-indigo-400" />
                Intelligent Answer
              </h2>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-2">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                     <p className="text-gray-400">Analyzing document...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-full">
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center">
                        <ExclamationTriangleIcon className="w-6 h-6 mr-3"/>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
              )}
              {!isLoading && !error && result && (
                <ResultDisplay result={result} />
              )}
              {!isLoading && !error && !result && (
                 <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                        <p className="text-lg">Your answer will appear here.</p>
                        <p className="text-sm">Upload a document and ask a question to get started.</p>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, UploadCloudIcon, DocumentTextIcon, XCircleIcon } from './Icons';
import * as pdfjsLib from 'pdfjs-dist';

// Set the workerSrc for pdfjs-dist. This is required for it to work in a browser environment.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

interface DocumentInputProps {
  fileName: string;
  setFileName: (name: string) => void;
  setDocumentText: (text: string) => void;
  onClearDocument: () => void;
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
  fileName,
  setFileName,
  setDocumentText,
  onClearDocument,
  query,
  setQuery,
  onSubmit,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;

    // Clear previous state and begin parsing
    setParseError(null);
    onClearDocument();
    setIsParsingFile(true);

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text);
        setFileName(file.name);
        setIsParsingFile(false);
      };
      reader.onerror = () => {
        setParseError('Failed to read the .txt file.');
        setIsParsingFile(false);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
              
              const pagePromises = Array.from({ length: pdf.numPages }, (_, i) => 
                pdf.getPage(i + 1).then(page => page.getTextContent())
              );
              
              const pageContents = await Promise.all(pagePromises);

              const fullText = pageContents.map(content => {
                  return content.items.map(item => ('str' in item ? item.str : '')).join(' ');
              }).join('\n\n');
              
              setDocumentText(fullText.trim());
              setFileName(file.name);
          } catch (error) {
              console.error('Error parsing PDF:', error);
              setParseError('Failed to parse the PDF. It might be corrupted or protected.');
              setFileName('');
              setDocumentText('');
          } finally {
              setIsParsingFile(false);
          }
      };
      reader.onerror = () => {
          setParseError('Failed to read the PDF file.');
          setIsParsingFile(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setParseError('Unsupported file type. Please upload a .txt or .pdf file.');
      setIsParsingFile(false);
    }
  }, [setDocumentText, setFileName, onClearDocument]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
    // Reset file input to allow uploading the same file again
    e.target.value = '';
  };

  const openFilePicker = () => {
    if (!isLoading && !isParsingFile) {
        fileInputRef.current?.click();
    }
  };
  
  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onSubmit();
    }
  };

  const isBusy = isLoading || isParsingFile;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 space-y-4 flex flex-col h-full">
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
            1. Upload Document
            </label>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept=".txt,.pdf"
                disabled={isBusy}
            />

            {!fileName && !isParsingFile && (
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={openFilePicker}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openFilePicker()}
                    className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors duration-200 
                        ${isBusy ? 'cursor-not-allowed bg-gray-700/20' : 'cursor-pointer'}
                        ${isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'}`}
                >
                    <UploadCloudIcon className="w-12 h-12 text-gray-400 mb-3"/>
                    <p className="text-gray-300 font-semibold">Drag & drop a file here</p>
                    <p className="text-sm text-gray-500">or click to select (.txt or .pdf)</p>
                </div>
            )}
            
            {(isParsingFile) && (
                 <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg border-indigo-500 bg-gray-700/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                    <p className="text-gray-300 font-semibold mt-4">Parsing document...</p>
                 </div>
            )}

            {fileName && !isParsingFile && (
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <DocumentTextIcon className="w-6 h-6 text-indigo-400 flex-shrink-0"/>
                        <span className="text-sm text-gray-200 ml-3 truncate" title={fileName}>{fileName}</span>
                    </div>
                    <button onClick={() => { onClearDocument(); setParseError(null); }} disabled={isBusy} className="text-gray-500 hover:text-white transition-colors duration-200 disabled:opacity-50" aria-label="Clear document">
                        <XCircleIcon className="w-6 h-6"/>
                    </button>
                </div>
            )}

            {parseError && (
              <div className="mt-2 text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg p-3">
                  {parseError}
              </div>
            )}
        </div>

        <div className="flex-grow"></div>

        <div className="relative">
            <label htmlFor="query-text" className="block text-sm font-medium text-gray-300 mb-2">
            2. Ask a Question
            </label>
            <input
                id="query-text"
                type="text"
                className="w-full bg-gray-900 border border-gray-600 rounded-full py-3 pl-4 pr-16 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 disabled:bg-gray-800 disabled:cursor-not-allowed"
                placeholder="e.g., What is the main topic?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleQueryKeyDown}
                disabled={isBusy || !fileName}
            />
            <button
                onClick={onSubmit}
                disabled={isBusy || !fileName || !query}
                className="absolute right-2 top-1/2 -translate-y-1/2 mt-3.5 flex items-center justify-center h-9 w-9 bg-indigo-600 text-white rounded-full transition-all duration-200 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                aria-label="Submit query"
            >
                {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
                )}
            </button>
        </div>
    </div>
  );
};
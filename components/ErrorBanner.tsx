import React from 'react';
import { AlertCircleIcon } from './icons';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
      <div className="flex">
        <div className="py-1">
          <AlertCircleIcon className="h-6 w-6 text-red-500 mr-3" />
        </div>
        <div className="flex-grow">
          <p className="font-bold">Ocorreu um erro</p>
          <p className="text-sm">{message}</p>
        </div>
        <div className="ml-4">
          <button onClick={onClose} className="text-red-600 hover:text-red-800" aria-label="Close">
             <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;


import React, { useEffect } from 'react';
import { CheckIcon } from './icons';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center animate-fade-in-down">
      <div className="flex-shrink-0">
        <div className="bg-green-100 p-2 rounded-full">
            <CheckIcon className="h-5 w-5 text-green-600" />
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button onClick={onClose} className="inline-flex text-gray-400 hover:text-gray-500">
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;

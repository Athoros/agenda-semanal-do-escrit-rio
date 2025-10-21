import React from 'react';
import { User } from '../types';
import { XIcon } from './icons';

interface AvatarProps {
  user: User;
  onRemove?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ user, onRemove }) => {
  const getInitials = (name: string): string => {
    if (!name) return '?';
    if (name.length < 2) return name.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`relative group w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white ${user.avatarColor} z-10 hover:z-20 transition-transform hover:scale-110`}
      title={user.name}
    >
      {getInitials(user.name)}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
          aria-label={`Remover ${user.name}`}
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default Avatar;

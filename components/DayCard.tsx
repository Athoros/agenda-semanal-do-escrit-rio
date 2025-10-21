import React from 'react';
import { User } from '../types';
import { CalendarIcon, XIcon, SpinnerIcon, CheckIcon } from './icons';
import Avatar from './Avatar';

interface DayCardProps {
  day: string;
  scheduledUsers: User[];
  isSelected: boolean;
  onToggle: (day: string) => void;
  onRemoveUser: (userId: number) => void;
  status: 'idle' | 'saving' | 'success' | 'error';
}

const DayCard: React.FC<DayCardProps> = ({ day, scheduledUsers, isSelected, onToggle, onRemoveUser, status }) => {
  const maxAvatars = 4;
  const isInteractive = status === 'idle';

  const getStatusStyles = () => {
    if (status === 'success') return 'border-green-500';
    if (status === 'error') return 'border-red-500';
    if (isSelected) return 'bg-green-100 border-green-300';
    return 'bg-white border-gray-200';
  };
  
  const cardClasses = `
    rounded-xl border-2 bg-card text-card-foreground shadow relative transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col
    ${getStatusStyles()}
  `;

  const handleClick = () => {
    if (!isInteractive) return;
    onToggle(day);
  };
  
  const renderStatusIndicator = () => {
    switch (status) {
      case 'saving':
        return <SpinnerIcon className="w-5 h-5 text-indigo-500" />;
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XIcon className="w-5 h-5 text-red-600" />;
      case 'idle':
      default:
        return null;
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick} style={{ cursor: !isInteractive ? 'not-allowed' : 'pointer' }} id={`${day.toLowerCase().replace('-feira', '')}-card`}>
      <div className="flex-grow">
        <div className="absolute top-3 right-3 h-5 w-5 flex items-center justify-center">
          {renderStatusIndicator()}
        </div>
        <div className="flex flex-col space-y-1.5 p-6 pb-3">
          <h3 className="tracking-tight text-lg text-center font-semibold text-gray-800">{day}</h3>
          <div className="text-sm text-muted-foreground text-center">
            <CalendarIcon className="w-4 h-4 mx-auto text-gray-400" />
          </div>
        </div>
        <div className="p-6 pt-0 min-h-[100px] flex flex-col justify-center items-center">
          {scheduledUsers.length > 0 ? (
            <div className="flex -space-x-2">
              {scheduledUsers.slice(0, maxAvatars).map(user => (
                <Avatar 
                  key={user.id} 
                  user={user} 
                  onRemove={isInteractive ? () => onRemoveUser(user.id) : undefined}
                />
              ))}
              {scheduledUsers.length > maxAvatars && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-gray-700 font-bold text-xs border-2 border-white">
                  +{scheduledUsers.length - maxAvatars}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">Nenhum agendamento</p>
          )}
          <p className="text-xs text-gray-400 text-center mt-2">{scheduledUsers.length} pessoa(s)</p>
        </div>
      </div>
    </div>
  );
};

export default DayCard;
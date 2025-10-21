import React from 'react';
import { User } from '../types';
import { CalendarIcon, XIcon, SpinnerIcon, CheckIcon } from './icons';

interface DayCardProps {
  day: string;
  scheduledUsers: User[];
  isSelected: boolean;
  onToggle: (day: string) => void;
  onRemoveUser: (userId: number) => void;
  status: 'idle' | 'saving' | 'success' | 'error';
}

const DayCard: React.FC<DayCardProps> = ({ day, scheduledUsers, isSelected, onToggle, onRemoveUser, status }) => {
  const isInteractive = status === 'idle';

  const getStatusStyles = () => {
    if (status === 'success') return 'border-cyan-500';
    if (status === 'error') return 'border-red-500';
    if (isSelected) return 'border-cyan-500';
    return 'border-gray-700';
  };
  
  const cardClasses = `
    rounded-xl border-2 bg-[#2C2F33] text-gray-300 shadow-lg relative transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col
    ${getStatusStyles()}
  `;

  const handleClick = () => {
    if (!isInteractive) return;
    onToggle(day);
  };
  
  const renderStatusIndicator = () => {
    switch (status) {
      case 'saving':
        return <SpinnerIcon className="w-5 h-5 text-cyan-500" />;
      case 'success':
        return <CheckIcon className="w-5 h-5 text-cyan-500" />;
      case 'error':
        return <XIcon className="w-5 h-5 text-red-500" />;
      case 'idle':
      default:
        return null;
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick} style={{ cursor: !isInteractive ? 'not-allowed' : 'pointer' }} id={`${day.toLowerCase().replace('-feira', '')}-card`}>
      <div className="flex-grow flex flex-col">
        <div className="absolute top-3 right-3 h-5 w-5 flex items-center justify-center">
          {renderStatusIndicator()}
        </div>
        <div className="flex flex-col space-y-1.5 p-6 pb-3">
          <h3 className="tracking-tight text-lg text-center font-semibold text-gray-200">{day}</h3>
          <div className="text-sm text-muted-foreground text-center">
            <CalendarIcon className="w-4 h-4 mx-auto text-gray-500" />
          </div>
        </div>
        <div className="p-6 pt-0 flex-grow flex items-center">
          {scheduledUsers.length > 0 ? (
            <div className="flex flex-wrap justify-center items-center gap-2 w-full">
              {scheduledUsers.map(user => (
                <div 
                  key={user.id} 
                  className="group relative basis-[45%] grow-0 text-center bg-gray-700 text-gray-200 text-xs font-semibold px-2 py-1.5 rounded-full truncate"
                >
                  {user.name}
                  {isInteractive && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveUser(user.id);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none cursor-pointer"
                        aria-label={`Remover ${user.name}`}
                    >
                        <XIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full">
                <p className="text-sm text-gray-500 text-center">Nenhum agendamento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayCard;
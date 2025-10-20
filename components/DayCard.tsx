import React from 'react';
import { User } from '../types';
import { CalendarIcon, XIcon, SpinnerIcon } from './icons';

interface DayCardProps {
  day: string;
  scheduledUsers: User[];
  currentUser: User;
  isSelected: boolean;
  onToggle: (day: string) => void;
  onCancelPresence: (day: string, userId: number) => void;
  isSaving: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ day, scheduledUsers, currentUser, isSelected, onToggle, onCancelPresence, isSaving }) => {
  const cardClasses = `
    rounded-xl border bg-card text-card-foreground shadow relative transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col
    ${isSelected ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}
  `;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSaving) return;
    const target = e.target as Element & { type?: string };
    if (target.type !== 'checkbox' && !target.closest('button')) {
        onToggle(day);
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick} style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }} id={`${day.toLowerCase().replace('-feira', '')}-card`}>
      <div className="flex-grow">
        <div className="absolute top-3 right-3 h-5 w-5 flex items-center justify-center">
            {isSaving ? (
                <SpinnerIcon className="w-5 h-5 text-indigo-500" />
            ) : (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(day)}
                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                    disabled={isSaving}
                />
            )}
        </div>
        <div className="flex flex-col space-y-1.5 p-6 pb-3 pr-12">
          <h3 className="tracking-tight text-lg text-center font-semibold text-gray-800">{day}</h3>
          <div className="text-sm text-muted-foreground text-center">
            <CalendarIcon className="w-4 h-4 mx-auto text-gray-400" />
          </div>
        </div>
        <div className="p-6 pt-0 min-h-[100px]">
          <div className="space-y-2">
            {scheduledUsers.length > 0 ? (
              scheduledUsers.map(user => (
                <div
                  key={user.id}
                  className={`w-full flex items-center justify-between text-xs font-semibold px-2.5 py-1 rounded-md
                    ${user.id === currentUser.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800'}`
                  }
                >
                  <span>{user.name} {user.id === currentUser.id && '(Você)'}</span>
                   <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          onCancelPresence(day, user.id);
                      }}
                      className="p-1 -mr-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-red-500"
                      aria-label={`Remover ${user.name} de ${day}`}
                    >
                      <XIcon className="w-3 h-3"/>
                    </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">Nenhum agendamento</p>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">{scheduledUsers.length} pessoa(s)</p>
        </div>
      </div>
    </div>
  );
};

export default DayCard;

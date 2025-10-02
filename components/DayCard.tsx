import React from 'react';
import { User } from '../types';
import { CalendarIcon } from './icons';

interface DayCardProps {
  day: string;
  scheduledUsers: User[];
  currentUser: User;
  isSelected: boolean;
  onToggle: (day: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, scheduledUsers, currentUser, isSelected, onToggle }) => {
  const cardClasses = `
    rounded-xl border bg-card text-card-foreground shadow relative transition-all duration-300 ease-in-out transform hover:-translate-y-1
    ${isSelected ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}
  `;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // FIX: Property 'type' does not exist on type 'HTMLElement'. Cast to a more generic Element and inform TypeScript about the optional 'type' property.
    const target = e.target as Element & { type?: string };
    if (target.type !== 'checkbox') {
        onToggle(day);
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="absolute top-3 right-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(day)}
          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
        />
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
                className={`w-full justify-center text-xs font-semibold px-2.5 py-1 rounded-md text-center
                  ${user.id === currentUser.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-800'}`
                }
              >
                {user.name} {user.id === currentUser.id && '(Você)'}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">Nenhum agendamento</p>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">{scheduledUsers.length} pessoa(s)</p>
      </div>
    </div>
  );
};

export default DayCard;

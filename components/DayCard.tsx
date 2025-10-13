
import React from 'react';
import { User, WeatherData } from '../types';
import { 
    CalendarIcon, 
    ThermometerIcon, 
    DropletsIcon, 
    SunIcon, 
    CloudSunIcon, 
    CloudIcon, 
    CloudRainIcon, 
    CloudLightningIcon,
    SpinnerIcon
} from './icons';

interface DayCardProps {
  day: string;
  scheduledUsers: User[];
  currentUser: User;
  isSelected: boolean;
  onToggle: (day: string) => void;
  weather?: WeatherData;
  weatherLoaded: boolean;
}

const WeatherIcon: React.FC<{ iconCode: string }> = ({ iconCode }) => {
    const iconClass = "w-8 h-8 mx-auto text-blue-400 mb-1";
    switch (iconCode.slice(0, 2)) {
        case '01': return <SunIcon className={iconClass} />;
        case '02': return <CloudSunIcon className={iconClass} />;
        case '03':
        case '04': return <CloudIcon className={iconClass} />;
        case '09':
        case '10': return <CloudRainIcon className={iconClass} />;
        case '11': return <CloudLightningIcon className={iconClass} />;
        default: return <CloudIcon className={iconClass} />;
    }
};

const DayCard: React.FC<DayCardProps> = ({ day, scheduledUsers, currentUser, isSelected, onToggle, weather, weatherLoaded }) => {
  const cardClasses = `
    rounded-xl border bg-card text-card-foreground shadow relative transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col
    ${isSelected ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}
  `;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element & { type?: string };
    if (target.type !== 'checkbox') {
        onToggle(day);
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick} style={{ cursor: 'pointer' }} id={`${day.toLowerCase().replace('-feira', '')}-card`}>
      <div className="flex-grow">
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
      
      <div className="border-t border-gray-200 mt-auto">
      {
          !weatherLoaded ? (
              <div className="p-4 h-[122px] flex items-center justify-center">
                  <SpinnerIcon className="w-6 h-6 text-gray-400" />
              </div>
          ) : weather ? (
              <div className="p-4 h-[122px] text-center flex flex-col justify-center">
                  <WeatherIcon iconCode={weather.icon} />
                  <p className="text-sm font-medium text-gray-700 capitalize -mt-1">{weather.description}</p>
                  <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                          <ThermometerIcon className="w-4 h-4 mr-1" />
                          <span>{Math.round(weather.temp)}°C</span>
                      </div>
                      <div className="flex items-center">
                          <DropletsIcon className="w-4 h-4 mr-1" />
                          <span>{Math.round(weather.pop * 100)}%</span>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="p-4 h-[122px] flex items-center justify-center text-center text-xs text-gray-400">
                  Previsão do tempo indisponível
              </div>
          )
      }
      </div>
    </div>
  );
};

export default DayCard;


import React, { useState, useEffect, useCallback } from 'react';
import { User, Schedule } from './types';
import { USERS, DAYS_OF_WEEK, INITIAL_SCHEDULE } from './constants';
import DayCard from './components/DayCard';
import Toast from './components/Toast';
import { CalendarIcon, UsersIcon, ClockIcon, SpinnerIcon } from './components/icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [selectedDays, setSelectedDays] = useState<{ [day: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    // Simulate initial data fetching
    setTimeout(() => {
      setSchedule(INITIAL_SCHEDULE);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateUserSelection = useCallback((user: User, currentSchedule: Schedule) => {
    const userSelections: { [day: string]: boolean } = {};
    DAYS_OF_WEEK.forEach(day => {
      userSelections[day] = currentSchedule[day]?.includes(user.id) || false;
    });
    setSelectedDays(userSelections);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      updateUserSelection(currentUser, schedule);
    }
  }, [currentUser, schedule, isLoading, updateUserSelection]);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = USERS.find(u => u.name === event.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      const newSchedule = { ...schedule };
      DAYS_OF_WEEK.forEach(day => {
        const isSelected = selectedDays[day];
        const scheduledUsers = newSchedule[day] ? [...newSchedule[day]] : [];
        const userIndex = scheduledUsers.indexOf(currentUser.id);

        if (isSelected && userIndex === -1) {
          scheduledUsers.push(currentUser.id);
        } else if (!isSelected && userIndex > -1) {
          scheduledUsers.splice(userIndex, 1);
        }
        newSchedule[day] = scheduledUsers;
      });
      setSchedule(newSchedule);
      setIsSaving(false);
      setToastMessage('Agendamentos salvos com sucesso!');
    }, 1500);
  };
  
  const handleResetSchedule = () => {
    setIsSaving(true);
     setTimeout(() => {
        const resetSchedule: Schedule = {};
        DAYS_OF_WEEK.forEach(day => {
            resetSchedule[day] = [];
        });
        setSchedule(resetSchedule);
        updateUserSelection(currentUser, resetSchedule);
        setIsSaving(false);
        setToastMessage('Agenda da semana resetada!');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <SpinnerIcon className="w-12 h-12 text-indigo-600 mx-auto" />
          <p className="text-lg text-gray-600 mt-4">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">📅</span>
            Agenda Semanal do Escritório
          </h1>
          <p className="text-lg text-gray-600">Planeje sua presença no escritório para a semana</p>
        </header>

        <div className="max-w-xs mx-auto mb-4 relative">
          <select
            value={currentUser.name}
            onChange={handleUserChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
          >
            {USERS.map(user => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        
        <div className="text-center mb-10">
            <div className="inline-flex items-center bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-full shadow-sm">
                <UsersIcon className="w-4 h-4 mr-2" />
                <span>Logado como: <strong>{currentUser.name}</strong></span>
            </div>
        </div>


        <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {DAYS_OF_WEEK.map(day => {
            const scheduledUserIds = schedule[day] || [];
            const scheduledUsers = USERS.filter(user => scheduledUserIds.includes(user.id));
            return (
              <DayCard
                key={day}
                day={day}
                scheduledUsers={scheduledUsers}
                currentUser={currentUser}
                isSelected={selectedDays[day] || false}
                onToggle={handleToggleDay}
              />
            );
          })}
        </main>
        
        <footer className="text-center space-y-8">
          <div>
            <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-lg"
            >
                {isSaving ? (
                    <>
                        <SpinnerIcon className="w-5 h-5 mr-2" />
                        Salvando...
                    </>
                ) : (
                    <>
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Salvar minhas escolhas
                    </>
                )}
            </button>
            <p className="text-sm text-gray-500 mt-2">Marque os dias que você estará no escritório e clique em salvar</p>
          </div>
          <div>
             <button
                onClick={handleResetSchedule}
                disabled={isSaving}
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
                 {isSaving ? (
                    <>
                        <SpinnerIcon className="w-4 h-4 mr-2" />
                        Resetando...
                    </>
                 ) : (
                    <>
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Resetar Agenda Semanal
                    </>
                 )}
            </button>
            <p className="text-xs text-gray-500 mt-2">* Esta ação remove todos os agendamentos da semana</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;

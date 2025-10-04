import React, { useState, useEffect, useCallback } from 'react';
import { User, Schedule } from './types';
import { USERS, DAYS_OF_WEEK } from './constants';
import DayCard from './components/DayCard';
import Toast from './components/Toast';
import ErrorBanner from './components/ErrorBanner';
import { CalendarIcon, UsersIcon, ClockIcon, SpinnerIcon } from './components/icons';

// A free, no-auth JSON storage service (jsonblob.com) is used as a simple backend.
// This ID points to a specific JSON file that will store our shared schedule.
const JSONBLOB_API_URL = 'https://jsonblob.com/api/jsonBlob/1266530182098640896';

const getEmptySchedule = (): Schedule => {
    const emptySchedule: Schedule = {};
    DAYS_OF_WEEK.forEach(day => {
        emptySchedule[day] = [];
    });
    return emptySchedule;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [selectedDays, setSelectedDays] = useState<{ [day: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await fetch(JSONBLOB_API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Use functional update to compare with the latest state
      setSchedule(currentSchedule => {
        if (JSON.stringify(currentSchedule) !== JSON.stringify(data)) {
          return data;
        }
        return currentSchedule;
      });

    } catch (err) {
      console.error("Failed to fetch schedule:", err);
      setError("Não foi possível carregar a agenda. Verifique sua conexão e tente recarregar a página.");
    } finally {
        // Only set loading to false on the initial fetch
        if(isLoading) setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    fetchSchedule(); // Initial fetch
    const intervalId = setInterval(fetchSchedule, 5000); // Poll for updates every 5 seconds
    
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchSchedule]);


  const updateUserSelection = useCallback((user: User, currentSchedule: Schedule) => {
    const userSelections: { [day: string]: boolean } = {};
    DAYS_OF_WEEK.forEach(day => {
      userSelections[day] = currentSchedule[day]?.includes(user.id) || false;
    });
    setSelectedDays(userSelections);
  }, []);

  useEffect(() => {
    if (schedule) {
      updateUserSelection(currentUser, schedule);
    }
  }, [currentUser, schedule, updateUserSelection]);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = USERS.find(u => u.name === event.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError('');
    
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
        newSchedule[day] = scheduledUsers.sort((a,b) => a - b);
    });
    
    try {
        const response = await fetch(JSONBLOB_API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(newSchedule),
        });
        if (!response.ok) throw new Error('Failed to save schedule');
        
        const updatedSchedule = await response.json();
        setSchedule(updatedSchedule);
        setToastMessage('Agendamentos salvos com sucesso!');
    } catch (err) {
        console.error("Failed to save changes:", err);
        setError("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleResetSchedule = async () => {
    setIsResetting(true);
    setError('');
    
    const emptySchedule = getEmptySchedule();

    try {
        const response = await fetch(JSONBLOB_API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(emptySchedule),
        });
        if (!response.ok) throw new Error('Failed to reset schedule');
        
        const updatedSchedule = await response.json();
        setSchedule(updatedSchedule);
        setToastMessage('Agenda da semana resetada!');
    } catch (err) {
        console.error("Failed to reset schedule:", err);
        setError("Não foi possível resetar a agenda. Tente novamente.");
    } finally {
        setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <SpinnerIcon className="w-12 h-12 text-indigo-600 mx-auto" />
          <p className="text-lg text-gray-600 mt-4">Carregando agenda compartilhada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <div className="container mx-auto px-4 py-8">
        {error && <ErrorBanner message={error} onClose={() => setError('')} />}
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
                disabled={isSaving || isResetting}
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
                disabled={isSaving || isResetting}
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
                 {isResetting ? (
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

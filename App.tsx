import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Schedule } from './types';
import { USERS, DAYS_OF_WEEK } from './constants';
import DayCard from './components/DayCard';
import Toast from './components/Toast';
import ErrorBanner from './components/ErrorBanner';
import { CalendarIcon, UsersIcon, ClockIcon, SpinnerIcon } from './components/icons';

// Switched to a more reliable, free JSON storage service (myjson.is) and implemented a robust retry mechanism.
const API_URL = 'https://api.myjson.is/v1/bins/1g8slav';

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
  const initialLoad = useRef(true);

  const fetchSchedule = useCallback(async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            // Cache-busting: add a unique timestamp to the URL to bypass aggressive browser cache.
            const url = new URL(API_URL);
            url.searchParams.append('t', new Date().getTime().toString());

            const response = await fetch(url.toString(), { cache: 'no-store' });
            if (!response.ok) {
                // If the bin is new or empty, the API returns 404. Handle this gracefully.
                if (response.status === 404) {
                    console.warn('Schedule not found (404), initializing a new one in local state.');
                    const emptySchedule = getEmptySchedule();
                    setSchedule(emptySchedule);
                    setError(''); // Clear any previous loading errors
                    return; // Exit successfully
                }
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSchedule(data);
            setError(''); // Clear previous errors on successful fetch
            return; // Exit loop on success
        } catch (err) {
            console.error(`Failed to fetch schedule (attempt ${attempt}):`, err);
            if (attempt === 3) {
                setError("Não foi possível carregar a agenda. Verifique sua conexão e tente recarregar a página.");
            }
            // Wait with exponential backoff before retrying
            await new Promise(res => setTimeout(res, 1000 * attempt));
        }
    }
  }, []);

  useEffect(() => {
    const performFetch = async () => {
        await fetchSchedule();
        if (initialLoad.current) {
            setIsLoading(false);
            initialLoad.current = false;
        }
    };

    performFetch();
    const intervalId = setInterval(performFetch, 15000); // Poll for updates every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchSchedule]);


  const updateUserSelection = useCallback((user: User, currentSchedule: Schedule) => {
    const userSelections: { [day: string]: boolean } = {};
    DAYS_OF_WEEK.forEach(day => {
      userSelections[day] = currentSchedule[day]?.includes(user.id) || false;
    });
    setSelectedDays(userSelections);
  }, []);

  useEffect(() => {
    if (schedule && Object.keys(schedule).length > 0) {
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

  // Reusable save function with retry logic
  const saveDataWithRetry = async (dataToSave: Schedule): Promise<Schedule> => {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${errorText}`);
            }
            return await response.json(); // Success
        } catch (err) {
            console.error(`Save operation failed (attempt ${attempt}):`, err);
            if (attempt === 3) {
                throw err; // Re-throw the error after the last attempt
            }
            await new Promise(res => setTimeout(res, 1000 * attempt));
        }
    }
    throw new Error("Save operation failed after all retries.");
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
        const updatedSchedule = await saveDataWithRetry(newSchedule);
        setSchedule(updatedSchedule);
        setToastMessage('Agendamentos salvos com sucesso!');
    } catch (err) {
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
        const updatedSchedule = await saveDataWithRetry(emptySchedule);
        setSchedule(updatedSchedule);
        setToastMessage('Agenda da semana resetada!');
    } catch (err) {
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
import React, { useState, useEffect, useCallback } from 'react';
import { User, Schedule } from './types';
import { USERS, DAYS_OF_WEEK, API_URL } from './constants';
import DayCard from './components/DayCard';
import Toast from './components/Toast';
import ErrorBanner from './components/ErrorBanner';
import HistoryView from './components/HistoryView';
import { BookOpenIcon, HistoryIcon, SpinnerIcon } from './components/icons';

const getEmptySchedule = (): Schedule => {
    const emptySchedule: Schedule = {};
    DAYS_OF_WEEK.forEach(day => {
        emptySchedule[day] = [];
    });
    return emptySchedule;
};

type DayStatus = 'idle' | 'saving' | 'success' | 'error';

const App: React.FC = () => {
  const [view, setView] = useState<'agenda' | 'history'>('agenda');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [selectedDays, setSelectedDays] = useState<{ [day: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dayStatuses, setDayStatuses] = useState<{ [day: string]: DayStatus }>({});
  const [toastMessage, setToastMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initialStatuses: { [day: string]: DayStatus } = {};
    DAYS_OF_WEEK.forEach(day => {
      initialStatuses[day] = 'idle';
    });
    setDayStatuses(initialStatuses);
  }, []);

  const saveDataWithRetry = async (dataToSave: any, url: string = API_URL): Promise<any> => {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
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

  const fetchSchedule = useCallback(async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const url = new URL(API_URL);
            url.searchParams.append('t', new Date().getTime().toString());

            const response = await fetch(url.toString(), { cache: 'no-store' });
            let data: Schedule;
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('Schedule not found (404), initializing a new one.');
                    data = getEmptySchedule();
                } else {
                    throw new Error('Network response was not ok');
                }
            } else {
                data = await response.json();
            }
            
            setSchedule(data);
            setError('');
            return;
        } catch (err) {
            console.error(`Failed to fetch schedule (attempt ${attempt}):`, err);
            if (attempt === 3) {
                setError("Não foi possível carregar a agenda. Verifique sua conexão e tente recarregar a página.");
            }
            await new Promise(res => setTimeout(res, 1000 * attempt));
        }
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchSchedule().finally(() => {
        setIsLoading(false);
    });
    
    const intervalId = setInterval(fetchSchedule, 15000); 
    
    return () => clearInterval(intervalId);
  }, [fetchSchedule]);


  const updateUserSelection = useCallback((user: User | null, currentSchedule: Schedule) => {
    const userSelections: { [day: string]: boolean } = {};
    if (!currentSchedule) return;
    DAYS_OF_WEEK.forEach(day => {
      userSelections[day] = user ? currentSchedule[day]?.includes(user.id) || false : false;
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
    setCurrentUser(selectedUser || null);
    if (selectedUser?.name === 'Jeremias') {
      const audio = new Audio('https://www.myinstants.com/media/sounds/humm_-boiola-panico-na-tv.mp3');
      audio.play();
    }
  };

  const handleToggleDay = async (day: string) => {
    if (!currentUser) {
        setError("Por favor, selecione uma pessoa para fazer um agendamento.");
        return;
    }
    if (dayStatuses[day] && dayStatuses[day] !== 'idle') return;

    setDayStatuses(prev => ({ ...prev, [day]: 'saving' }));
    setError('');

    const isNowSelected = !selectedDays[day];
    
    if (currentUser.name === 'Jeremias' && isNowSelected) {
      const audio = new Audio('https://www.myinstants.com/media/sounds/ah-ze-da-manga_dgSl2iS.mp3');
      audio.play();
    }

    setSelectedDays(prev => ({ ...prev, [day]: isNowSelected }));

    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const scheduledUsers = newSchedule[day] ? [...newSchedule[day]] : [];
    const userIndex = scheduledUsers.indexOf(currentUser.id);

    if (isNowSelected && userIndex === -1) {
        scheduledUsers.push(currentUser.id);
    } else if (!isNowSelected && userIndex > -1) {
        scheduledUsers.splice(userIndex, 1);
    }
    newSchedule[day] = scheduledUsers.sort((a,b) => a - b);
    
    try {
        const updatedSchedule = await saveDataWithRetry(newSchedule);
        setSchedule(updatedSchedule);
        setDayStatuses(prev => ({ ...prev, [day]: 'success' }));
    } catch (err) {
        setError("Não foi possível salvar a alteração. Sua seleção foi desfeita.");
        setSelectedDays(prev => ({ ...prev, [day]: !isNowSelected }));
        setDayStatuses(prev => ({ ...prev, [day]: 'error' }));
    } finally {
        setTimeout(() => {
            setDayStatuses(prev => ({ ...prev, [day]: 'idle' }));
        }, 1500);
    }
  };

  const handleRemoveUser = async (day: string, userIdToRemove: number) => {
    if (!currentUser) {
        setError("Por favor, selecione uma pessoa para interagir com a agenda.");
        return;
    }
    if (dayStatuses[day] && dayStatuses[day] !== 'idle') return;

    setDayStatuses(prev => ({ ...prev, [day]: 'saving' }));
    setError('');

    const originalSchedule = JSON.parse(JSON.stringify(schedule));
    const wasCurrentUserSelected = selectedDays[day];
    
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const userIndex = newSchedule[day]?.indexOf(userIdToRemove);

    if (userIndex > -1) {
        newSchedule[day].splice(userIndex, 1);
        setSchedule(newSchedule); // Optimistic update
        if (currentUser.id === userIdToRemove) {
            setSelectedDays(prev => ({ ...prev, [day]: false }));
        }
    } else {
        setDayStatuses(prev => ({ ...prev, [day]: 'idle' }));
        return;
    }
    
    try {
        const updatedSchedule = await saveDataWithRetry(newSchedule);
        setSchedule(updatedSchedule);
        setDayStatuses(prev => ({ ...prev, [day]: 'success' }));
    } catch (err) {
        setError("Não foi possível remover o usuário. A alteração foi desfeita.");
        setSchedule(originalSchedule); // Rollback
        if (currentUser.id === userIdToRemove) {
            setSelectedDays(prev => ({ ...prev, [day]: wasCurrentUserSelected }));
        }
        setDayStatuses(prev => ({ ...prev, [day]: 'error' }));
    } finally {
        setTimeout(() => {
            setDayStatuses(prev => ({ ...prev, [day]: 'idle' }));
        }, 1500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E2024] flex items-center justify-center">
        <div className="text-center">
          <SpinnerIcon className="w-12 h-12 text-cyan-500 mx-auto" />
          <p className="text-lg text-gray-400 mt-4">Carregando agenda compartilhada...</p>
        </div>
      </div>
    );
  }

  const renderAgenda = () => (
    <>
        <div className="max-w-xs mx-auto mb-10 relative">
          <select
            value={currentUser?.name || ""}
            onChange={handleUserChange}
            className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none bg-[#2C2F33] text-gray-200"
          >
            <option value="" disabled>Selecione uma pessoa...</option>
            {USERS.map(user => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
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
                isSelected={selectedDays[day] || false}
                onToggle={handleToggleDay}
                onRemoveUser={(userId: number) => handleRemoveUser(day, userId)}
                status={dayStatuses[day] || 'idle'}
              />
            );
          })}
        </main>
    </>
  );

  return (
    <div className="min-h-screen bg-[#1E2024] font-sans text-gray-300">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between pb-6 mb-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
              <img 
                src="https://api-zendesk-arcanjos.replit.app/assets/LOGOARC_1749750824381-DFtw5VI2.png" 
                alt="Logo" 
                className="h-10 object-contain"
              />
              <h1 className="text-2xl font-semibold text-gray-200 hidden sm:block">
                  Agenda Semanal Arcanjos
              </h1>
          </div>
          <nav>
            <div className="flex border border-gray-700 rounded-lg p-1 bg-[#2C2F33] shadow-sm">
              <button
                onClick={() => setView('agenda')}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  view === 'agenda' ? 'bg-cyan-500 text-white shadow' : 'text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <BookOpenIcon className="w-5 h-5" />
                Agenda
              </button>
              <button
                onClick={() => setView('history')}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  view === 'history' ? 'bg-cyan-500 text-white shadow' : 'text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <HistoryIcon className="w-5 h-5" />
                Histórico
              </button>
            </div>
          </nav>
        </header>

        {error && <ErrorBanner message={error} onClose={() => setError('')} />}
        
        {view === 'agenda' ? renderAgenda() : <HistoryView />}
      </div>
    </div>
  );
};

export default App;
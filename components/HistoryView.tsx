import React, { useState, useEffect } from 'react';
import { HistoryData, HistoryEntry, HistorySchedule, User } from '../types';
import { HISTORY_API_URL, USERS, DAYS_OF_WEEK } from '../constants';
import { SpinnerIcon } from './icons';
import Avatar from './Avatar';

const mapIdToUser = (idOrName: string | number): User | undefined => {
  if (typeof idOrName === 'number') {
    return USERS.find(u => u.id === idOrName);
  }
  if (typeof idOrName === 'string') {
    // Handle "ID desconhecido: X" case
    if (idOrName.startsWith('ID desconhecido:')) {
      return undefined;
    }
    return USERS.find(u => u.name === idOrName);
  }
  return undefined;
};

const HistoryCard: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
    const scheduleData: HistorySchedule | undefined = entry.dados || entry.schedule;
    const week = entry.semana || entry.date;

    if (!scheduleData || !week) return null;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 tracking-wide text-center">{week}</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {DAYS_OF_WEEK.map(day => {
                        const userIdsOrNames = scheduleData[day.toLowerCase()] || scheduleData[day] || [];
                        const scheduledUsers = userIdsOrNames
                            .map(mapIdToUser)
                            .filter((user): user is User => user !== undefined);

                        return (
                            <div key={day} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                <h4 className="font-bold text-center text-gray-700 mb-3">{day}</h4>
                                {scheduledUsers.length > 0 ? (
                                    <div className="flex flex-wrap justify-center -space-x-2">
                                        {scheduledUsers.map(user => (
                                            <Avatar key={user.id} user={user} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center">Ninguém</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const url = new URL(HISTORY_API_URL);
        url.searchParams.append('t', new Date().getTime().toString());

        const response = await fetch(url.toString(), { cache: 'no-store' });
        if (!response.ok) {
            if (response.status === 404) {
                setHistory([]); // No history yet, not an error
                return;
            }
          throw new Error('Não foi possível carregar o histórico.');
        }
        const data: HistoryData = await response.json();
        // Sort history from newest to oldest
        const sortedHistory = (data.historico_agendamentos || []).sort((a, b) => {
            const dateA = a.semana?.split(' - ')[0] || a.date || '';
            const dateB = b.semana?.split(' - ')[0] || b.date || '';
            
            // Assuming format DD/MM/YYYY
            const partsA = dateA.split('/');
            const partsB = dateB.split('/');

            if (partsA.length === 3 && partsB.length === 3) {
                 const d1 = new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0]));
                 const d2 = new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0]));
                 return d2.getTime() - d1.getTime();
            }

            return 0; // Fallback if format is unexpected
        });
        setHistory(sortedHistory);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <SpinnerIcon className="w-10 h-10 text-indigo-500" />
        <p className="ml-4 text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="text-center text-gray-500 bg-gray-100 p-6 rounded-lg">Nenhum histórico de agendamento encontrado.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {history.map((entry, index) => (
        <HistoryCard key={index} entry={entry} />
      ))}
    </div>
  );
};

export default HistoryView;
import React, { useState, useEffect } from 'react';
import { HistoryEntry } from '../types';
import { HISTORY_API_URL, USERS, DAYS_OF_WEEK } from '../constants';
import { SpinnerIcon, AlertCircleIcon, CalendarIcon, UsersIcon } from './icons';

const HistoryView: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openWeek, setOpenWeek] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${HISTORY_API_URL}?t=${new Date().getTime()}`);
                if (!response.ok) {
                    throw new Error('Não foi possível carregar o histórico.');
                }
                const data = await response.json();
                const sortedHistory = (data.historico_agendamentos || []).sort((a: HistoryEntry, b: HistoryEntry) => {
                    const dateA = new Date(a.date || 0).getTime();
                    const dateB = new Date(b.date || 0).getTime();
                    // Basic sort for entries that might be missing proper date fields
                    if (isNaN(dateA) || isNaN(dateB)) return 0;
                    return dateB - dateA;
                });
                setHistory(sortedHistory);
                if (sortedHistory.length > 0) {
                    setOpenWeek(sortedHistory[0].semana || sortedHistory[0].date || null);
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Ocorreu um erro desconhecido.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getWeekDisplay = (entry: HistoryEntry): string => {
        if (entry.semana) {
            return `Semana arquivada: ${entry.semana}`;
        }
        if (entry.date) {
            // Check if 'date' field contains a week range string
            if (entry.date.includes('/') && entry.date.includes('-')) {
                return `Semana arquivada: ${entry.date}`;
            }
            const d = new Date(entry.date);
            if (!isNaN(d.getTime())) {
                return `Semana arquivada em: ${d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}`;
            }
        }
        return 'Registro de semana';
    };

    const toggleWeek = (entry: HistoryEntry) => {
        const entryId = entry.semana || entry.date || '';
        setOpenWeek(openWeek === entryId ? null : entryId);
    };

    const getUserName = (id: number): string => {
        return USERS.find(u => u.id === id)?.name || `ID ${id}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10">
                <SpinnerIcon className="w-8 h-8 text-indigo-600" />
                <p className="mt-2 text-gray-600">Carregando histórico...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
                <div className="flex">
                    <div className="py-1"><AlertCircleIcon className="h-6 w-6 text-red-500 mr-3" /></div>
                    <div><p className="font-bold">{error}</p></div>
                </div>
            </div>
        );
    }
    
    if (history.length === 0) {
        return <p className="text-center text-gray-500">Nenhum histórico de agendamento encontrado.</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
                {history.map((entry, index) => {
                    const entryId = entry.semana || entry.date || `entry-${index}`;
                    const isExpanded = openWeek === entryId;
                    const schedule = entry.dados || entry.schedule || {};

                    return (
                        <div key={entryId} className="border border-gray-200 rounded-lg shadow-sm bg-white">
                            <button
                                onClick={() => toggleWeek(entry)}
                                className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-expanded={isExpanded}
                            >
                                <div className="flex items-center gap-3">
                                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                    <span className="font-semibold text-gray-800">
                                        {getWeekDisplay(entry)}
                                    </span>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {isExpanded && (
                                <div className="border-t border-gray-200 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {DAYS_OF_WEEK.map(day => {
                                            const participants = schedule[day.toLowerCase()] || [];
                                            return (
                                            <div key={day} className="bg-gray-50 p-3 rounded-md">
                                                <h4 className="font-bold text-sm text-gray-700 mb-2">{day}</h4>
                                                <div className="space-y-1">
                                                    {participants.length > 0 ? (
                                                        participants.map((participant, pIndex) => (
                                                            <div key={pIndex} className="flex items-center text-xs text-gray-800 bg-gray-200 px-2 py-1 rounded">
                                                                <UsersIcon className="w-3 h-3 mr-2 flex-shrink-0" />
                                                                <span>{typeof participant === 'number' ? getUserName(participant) : participant}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-500 italic">Ninguém presente</p>
                                                    )}
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HistoryView;

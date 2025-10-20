import { USERS, DAYS_OF_WEEK, HISTORY_API_URL, API_URL } from '../constants';
import { Schedule, HistoryEntry, HistoryData } from '../types';

// Helper to get the current week's date range string.
const getWeekRange = (): string => {
    const today = new Date(); // Data em que o Cron Job está rodando
    const dayOfWeek = today.getDay(); // Domingo = 0, Segunda = 1, etc.

    // Calcula a data da segunda-feira da semana atual
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(new Date(today).setDate(diffToMonday));

    // Calcula a data da sexta-feira da mesma semana
    const friday = new Date(new Date(monday).setDate(monday.getDate() + 4));

    const formatDate = (date: Date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    return `${formatDate(monday)} - ${formatDate(friday)}`;
};


// Helper for an empty schedule
const getEmptySchedule = (): Schedule => {
    const emptySchedule: Schedule = {};
    DAYS_OF_WEEK.forEach(day => {
        emptySchedule[day] = [];
    });
    return emptySchedule;
};


// The serverless function handler for Vercel
export default async function handler(request: any, response: any) {
    // 1. Authenticate the request
    const { secret } = request.query;
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return response.status(401).json({ message: 'Unauthorized: Invalid or missing secret' });
    }

    try {
        // 2. Fetch current schedule
        const scheduleResponse = await fetch(API_URL, { cache: 'no-store' });
        if (!scheduleResponse.ok && scheduleResponse.status !== 404) {
            throw new Error(`Failed to fetch current schedule: ${scheduleResponse.statusText}`);
        }
        const currentSchedule: Schedule = scheduleResponse.status === 404 ? getEmptySchedule() : await scheduleResponse.json();

        // 3. Fetch history data
        const historyResponse = await fetch(HISTORY_API_URL, { cache: 'no-store' });
        if (!historyResponse.ok && historyResponse.status !== 404) {
             throw new Error(`Failed to fetch history: ${historyResponse.statusText}`);
        }
        
        let historyData: HistoryData = { historico_agendamentos: [] };
        if (historyResponse.status !== 404) {
             const text = await historyResponse.text();
             if (text && text.trim() !== "" && text.trim() !== "{}") {
                historyData = JSON.parse(text);
                if (!historyData.historico_agendamentos) {
                    historyData.historico_agendamentos = [];
                }
             }
        }

        // 4. Create new history entry
        const scheduleWithNames: { [day: string]: string[] } = {};
        DAYS_OF_WEEK.forEach(day => {
            const userIds = currentSchedule[day] || [];
            scheduleWithNames[day] = userIds.map(id => USERS.find(u => u.id === id)?.name || `ID desconhecido: ${id}`);
        });

        const newHistoryEntry: HistoryEntry = {
            semana: getWeekRange(),
            dados: scheduleWithNames
        };
        
        historyData.historico_agendamentos.push(newHistoryEntry);

        // 5. Save updated history
        const saveHistoryResponse = await fetch(HISTORY_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyData),
        });

        if (!saveHistoryResponse.ok) {
            throw new Error(`Failed to save history: ${await saveHistoryResponse.text()}`);
        }

        // 6. Create and save empty schedule
        const emptySchedule = getEmptySchedule();
        const saveScheduleResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emptySchedule),
        });

        if (!saveScheduleResponse.ok) {
            throw new Error(`Failed to save new empty schedule: ${await saveScheduleResponse.text()}`);
        }
        
        // 7. Send success response
        return response.status(200).json({ message: 'Schedule reset successfully.' });

    } catch (error) {
        console.error('Cron job failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return response.status(500).json({ message: 'Internal Server Error', error: errorMessage });
    }
}
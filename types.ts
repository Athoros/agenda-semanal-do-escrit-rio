export interface User {
  id: number;
  name: string;
}

export interface Schedule {
  [day: string]: number[];
}

// Represents a schedule stored in history, which can contain names (string) or IDs (number).
export interface HistorySchedule {
  [day: string]: (string | number)[];
}

export interface HistoryEntry {
  semana?: string; // e.g., "20/10/2025 - 24/10/2025"
  date?: string; // For backward compatibility
  dados?: HistorySchedule;
  schedule?: HistorySchedule; // For backward compatibility
}

export interface HistoryData {
  historico_agendamentos: HistoryEntry[];
}

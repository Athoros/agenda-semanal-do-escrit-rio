
import { User } from './types';

export const USERS: User[] = [
  { id: 1, name: 'André' },
  { id: 2, name: 'Jeremias' },
  { id: 3, name: 'João' },
  { id: 4, name: 'Matheus' },
  { id: 5, name: 'Ryon' },
  { id: 6, name: 'Wander' },
];

export const DAYS_OF_WEEK: string[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
];

export const INITIAL_SCHEDULE = {
    'Segunda-feira': [],
    'Terça-feira': [],
    'Quarta-feira': [4],
    'Quinta-feira': [],
    'Sexta-feira': [3, 6, 5],
};

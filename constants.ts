import { User } from './types';

export const USERS: User[] = [
  { id: 1, name: 'André', avatarColor: 'bg-blue-500' },
  { id: 2, name: 'Jeremias', avatarColor: 'bg-green-500' },
  { id: 3, name: 'João', avatarColor: 'bg-yellow-500' },
  { id: 4, name: 'Matheus', avatarColor: 'bg-red-500' },
  { id: 5, name: 'Ryon', avatarColor: 'bg-purple-500' },
  { id: 6, name: 'Wander', avatarColor: 'bg-pink-500' },
];

export const DAYS_OF_WEEK: string[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
];

export const API_URL = 'https://api.npoint.io/ad63fecfda78b862f288';
export const HISTORY_API_URL = 'https://api.npoint.io/38a8d328af8a77a3247b';

export interface User {
  id: number;
  name: string;
}

export interface Schedule {
  [day: string]: number[];
}

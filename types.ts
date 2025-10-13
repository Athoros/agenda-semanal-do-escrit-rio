
export interface User {
  id: number;
  name: string;
}

export interface Schedule {
  [day: string]: number[];
}

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  pop: number; // Probability of Precipitation
}

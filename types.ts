
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string; // Supabase UUID
  email: string;
  role: Role;
}

export interface Card {
  id: string; // Supabase UUID
  category: string;
  text: string;
  imageUrl?: string;
  backgroundColor?: string;
  created_at?: string;
}

export type Category = string;

import { createContext } from "react";

export type Soldier = {
  personalNumber: number;
  name: string;
  role: string;
};

type Auth = {
  soldier: Soldier | null;
  setSoldier: React.Dispatch<React.SetStateAction<Soldier | null>>;
};

export const AuthContext = createContext<Auth | null>(null);

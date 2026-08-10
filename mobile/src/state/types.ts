import type { Equipment, Readings } from '../engine/types';

export type Screen = 'home' | 'equipmentSetup' | 'session' | 'fault' | 'scan' | 'calc' | 'history' | 'training' | 'report';

export interface Keypad {
  id: string;
  verify: boolean;
}

export interface CalcState {
  btu: number;
  dt: number;
}

export interface AppState {
  screen: Screen;
  equipment: Equipment;
  equipmentConfirmed: boolean;
  activeTreeId: string;
  mode: 'beginner' | 'tech';
  teach: boolean;
  readings: Readings;
  keypad: Keypad | null;
  draft: string;
  repairOpen: boolean;
  repair: string | null;
  verifyValue: number | null;
  voiceOpen: boolean;
  calc: CalcState;
  /** Where DIAGNOSE / RESCAN should land after equipment setup is confirmed. */
  setupReturnScreen: Screen;
}

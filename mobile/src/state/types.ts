import type { Equipment, Readings } from '../engine/types';

export type Screen = 'home' | 'equipmentSetup' | 'session' | 'fault' | 'scan' | 'calc' | 'history' | 'training' | 'report';

export interface Keypad {
  id: string;
  verify: boolean;
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
  /** Which calculator is open on the calc screen. */
  activeCalc: string;
  /** Per-calculator input values, keyed calcId -> inputKey -> value. */
  calcValues: Record<string, Record<string, number>>;
  /** Which training lesson is open (null = the skill-map index). */
  trainingTopic: string | null;
  /** Where DIAGNOSE / RESCAN should land after equipment setup is confirmed. */
  setupReturnScreen: Screen;
}

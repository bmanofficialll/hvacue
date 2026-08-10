import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_EQUIPMENT } from '../engine/equipment';
import { selectTree } from '../engine/engine';
import type { Equipment } from '../engine/types';
import type { AppState, Screen } from './types';

const initialTree = selectTree(DEFAULT_EQUIPMENT);

const initialState: AppState = {
  screen: 'home',
  equipment: DEFAULT_EQUIPMENT,
  equipmentConfirmed: false,
  activeTreeId: initialTree.id,
  mode: 'beginner',
  teach: false,
  readings: {},
  keypad: null,
  draft: '',
  repairOpen: false,
  repair: null,
  verifyValue: null,
  voiceOpen: false,
  calc: { btu: 480000, dt: 12 },
  setupReturnScreen: 'session',
};

export function useHvacueState() {
  const [state, setState] = useState<AppState>(initialState);

  const go = useCallback((screen: Screen) => {
    setState((s) => ({ ...s, screen, voiceOpen: false }));
  }, []);

  const setMode = useCallback((mode: 'beginner' | 'tech') => {
    setState((s) => ({ ...s, mode, teach: mode === 'tech' ? false : s.teach }));
  }, []);

  const toggleTeach = useCallback(() => {
    setState((s) => ({ ...s, teach: !s.teach, mode: 'beginner' }));
  }, []);

  const openEquipmentSetup = useCallback((returnScreen: Screen) => {
    setState((s) => ({ ...s, screen: 'equipmentSetup', setupReturnScreen: returnScreen }));
  }, []);

  const confirmEquipment = useCallback((equipment: Equipment) => {
    setState((s) => {
      const tree = selectTree(equipment);
      const treeChanged = tree.id !== s.activeTreeId;
      return {
        ...s,
        equipment,
        equipmentConfirmed: true,
        activeTreeId: tree.id,
        screen: s.setupReturnScreen,
        readings: treeChanged ? {} : s.readings,
        repair: treeChanged ? null : s.repair,
        verifyValue: treeChanged ? null : s.verifyValue,
        teach: false,
      };
    });
  }, []);

  const openKeypad = useCallback((id: string, verify = false) => {
    setState((s) => ({ ...s, keypad: { id, verify }, draft: '' }));
  }, []);

  const closeKeypad = useCallback(() => {
    setState((s) => ({ ...s, keypad: null, draft: '' }));
  }, []);

  const pressKey = useCallback((ch: string) => {
    setState((s) => {
      let d = s.draft;
      if (ch === 'del') d = d.slice(0, -1);
      else if (ch === '.') { if (d.indexOf('.') < 0) d += '.'; }
      else if (d.length < 5) d += ch;
      return { ...s, draft: d };
    });
  }, []);

  const commitReading = useCallback(() => {
    setState((s) => {
      const kp = s.keypad;
      if (!kp) return s;
      const v = parseFloat(s.draft);
      if (isNaN(v)) return s;
      if (kp.id.indexOf('calc_') === 0) {
        const field = kp.id.slice(5) as keyof AppState['calc'];
        return { ...s, calc: { ...s.calc, [field]: v }, keypad: null, draft: '' };
      }
      if (kp.verify) {
        return { ...s, verifyValue: v, keypad: null, draft: '', screen: 'report' };
      }
      return { ...s, readings: { ...s.readings, [kp.id]: v }, keypad: null, draft: '' };
    });
  }, []);

  const openRepair = useCallback(() => setState((s) => ({ ...s, repairOpen: true })), []);
  const closeRepair = useCallback(() => setState((s) => ({ ...s, repairOpen: false })), []);
  const selectRepair = useCallback((name: string) => {
    setState((s) => ({ ...s, repair: name, repairOpen: false, teach: false }));
  }, []);

  const openVoice = useCallback(() => setState((s) => ({ ...s, voiceOpen: true, keypad: null, draft: '' })), []);
  const closeVoice = useCallback(() => setState((s) => ({ ...s, voiceOpen: false })), []);

  const backToRanking = useCallback(() => setState((s) => ({ ...s, screen: 'session' })), []);

  const actions = useMemo(() => ({
    go, setMode, toggleTeach, openEquipmentSetup, confirmEquipment,
    openKeypad, closeKeypad, pressKey, commitReading,
    openRepair, closeRepair, selectRepair,
    openVoice, closeVoice, backToRanking,
  }), [go, setMode, toggleTeach, openEquipmentSetup, confirmEquipment, openKeypad, closeKeypad, pressKey, commitReading, openRepair, closeRepair, selectRepair, openVoice, closeVoice, backToRanking]);

  return { state, actions };
}

export type HvacueActions = ReturnType<typeof useHvacueState>['actions'];

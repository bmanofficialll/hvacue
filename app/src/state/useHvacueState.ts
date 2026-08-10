import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_EQUIPMENT } from '../engine/equipment';
import { selectTree } from '../engine/engine';
import { CALCULATORS, defaultCalcValues } from '../engine/calculators';
import { DEFAULT_AI_SETTINGS, type AiSettings } from '../engine/ai';
import { storageGet, storageSet, storageDelete } from '../platform/storage';
import type { Equipment } from '../engine/types';
import type { AppState, Screen } from './types';

const AI_STORAGE_KEY = 'hvacue.ai.settings';

const initialTree = selectTree(DEFAULT_EQUIPMENT);

const initialState: AppState = {
  screen: 'home',
  equipment: DEFAULT_EQUIPMENT,
  equipmentConfirmed: false,
  symptom: '',
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
  activeCalc: CALCULATORS[0].id,
  calcValues: defaultCalcValues(),
  trainingTopic: null,
  ai: DEFAULT_AI_SETTINGS,
  settingsReturnScreen: 'home',
  setupReturnScreen: 'session',
};

export function useHvacueState() {
  const [state, setState] = useState<AppState>(initialState);

  // Load any saved AI settings once on startup.
  useEffect(() => {
    let alive = true;
    storageGet(AI_STORAGE_KEY).then((raw) => {
      if (!alive || !raw) return;
      try {
        const parsed = JSON.parse(raw) as Partial<AiSettings>;
        setState((s) => ({ ...s, ai: { ...s.ai, ...parsed } }));
      } catch {
        /* ignore corrupt settings */
      }
    });
    return () => { alive = false; };
  }, []);

  const go = useCallback((screen: Screen) => {
    setState((s) => ({ ...s, screen, voiceOpen: false }));
  }, []);

  const openSettings = useCallback((returnScreen: Screen) => {
    setState((s) => ({ ...s, screen: 'settings', settingsReturnScreen: returnScreen }));
  }, []);

  const setAiSettings = useCallback((ai: AiSettings) => {
    setState((s) => ({ ...s, ai }));
    if (ai.apiKey.trim()) storageSet(AI_STORAGE_KEY, JSON.stringify(ai));
    else storageDelete(AI_STORAGE_KEY);
  }, []);

  const prefillEquipment = useCallback((fields: Partial<Equipment>) => {
    setState((s) => ({ ...s, equipment: { ...s.equipment, ...fields }, screen: 'equipmentSetup', setupReturnScreen: 'session' }));
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

  const confirmEquipment = useCallback((equipment: Equipment, symptom?: string) => {
    setState((s) => {
      const tree = selectTree(equipment);
      const treeChanged = tree.id !== s.activeTreeId;
      return {
        ...s,
        equipment,
        symptom: symptom !== undefined ? symptom : s.symptom,
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
      else if (ch === '-') { d = d.startsWith('-') ? d.slice(1) : '-' + d; }
      else if (d.replace('-', '').replace('.', '').length < 6) d += ch;
      return { ...s, draft: d };
    });
  }, []);

  const commitReading = useCallback(() => {
    setState((s) => {
      const kp = s.keypad;
      if (!kp) return s;
      const v = parseFloat(s.draft);
      if (isNaN(v)) return s;
      // Calculator input: id is "calc:<calcId>:<inputKey>"
      if (kp.id.indexOf('calc:') === 0) {
        const [, calcId, inputKey] = kp.id.split(':');
        return {
          ...s,
          calcValues: { ...s.calcValues, [calcId]: { ...s.calcValues[calcId], [inputKey]: v } },
          keypad: null,
          draft: '',
        };
      }
      if (kp.verify) {
        return { ...s, verifyValue: v, keypad: null, draft: '', screen: 'report' };
      }
      return { ...s, readings: { ...s.readings, [kp.id]: v }, keypad: null, draft: '' };
    });
  }, []);

  const selectCalc = useCallback((id: string) => setState((s) => ({ ...s, activeCalc: id })), []);

  const openTraining = useCallback((topic: string) => setState((s) => ({ ...s, screen: 'training', trainingTopic: topic })), []);
  const closeTraining = useCallback(() => setState((s) => ({ ...s, trainingTopic: null })), []);

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
    selectCalc, openTraining, closeTraining,
    openSettings, setAiSettings, prefillEquipment,
    openRepair, closeRepair, selectRepair,
    openVoice, closeVoice, backToRanking,
  }), [go, setMode, toggleTeach, openEquipmentSetup, confirmEquipment, openKeypad, closeKeypad, pressKey, commitReading, selectCalc, openTraining, closeTraining, openSettings, setAiSettings, prefillEquipment, openRepair, closeRepair, selectRepair, openVoice, closeVoice, backToRanking]);

  return { state, actions };
}

export type HvacueActions = ReturnType<typeof useHvacueState>['actions'];

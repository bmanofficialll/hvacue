import { color } from '../theme';
import { computeCauses, computeNextStep, evidenceTag, hasPtTable, selectTree } from '../engine/engine';
import type { AppState } from './types';

export interface ReadingRow {
  id: string;
  label: string;
  display: string;
  note: string;
  noteColor: string;
  valColor: string;
  bg: string;
}

export interface EquipRow {
  k: string;
  v: string;
  bad: boolean;
}

export interface SessionChip {
  t: string;
  bg: string;
  fg: string;
}

export function deriveSession(state: AppState) {
  const tree = selectTree(state.equipment);
  const E = state.equipment;
  const readings = state.readings;
  const metrics = tree.metrics(readings, E.refrigerant);
  const causes = computeCauses(tree, readings, metrics);
  const loggedCount = tree.order.filter((k) => readings[k] != null).length;
  const flagList = tree.flags(readings, metrics, E.refrigerant, E);
  const flagText = flagList.join(' ');
  const nextStep = computeNextStep(tree, readings, causes, {
    repaired: state.repair,
    verifyValue: state.verifyValue,
    depthMode: state.mode,
  });
  const derivedMetrics = tree.derived(metrics, E.refrigerant);
  const canRepair = loggedCount === tree.order.length && !state.repair;
  const hasPt = hasPtTable(E.refrigerant);

  let verify: ReturnType<(typeof tree)['verify']> | null = null;
  if (state.verifyValue != null) {
    verify = tree.verify(state.verifyValue, readings, E.refrigerant);
  }

  const readingRows: ReadingRow[] = tree.order.map((id) => {
    const d = tree.defs[id];
    const v = readings[id];
    const bad = tree.badChannel(id, readings, metrics);
    return {
      id, label: d.label,
      display: v == null ? '——' : v + ' ' + d.unit,
      note: v == null ? 'NOT LOGGED' : bad ? 'FLAGGED · VERIFY' : 'MEASURED · THIS SESSION',
      noteColor: v == null ? color.textDimmer : bad ? color.redSoft : color.textFaint,
      valColor: v == null ? color.textDimmer : bad ? color.redSoft : color.text,
      bg: v == null ? color.cardFlush : color.card,
    };
  });

  const equipRows: EquipRow[] = [
    ['MANUFACTURER', E.manufacturer, false],
    ['MODEL', E.model, false],
    ['SERIAL', E.serial || '—', false],
    ['TYPE', E.equipmentType.toUpperCase(), false],
    ['REFRIGERANT', E.refrigerant + (hasPt ? ' · PT CACHED' : ' · NO PT DATA'), !hasPt],
    ['METERING', E.meteringDevice, false],
    ['ELECTRICAL', E.voltage + ' / ' + E.phase, false],
    ['CAPACITY', E.capacityTons + ' TONS', false],
  ].map(([k, v, bad]) => ({ k: k as string, v: v as string, bad: bad as boolean }));

  const chips: SessionChip[] = [
    { t: E.refrigerant, bg: hasPt ? color.card : color.redBg12, fg: hasPt ? color.textRow : color.redSoft },
    { t: E.capacityTons + ' TON', bg: color.card, fg: color.textRow },
    { t: E.voltage.replace(' ', '') + '/' + E.phase, bg: color.card, fg: color.textRow },
    { t: E.compressor.toUpperCase(), bg: color.card, fg: color.textRow },
    { t: E.circuits + ' CIRCUIT' + (E.circuits === 1 ? '' : 'S'), bg: color.card, fg: color.textRow },
    { t: E.meteringDevice.toUpperCase(), bg: color.card, fg: color.textRow },
    { t: tree.alarmText, bg: color.redBg12, fg: color.redSoft },
  ];

  const brandNote = E.manufacturer === 'Generic / unknown'
    ? 'NO MANUFACTURER SELECTED — EVERY PROCEDURE BELOW IS GENERIC, NOT BRAND-SPECIFIC'
    : E.manufacturer.toUpperCase() + ' PROCEDURE WHERE DOCUMENTED · GENERIC WHERE MARKED';

  return {
    tree, readings, metrics, causes, loggedCount, flagText, hasFlag: flagText.length > 0,
    nextStep, derivedMetrics, canRepair, verify, hasPt,
    evidenceTag: evidenceTag(loggedCount),
    readingRows, equipRows, chips, brandNote,
    unitTitle: E.model + ' · ' + E.equipmentType,
  };
}

export type SessionDerived = ReturnType<typeof deriveSession>;

export interface KeypadView {
  label: string;
  unit: string;
  hint: string;
  hintColor: string;
}

export function deriveKeypad(state: AppState): KeypadView | null {
  const kp = state.keypad;
  if (!kp) return null;
  if (kp.id.indexOf('calc_') === 0) {
    return {
      label: kp.id === 'calc_btu' ? 'Load' : 'Design ΔT',
      unit: kp.id === 'calc_btu' ? 'BTU/HR' : '°F',
      hint: 'GLYCOL-CORRECTED CONSTANT IN USE',
      hintColor: color.textDim,
    };
  }
  const tree = selectTree(state.equipment);
  const d = tree.defs[kp.id];
  const v = parseFloat(state.draft);
  let hint = d.expected.toUpperCase();
  let hintColor: string = color.textDim;
  if (!isNaN(v) && (v < d.lo || v > d.hi)) {
    hint = 'OUTSIDE PLAUSIBLE RANGE FOR THIS EQUIPMENT — I WILL FLAG IT';
    hintColor = color.redSoft;
  }
  return {
    label: (kp.verify ? 'Final ' + d.label.toLowerCase() : d.label),
    unit: d.unit,
    hint, hintColor,
  };
}

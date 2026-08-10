import { color } from '../theme';
import { computeCauses, computeNextStep, evidenceTag, hasPtTable, selectTree } from '../engine/engine';
import { CALCULATORS } from '../engine/calculators';
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

  // Plain-language guided walkthrough — a phase-aware "where you are / what to
  // do now" that hand-holds the technician through the whole job.
  const total = tree.order.length;
  let walkthrough: { phase: string; headline: string; body: string };
  if (state.verifyValue != null && verify) {
    walkthrough = verify.status === 'verified'
      ? { phase: 'DONE', headline: 'Fix verified — you can close the job.', body: 'The number that tripped the equipment is back in range at matched conditions. The report has your before/after on record.' }
      : { phase: 'RE-CHECK', headline: 'Not verified yet — back to the data.', body: 'The verification reading is still out of range, so the root cause was not addressed. Re-open the ranked causes and work the next most-likely one.' };
  } else if (state.repair) {
    walkthrough = { phase: 'VERIFY', headline: 'Repair logged — now prove it.', body: 'Run the equipment at similar conditions, let it settle, and take the one verification reading HVACue asks for. A repair is not finished until that number moves back where it belongs.' };
  } else if (loggedCount === 0) {
    walkthrough = { phase: 'START', headline: 'Let’s work this one measurement at a time.', body: 'Tap the first field reading below and key in what you measure. Don’t worry about the whole picture yet — log one honest number and HVACue starts narrowing it down. Press “What should I check next?” any time you’re unsure.' };
  } else if (loggedCount < total) {
    walkthrough = { phase: 'MEASURE', headline: `${loggedCount} of ${total} readings in — keep going.`, body: 'Each reading sharpens the ranking below. Follow the “Check this next” card — it tells you what to measure, why it matters, how to take it, and what a normal vs abnormal result means.' };
  } else if (canRepair || !state.repair) {
    walkthrough = { phase: 'DECIDE', headline: 'Full data set — confirm the cause, then fix.', body: 'You’ve logged everything. Read the top-ranked cause and run the hands-on test in the “Next test” card before you change parts. When the test confirms it, tap “Log repair & verify.”' };
  } else {
    walkthrough = { phase: 'MEASURE', headline: 'Keep working the sequence.', body: 'Follow the next-step card below.' };
  }

  return {
    walkthrough,
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
  if (kp.id.indexOf('calc:') === 0) {
    const [, calcId, inputKey] = kp.id.split(':');
    const calc = CALCULATORS.find((c) => c.id === calcId);
    const input = calc?.inputs.find((i) => i.key === inputKey);
    return {
      label: input ? input.label : 'Value',
      unit: input ? input.unit : '',
      hint: calc ? calc.formula.toUpperCase() : '',
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

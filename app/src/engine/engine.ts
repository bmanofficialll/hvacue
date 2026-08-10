import { chillerTree } from './chillerTree';
import { splitTree } from './splitTree';
import { usesSplitTree } from './equipment';
import type { DiagnosticTree, Equipment, Metrics, Readings } from './types';

export function selectTree(equipment: Equipment): DiagnosticTree {
  return usesSplitTree(equipment) ? splitTree : chillerTree;
}

export interface RankedCause {
  key: string;
  name: string;
  why: string;
  pct: number;
  pctText: string;
  barWidth: string;
  tier: 'MOST LIKELY' | 'POSSIBLE' | 'LESS LIKELY' | 'UNLIKELY';
  rank: 'top' | 'mid' | 'low';
}

export function computeCauses(tree: DiagnosticTree, readings: Readings, metrics: Metrics): RankedCause[] {
  const logged = tree.order.filter((k) => readings[k] != null).length;
  if (logged < 2) return [];
  const w = tree.weights(readings, metrics);
  const meta = tree.causeMeta(metrics, readings);
  let list = Object.keys(w).map((k) => ({ k, v: Math.max(1, w[k]) }));
  const tot = list.reduce((a, b) => a + b.v, 0);
  const scored = list
    .map((x) => ({ k: x.k, pct: Math.round((x.v / tot) * 100) }))
    .sort((a, b) => b.pct - a.pct);
  return scored.map((x, i) => {
    const tier: RankedCause['tier'] = x.pct >= 45 ? 'MOST LIKELY' : x.pct >= 15 ? 'POSSIBLE' : x.pct >= 7 ? 'LESS LIKELY' : 'UNLIKELY';
    const rank: RankedCause['rank'] = i === 0 ? 'top' : x.pct >= 15 ? 'mid' : 'low';
    const info = meta[x.k];
    return { key: x.k, name: info.name, why: info.why, pct: x.pct, pctText: x.pct + '%', barWidth: x.pct + '%', tier, rank };
  });
}

export interface NextStep {
  kind: 'measure' | 'inspect';
  id: string;
  verify: boolean;
  title: string;
  tag: string;
  rows: [string, string][];
  action: string;
  teach: string;
}

export function computeNextStep(
  tree: DiagnosticTree,
  readings: Readings,
  causes: RankedCause[],
  opts: { repaired: string | null; verifyValue: number | null; depthMode: 'beginner' | 'tech' },
): NextStep {
  if (opts.repaired && opts.verifyValue == null) {
    const d = tree.defs[tree.verifyId];
    return {
      kind: 'measure', id: tree.verifyId, verify: true,
      title: 'Final ' + d.label.toLowerCase() + ' after repair',
      tag: 'VERIFICATION · REQUIRED TO CLOSE',
      rows: [
        ['WHY', 'A repair is not proven until the number that tripped the machine comes back to where it belongs.'],
        ['HOW', 'Run at similar load and entering conditions, let it stabilize 10 minutes, then read ' + d.label.toLowerCase() + ' and recompute.'],
        ['EXPECTED', tree.verifyExpectedText],
        ['IF NORMAL', 'Session closes with before/after documented in the report.'],
        ['IF ABNORMAL', 'Root cause was not addressed — return to ranked causes with the new data.'],
      ],
      action: 'LOG FINAL READING',
      teach: 'Verification is what separates a repair from a parts swap. Same conditions, same measurement, documented before and after.',
    };
  }

  const miss = tree.order.find((k) => readings[k] == null);
  if (miss) {
    const d = tree.defs[miss];
    return {
      kind: 'measure', id: miss, verify: false,
      title: d.label, tag: 'ONE MEASUREMENT · ' + d.unit,
      rows: [
        ['WHY', opts.depthMode === 'tech' ? d.why.tech : d.why.beginner],
        ['HOW', d.how],
        ['EXPECTED', d.expected],
        ['IF NORMAL', 'I narrow the ranking and hand you the next single test.'],
        ['IF ABNORMAL', 'I flag it and re-rank before you touch anything.'],
      ],
      action: 'LOG THIS READING',
      teach: d.teach,
    };
  }

  const top = causes[0];
  const key = top ? top.key : tree.defaultCauseKey;
  const test = tree.handsOnTests[key];
  return {
    kind: 'inspect', id: key, verify: false,
    title: test.title, tag: 'HANDS-ON TEST · TOP-RANKED CAUSE',
    rows: test.rows, action: 'MARK TEST COMPLETE', teach: test.teach,
  };
}

export function evidenceTag(loggedCount: number): string {
  return loggedCount === 0 ? 'NO EVIDENCE YET' : 'FROM ' + loggedCount + ' MEASUREMENT' + (loggedCount === 1 ? '' : 'S');
}

export { hasPtTable, saturationTemp } from './ptTables';
export { chillerTree, splitTree };

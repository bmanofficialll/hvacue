// Working HVAC field calculators. Each is a small, self-contained formula
// with typed inputs and a live result. Kept deliberately transparent — the
// formula is shown on screen so a tech can sanity-check the math.

export interface CalcInput {
  key: string;
  label: string;
  unit: string;
  default: number;
}

export interface CalcResult {
  value: string;
  unit: string;
  note?: string;
}

export interface Calculator {
  id: string;
  name: string;
  sub: string;
  formula: string;
  inputs: CalcInput[];
  compute: (v: Record<string, number>) => CalcResult;
}

const f1 = (n: number) => (isFinite(n) ? n.toFixed(1) : '—');
const f0 = (n: number) => (isFinite(n) ? Math.round(n).toString() : '—');

export const CALCULATORS: Calculator[] = [
  {
    id: 'gpm',
    name: 'Hydronic flow (GPM)',
    sub: 'Water / glycol loop',
    formula: 'GPM = BTU/hr ÷ (500 × ΔT)',
    inputs: [
      { key: 'btu', label: 'Load', unit: 'BTU/HR', default: 480000 },
      { key: 'dt', label: 'Water ΔT', unit: '°F', default: 12 },
    ],
    compute: (v) => ({ value: f1(v.dt > 0 ? v.btu / (500 * v.dt) : NaN), unit: 'GPM', note: 'Water constant 500. For 30% glycol use ≈485.' }),
  },
  {
    id: 'superheat',
    name: 'Superheat',
    sub: 'Evaporator / suction side',
    formula: 'SH = suction line temp − sat temp',
    inputs: [
      { key: 'slt', label: 'Suction line temp', unit: '°F', default: 55 },
      { key: 'sat', label: 'Saturation temp (from PT)', unit: '°F', default: 42 },
    ],
    compute: (v) => {
      const sh = v.slt - v.sat;
      return { value: f1(sh), unit: '°F SH', note: sh < 5 ? 'Low — flooding risk.' : sh > 20 ? 'High — starved coil.' : 'In typical range.' };
    },
  },
  {
    id: 'subcooling',
    name: 'Subcooling',
    sub: 'Condenser / liquid side',
    formula: 'SC = cond sat temp − liquid line temp',
    inputs: [
      { key: 'sat', label: 'Condensing sat temp (from PT)', unit: '°F', default: 105 },
      { key: 'llt', label: 'Liquid line temp', unit: '°F', default: 95 },
    ],
    compute: (v) => {
      const sc = v.sat - v.llt;
      return { value: f1(sc), unit: '°F SC', note: sc < 4 ? 'Low — suspect undercharge.' : sc > 15 ? 'High — overcharge / restriction.' : 'In typical range.' };
    },
  },
  {
    id: 'airsplit',
    name: 'Air temperature split',
    sub: 'Across the evaporator coil',
    formula: 'ΔT = return air − supply air',
    inputs: [
      { key: 'rat', label: 'Return air DB', unit: '°F', default: 75 },
      { key: 'sat', label: 'Supply air DB', unit: '°F', default: 57 },
    ],
    compute: (v) => {
      const dt = v.rat - v.sat;
      return { value: f1(dt), unit: '°F split', note: dt < 14 ? 'Narrow — low capacity.' : dt > 22 ? 'Wide — suspect low airflow.' : 'In the 16–22 °F range.' };
    },
  },
  {
    id: 'targetsh',
    name: 'Target superheat',
    sub: 'Fixed-orifice systems',
    formula: 'TSH ≈ (3 × indoor WB − 80 − outdoor DB) ÷ 2',
    inputs: [
      { key: 'iwb', label: 'Indoor wet bulb', unit: '°F', default: 63 },
      { key: 'odb', label: 'Outdoor dry bulb', unit: '°F', default: 90 },
    ],
    compute: (v) => {
      const t = (3 * v.iwb - 80 - v.odb) / 2;
      return { value: f1(t), unit: '°F target', note: 'Field approximation — use the manufacturer charging chart when available.' };
    },
  },
  {
    id: 'sensible',
    name: 'Sensible heat',
    sub: 'Airflow load',
    formula: 'BTU/hr = 1.08 × CFM × ΔT',
    inputs: [
      { key: 'cfm', label: 'Airflow', unit: 'CFM', default: 1200 },
      { key: 'dt', label: 'Air ΔT', unit: '°F', default: 18 },
    ],
    compute: (v) => ({ value: f0(1.08 * v.cfm * v.dt), unit: 'BTU/HR', note: '1.08 = sea-level sensible constant.' }),
  },
  {
    id: 'kw3ph',
    name: 'Three-phase power',
    sub: 'Electrical',
    formula: 'kW = V × A × PF × √3 ÷ 1000',
    inputs: [
      { key: 'v', label: 'Volts', unit: 'V', default: 460 },
      { key: 'a', label: 'Amps', unit: 'A', default: 24 },
      { key: 'pf', label: 'Power factor', unit: '', default: 0.9 },
    ],
    compute: (v) => ({ value: f1((v.v * v.a * v.pf * Math.sqrt(3)) / 1000), unit: 'kW', note: 'For single phase, drop the √3.' }),
  },
  {
    id: 'duct',
    name: 'Round duct size',
    sub: 'Velocity method',
    formula: 'd = √(576 × CFM ÷ (π × FPM))',
    inputs: [
      { key: 'cfm', label: 'Airflow', unit: 'CFM', default: 400 },
      { key: 'fpm', label: 'Target velocity', unit: 'FPM', default: 700 },
    ],
    compute: (v) => {
      const d = v.fpm > 0 ? Math.sqrt((576 * v.cfm) / (Math.PI * v.fpm)) : NaN;
      return { value: f1(d), unit: 'in Ø', note: '~700 FPM branch, ~900 FPM trunk are common targets.' };
    },
  },
  {
    id: 'esp',
    name: 'Total external static',
    sub: 'Air handler / furnace',
    formula: 'ESP = |supply| + |return|',
    inputs: [
      { key: 'sup', label: 'Supply static', unit: 'in wc', default: 0.4 },
      { key: 'ret', label: 'Return static', unit: 'in wc', default: 0.35 },
    ],
    compute: (v) => {
      const esp = Math.abs(v.sup) + Math.abs(v.ret);
      return { value: esp.toFixed(2), unit: 'in wc', note: esp > 0.8 ? 'High — check filter, coil, duct restriction.' : 'Compare to the blower table rating.' };
    },
  },
  {
    id: 'tempconv',
    name: 'Temperature convert',
    sub: '°F ⇄ °C',
    formula: '°C = (°F − 32) × 5⁄9',
    inputs: [{ key: 'f', label: 'Fahrenheit', unit: '°F', default: 72 }],
    compute: (v) => ({ value: f1(((v.f - 32) * 5) / 9), unit: '°C' }),
  },
];

export function defaultCalcValues(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const c of CALCULATORS) {
    out[c.id] = {};
    for (const i of c.inputs) out[c.id][i.key] = i.default;
  }
  return out;
}

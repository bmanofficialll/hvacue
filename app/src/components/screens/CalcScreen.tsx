import { color, font } from '../../theme';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { ScreenHeader } from '../ui/primitives';

const GLYCOL_CONSTANT = 485;

const OTHER_CALCS = [
  ['Superheat', 'PT + line temp'],
  ['Subcooling', 'Liquid line'],
  ['Pump head', 'Curve solver'],
  ['Static pressure', 'ESP + drops'],
  ['Duct sizing', 'Velocity method'],
  ['Three-phase kW', 'V · A · PF · √3'],
];

export function CalcScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const gpm = state.calc.dt > 0 ? state.calc.btu / (GLYCOL_CONSTANT * state.calc.dt) : 0;
  const fields: { label: string; value: string; unit: string; onEdit: () => void }[] = [
    { label: 'Load', value: state.calc.btu.toLocaleString('en-US'), unit: 'BTU/HR', onEdit: () => actions.openKeypad('calc_btu') },
    { label: 'Design ΔT', value: String(state.calc.dt), unit: '°F', onEdit: () => actions.openKeypad('calc_dt') },
    { label: 'Fluid', value: '30% PG', unit: '', onEdit: () => {} },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Hydronic flow" onBack={() => actions.go('home')} />
      <div style={{ padding: '0 18px' }}>
        <div style={{ borderRadius: 14, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 18, textAlign: 'center' }}>
          <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em' }}>GPM = BTU/HR ÷ (500 × ΔT)</div>
          <div style={{ font: `600 46px/1 ${font.mono}`, color: color.amber, marginTop: 16 }}>{gpm.toFixed(1)}</div>
          <div style={{ font: `500 11px/1 ${font.mono}`, color: color.textDim, marginTop: 9, letterSpacing: '.14em' }}>GALLONS PER MINUTE</div>
        </div>
        <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${color.border}`, overflow: 'hidden' }}>
          {fields.map((f, i) => (
            <div
              key={f.label}
              onClick={f.onEdit}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderBottom: i === fields.length - 1 ? 'none' : `1px solid ${color.borderSoft}`, cursor: f.unit ? 'pointer' : 'default' }}
            >
              <div style={{ flex: 1, font: `500 12px/1.2 ${font.heading}`, color: color.textRow }}>{f.label}</div>
              <div style={{ font: `600 16px/1 ${font.mono}`, color: color.text }}>{f.value}</div>
              <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim, width: 36, textAlign: 'right' }}>{f.unit}</div>
            </div>
          ))}
        </div>
        <div style={{ font: `500 10.5px/1.6 ${font.mono}`, color: color.textDimmer, marginTop: 12 }}>
          FLUID: 30% PROPYLENE GLYCOL — 500 CONSTANT REPLACED WITH FLUID-CORRECTED VALUE. WATER MODE AVAILABLE.
        </div>
        <div style={{ margin: '22px 0 10px', font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em' }}>OTHER CALCULATORS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {OTHER_CALCS.map(([n, s]) => (
            <div key={n} style={{ height: 58, borderRadius: 11, background: color.card, border: `1px solid ${color.border}`, padding: '11px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ font: `600 12px/1.1 ${font.heading}` }}>{n}</div>
              <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.textDim }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { color, font } from '../../theme';
import { CALCULATORS } from '../../engine/calculators';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { ScreenHeader } from '../ui/primitives';

export function CalcScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const calc = CALCULATORS.find((c) => c.id === state.activeCalc) ?? CALCULATORS[0];
  const values = state.calcValues[calc.id] ?? {};
  const result = calc.compute(values);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Calculators" subtitle="Pick a tool, tap a value to edit" onBack={() => actions.go('home')} />

      {/* Calculator picker */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 4px', scrollbarWidth: 'none' }}>
        {CALCULATORS.map((c) => {
          const on = c.id === calc.id;
          return (
            <div
              key={c.id}
              onClick={() => actions.selectCalc(c.id)}
              style={{ flex: 'none', padding: '9px 13px', borderRadius: 10, cursor: 'pointer', background: on ? color.amber : color.card, border: `1px solid ${on ? color.amber : color.borderStrong}` }}
            >
              <div style={{ font: `600 11px/1 ${font.heading}`, color: on ? color.amberOn : color.text, whiteSpace: 'nowrap' }}>{c.name}</div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ borderRadius: 14, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 18, textAlign: 'center' }}>
          <div style={{ font: `600 9.5px/1.5 ${font.mono}`, color: color.textDim, letterSpacing: '.12em' }}>{calc.formula}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <div style={{ font: `600 44px/1 ${font.mono}`, color: color.amber }}>{result.value}</div>
            <div style={{ font: `600 14px/1 ${font.mono}`, color: color.textDim }}>{result.unit}</div>
          </div>
          {result.note && <div style={{ font: `500 10.5px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 12 }}>{result.note}</div>}
        </div>

        <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${color.border}`, overflow: 'hidden' }}>
          {calc.inputs.map((inp, i) => (
            <div
              key={inp.key}
              onClick={() => actions.openKeypad(`calc:${calc.id}:${inp.key}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderBottom: i === calc.inputs.length - 1 ? 'none' : `1px solid ${color.borderSoft}`, cursor: 'pointer' }}
            >
              <div style={{ flex: 1, font: `500 12px/1.2 ${font.heading}`, color: color.textRow }}>{inp.label}</div>
              <div style={{ font: `600 16px/1 ${font.mono}`, color: color.text }}>{values[inp.key]}</div>
              <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim, minWidth: 44, textAlign: 'right' }}>{inp.unit}</div>
            </div>
          ))}
        </div>
        <div style={{ font: `500 10px/1.6 ${font.mono}`, color: color.textDimmer, marginTop: 12 }}>
          {calc.sub.toUpperCase()} · FIELD ESTIMATE — VERIFY AGAINST MANUFACTURER DATA BEFORE ACTING.
        </div>
      </div>
    </div>
  );
}

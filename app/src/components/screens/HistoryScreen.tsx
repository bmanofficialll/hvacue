import { color, font } from '../../theme';
import type { HvacueActions } from '../../state/useHvacueState';
import { ScreenHeader } from '../ui/primitives';

const PLANT = [
  { n: 'Chiller plant', s: '2 UNITS', indent: 14, dot: color.amber, colorText: color.text },
  { n: 'CH-1 · 30HXC-186', s: 'ALARM', indent: 30, dot: color.red, colorText: color.redSoft },
  { n: 'CH-2 · 30HXC-186', s: 'RUN', indent: 30, dot: color.green, colorText: color.textRow },
  { n: 'CT-1 cooling tower', s: 'RUN', indent: 30, dot: color.green, colorText: color.textRow },
  { n: 'CWP-1 / CWP-2', s: 'RUN / OFF', indent: 30, dot: color.green, colorText: color.textRow },
  { n: 'Boiler plant', s: '2 UNITS', indent: 14, dot: color.textDim, colorText: color.text },
  { n: 'AHU-1 … AHU-4', s: 'BAS', indent: 14, dot: color.textDim, colorText: color.textRow },
];

const HISTORY = [
  { d: '2026-03-11', tag: 'CLEARED', t: 'High discharge pressure', b: 'Approach 13.8 °F at design flow. Condenser tubes brush-cleaned; approach returned to 4.2 °F.' },
  { d: '2025-08-02', tag: 'CLEARED', t: 'High discharge pressure', b: 'Tower sump low, entering water 91 °F. Makeup valve rebuilt. No refrigerant work performed.' },
  { d: '2025-04-19', tag: 'PM', t: 'Annual maintenance', b: 'Baseline approach 3.1 °F recorded, oil analysis normal, no refrigerant added.' },
];

export function HistoryScreen({ actions }: { actions: HvacueActions }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Bay Tower" onBack={() => actions.go('home')} />
      <div style={{ padding: '0 18px' }}>
        <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em', marginBottom: 10 }}>PLANT TREE</div>
        <div style={{ borderRadius: 12, border: `1px solid ${color.border}`, overflow: 'hidden' }}>
          {PLANT.map((e, i) => (
            <div key={e.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderBottom: i === PLANT.length - 1 ? 'none' : `1px solid ${color.borderSoft}`, paddingLeft: e.indent }}>
              <div style={{ width: 7, height: 7, borderRadius: 4, background: e.dot, flex: 'none' }} />
              <div style={{ flex: 1, font: `500 12.5px/1.2 ${font.heading}`, color: e.colorText }}>{e.n}</div>
              <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.textDim }}>{e.s}</div>
            </div>
          ))}
        </div>
        <div style={{ margin: '20px 0 10px', font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em' }}>CH-1 SERVICE HISTORY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {HISTORY.map((h) => (
            <div key={h.d} style={{ borderRadius: 12, background: color.card, border: `1px solid ${color.border}`, padding: '13px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.textDim }}>{h.d}</div>
                <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.green }}>{h.tag}</div>
              </div>
              <div style={{ font: `600 13px/1.25 ${font.heading}`, marginTop: 8 }}>{h.t}</div>
              <div style={{ font: `500 11px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 6 }}>{h.b}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, borderRadius: 12, background: color.amberBg08, border: `1px solid ${color.amberBorder30}`, padding: 14 }}>
          <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.amber, letterSpacing: '.14em' }}>RECURRENCE DETECTED</div>
          <div style={{ font: `500 12px/1.5 ${font.heading}`, color: '#E0C79A', marginTop: 8 }}>
            Third high-discharge event in 14 months, each cleared by cleaning. Condenser approach is trending up between cleanings — look upstream at condenser-water treatment, not the chiller.
          </div>
        </div>
      </div>
    </div>
  );
}

import { color, font } from '../../theme';
import { deriveKeypad } from '../../state/derive';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export function KeypadSheet({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const view = deriveKeypad(state);
  if (!state.keypad || !view) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,7,.72)', zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={actions.closeKeypad} style={{ flex: 1 }} />
      <div style={{ background: color.sheet, borderTop: `1px solid ${color.borderStrong2}`, borderRadius: '20px 20px 0 0', padding: '18px 16px 34px', animation: 'hvq-rise .18s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.amber, letterSpacing: '.14em' }}>LOG MEASUREMENT</div>
            <div style={{ font: `600 15px/1.25 ${font.heading}`, marginTop: 8 }}>{view.label}</div>
          </div>
          <button
            onClick={actions.closeKeypad}
            style={{ width: 34, height: 34, borderRadius: 9, background: color.chipBg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 13px/1 ${font.heading}`, color: color.textRow, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, margin: '18px 0 6px' }}>
          <div style={{ font: `600 52px/1 ${font.mono}`, color: color.text }}>{state.draft === '' ? '0' : state.draft}</div>
          <div style={{ font: `600 15px/1 ${font.mono}`, color: color.textDim, paddingBottom: 6 }}>{view.unit}</div>
        </div>
        <div style={{ textAlign: 'center', font: `500 10.5px/1.5 ${font.mono}`, color: view.hintColor, minHeight: 32, padding: '0 10px' }}>{view.hint}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
          {KEYS.map((ch) => (
            <div
              key={ch}
              onClick={() => actions.pressKey(ch)}
              style={{
                height: 54, borderRadius: 11, background: ch === 'del' ? color.card : color.chipBg, border: `1px solid ${color.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 21px/1 ${font.mono}`,
                color: ch === 'del' ? color.textDim : color.text, cursor: 'pointer',
              }}
            >
              {ch === 'del' ? '⌫' : ch}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 9, marginTop: 10 }}>
          <div
            onClick={actions.openVoice}
            style={{ width: 60, height: 52, borderRadius: 12, border: `1px solid ${color.cyanBorder}`, background: color.cyanBg08, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <div style={{ width: 9, height: 9, borderRadius: 5, background: color.cyan }} />
          </div>
          <button
            onClick={actions.commitReading}
            style={{ flex: 1, height: 52, borderRadius: 12, background: color.amber, color: color.amberOn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 12px/1 ${font.mono}`, letterSpacing: '.12em', cursor: 'pointer' }}
          >
            SAVE READING
          </button>
        </div>
      </div>
    </div>
  );
}

import { color, font } from '../../theme';
import { selectTree } from '../../engine/engine';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';

export function RepairSheet({ state, actions }: { state: AppState; actions: HvacueActions }) {
  if (!state.repairOpen) return null;
  const tree = selectTree(state.equipment);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,7,.72)', zIndex: 45, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={actions.closeRepair} style={{ flex: 1 }} />
      <div style={{ background: color.sheet, borderTop: `1px solid ${color.borderStrong2}`, borderRadius: '20px 20px 0 0', padding: '18px 16px 34px', animation: 'hvq-rise .18s ease-out' }}>
        <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.green, letterSpacing: '.14em' }}>WHAT WAS REPAIRED?</div>
        <div style={{ font: `500 11.5px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 9 }}>I will request the final readings that must change if this was the true root cause.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
          {tree.repairOptions.map((n) => (
            <div
              key={n}
              onClick={() => actions.selectRepair(n)}
              style={{ padding: '15px 14px', borderRadius: 12, background: color.card, border: `1px solid ${color.borderStrong}`, font: `600 13px/1.3 ${font.heading}`, color: color.text, cursor: 'pointer' }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

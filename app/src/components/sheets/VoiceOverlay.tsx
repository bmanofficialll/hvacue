import { color, font } from '../../theme';
import { selectTree } from '../../engine/engine';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';

interface VoiceLine {
  role: 'TECH' | 'HVACUE';
  t: string;
}

const VOICE_SCRIPTS: Record<string, VoiceLine[]> = {
  chiller: [
    { role: 'TECH', t: 'HVACue, I have a water-cooled chiller tripping on high discharge pressure.' },
    { role: 'HVACUE', t: 'Understood. Entering condenser-water temperature?' },
    { role: 'TECH', t: 'Eighty four.' },
    { role: 'HVACUE', t: 'Logged, 84 degrees. Leaving condenser water?' },
    { role: 'TECH', t: 'Ninety six.' },
    { role: 'HVACUE', t: 'Condenser delta-T is 12 degrees — within range, so water is moving. Next I need condenser-water flow and discharge pressure to separate a heat-transfer problem from a refrigerant-side problem.' },
  ],
  split: [
    { role: 'TECH', t: 'HVACue, four-ton split, runs but never gets cold.' },
    { role: 'HVACUE', t: 'Understood. Outdoor ambient temperature?' },
    { role: 'TECH', t: 'Ninety two.' },
    { role: 'HVACUE', t: 'Logged, 92 degrees. Return and supply air?' },
    { role: 'TECH', t: 'Return seventy six, supply sixty eight.' },
    { role: 'HVACUE', t: 'Air split is 8 degrees — narrow, points at low capacity. Next I need suction pressure and suction line temperature so I can work out superheat.' },
  ],
};

export function VoiceOverlay({ state, actions }: { state: AppState; actions: HvacueActions }) {
  if (!state.voiceOpen) return null;
  const tree = selectTree(state.equipment);
  const lines = VOICE_SCRIPTS[tree.id] ?? VOICE_SCRIPTS.chiller;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090A', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '70px 18px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: color.cyan, animation: 'hvq-blip 1.4s infinite' }} />
        <div style={{ font: `600 10px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.16em', flex: 1 }}>VOICE MODE · LISTENING</div>
        <button
          onClick={actions.closeVoice}
          style={{ width: 34, height: 34, borderRadius: 9, background: color.chipBg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 13px/1 ${font.heading}`, color: color.textRow, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {lines.map((v, i) => {
          const isTech = v.role === 'TECH';
          return (
            <div
              key={i}
              style={{
                alignSelf: isTech ? 'flex-end' : 'flex-start', maxWidth: '84%', padding: '13px 14px', borderRadius: 14,
                background: isTech ? color.chipBg : color.cyanBg08, border: `1px solid ${isTech ? color.borderStrong2 : color.cyanBorder28}`,
              }}
            >
              <div style={{ font: `600 8.5px/1 ${font.mono}`, color: isTech ? color.textRow : color.cyan, letterSpacing: '.14em' }}>{v.role}</div>
              <div style={{ font: `500 13px/1.5 ${font.heading}`, color: '#DDE3E7', marginTop: 8 }}>{v.t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        {['"REPEAT THAT"', '"WHY?"', '"NEXT STEP"', '"SAVE THIS READING"'].map((p) => (
          <div key={p} style={{ padding: '11px 13px', borderRadius: 9, border: `1px solid ${color.borderStrong2}`, font: `500 11px/1 ${font.mono}`, color: color.textRow }}>{p}</div>
        ))}
      </div>
    </div>
  );
}

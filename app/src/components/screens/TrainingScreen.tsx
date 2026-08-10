import { color, font } from '../../theme';
import type { HvacueActions } from '../../state/useHvacueState';
import { ScreenHeader } from '../ui/primitives';

const SKILLS = [
  { n: 'Refrigeration fundamentals', p: 92, c: color.green },
  { n: 'Chiller diagnostics', p: 78, c: color.green },
  { n: 'Electrical troubleshooting', p: 64, c: color.amber },
  { n: 'Controls & BAS', p: 55, c: color.amber },
  { n: 'Airside / ductwork', p: 47, c: color.amber },
  { n: 'VRF', p: 22, c: color.red },
];

export function TrainingScreen({ actions }: { actions: HvacueActions }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Skill map" onBack={() => actions.go('home')} />
      <div style={{ padding: '0 18px' }}>
        <div style={{ borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 16 }}>
          {SKILLS.map((s) => (
            <div key={s.n} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ font: `500 12px/1 ${font.heading}`, color: color.textBody }}>{s.n}</div>
                <div style={{ font: `600 12px/1 ${font.mono}`, color: s.c }}>{s.p}%</div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.07)', marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: 5, borderRadius: 3, background: s.c, width: `${s.p}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, borderRadius: 12, background: color.card, border: `1px solid ${color.border}`, padding: 15 }}>
          <div style={{ font: `600 14px/1.2 ${font.heading}` }}>Weakest area: VRF</div>
          <div style={{ font: `500 11.5px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 8 }}>
            Level 7 covers branch controllers, addressing and EEV faults — and manufacturer procedures are not interchangeable here.
          </div>
          <div style={{ marginTop: 14, height: 48, borderRadius: 11, background: color.cyan, color: color.cyanOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11.5px/1 ${font.mono}`, letterSpacing: '.1em' }}>
            GIVE ME A SERVICE CALL
          </div>
        </div>
      </div>
    </div>
  );
}

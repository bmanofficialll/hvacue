import { color, font } from '../../theme';
import type { HvacueActions } from '../../state/useHvacueState';
import { Card, ScreenHeader } from '../ui/primitives';

const SEQUENCE = [
  'Confirm the machine is running and note load before anything else.',
  'Verify condenser-water flow — pump status, valve position, strainer differential.',
  'Read entering and leaving condenser water; compute ΔT.',
  'Convert discharge pressure to saturation temperature for this refrigerant.',
  'Compute approach against leaving water and compare to the last cleaning baseline.',
  'Clamp compressor current to confirm the machine is truly under high lift.',
  'Test for non-condensables only after flow and fouling are cleared.',
];

export function FaultScreen({ actions }: { actions: HvacueActions }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Fault code scanner" onBack={() => actions.go('home')} />
      <div style={{ margin: '0 18px', height: 196, borderRadius: 14, background: '#0E1215', border: `1px solid ${color.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '34px 44px', border: `1.5px solid ${color.cyanBorder55}`, borderRadius: 8 }} />
        <div style={{ position: 'absolute', left: 44, right: 44, top: 34, height: 2, background: color.cyan, boxShadow: `0 0 12px ${color.cyan}`, animation: 'hvq-scan 2.4s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 82, textAlign: 'center', font: `600 26px/1 ${font.mono}`, color: color.redSoft }}>P.05</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', font: `500 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.14em' }}>HOLD OVER CONTROLLER DISPLAY</div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ borderRadius: 12, background: color.card, border: `1px solid ${color.border}`, padding: 15 }}>
          <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.12em' }}>READ · CONFIDENCE HIGH</div>
          <div style={{ font: `600 17px/1.2 ${font.heading}`, marginTop: 9 }}>High discharge pressure trip</div>
          <div style={{ font: `500 11.5px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 8 }}>Code matched to the controller family on this nameplate. Meaning taken from manufacturer literature — not inferred.</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ padding: '5px 8px', borderRadius: 6, background: color.amberBg12, font: `600 9px/1 ${font.mono}`, color: color.amber, letterSpacing: '.1em' }}>MFR SPEC</div>
            <div style={{ padding: '5px 8px', borderRadius: 6, background: color.chipBg, font: `600 9px/1 ${font.mono}`, color: color.textRow, letterSpacing: '.1em' }}>IOM p.42</div>
          </div>
        </div>
        <div style={{ margin: '18px 0 10px', font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em' }}>DIAGNOSTIC SEQUENCE</div>
        <Card>
          {SEQUENCE.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderBottom: i === SEQUENCE.length - 1 ? 'none' : `1px solid ${color.borderSoft}` }}>
              <div style={{ font: `600 11px/1.3 ${font.mono}`, color: color.textFaint, width: 20, flex: 'none' }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ flex: 1, font: `500 12px/1.45 ${font.heading}`, color: color.textBody }}>{t}</div>
            </div>
          ))}
        </Card>
        <div
          onClick={() => actions.go('session')}
          style={{ marginTop: 16, height: 52, borderRadius: 12, background: color.amber, color: color.amberOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 12px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}
        >
          START GUIDED SESSION
        </div>
      </div>
    </div>
  );
}

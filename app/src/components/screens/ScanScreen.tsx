import { color, font } from '../../theme';
import { hasPtTable } from '../../engine/ptTables';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { Card, ScreenHeader } from '../ui/primitives';

export function ScanScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const E = state.equipment;
  const hasPt = hasPtTable(E.refrigerant);
  const rows: [string, string, boolean][] = [
    ['MANUFACTURER', E.manufacturer.toUpperCase(), false],
    ['MODEL', E.model, false],
    ['SERIAL', E.serial || 'NOT VISIBLE', !E.serial],
    ['TYPE', E.equipmentType.toUpperCase(), false],
    ['REFRIGERANT', E.refrigerant, !hasPt],
    ['METERING', E.meteringDevice, false],
    ['CAPACITY', E.capacityTons + ' TONS', false],
    ['ELECTRICAL', E.voltage + ' / ' + E.phase + ' / 60HZ', false],
    ['MCA / MOCP', '412 A / 500 A', true],
  ];
  const lowConfidenceCount = rows.filter((r) => r[2]).length;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Equipment identified" onBack={() => actions.go('home')} />
      <div style={{ margin: '0 18px 18px', height: 150, borderRadius: 14, background: 'repeating-linear-gradient(135deg,#12161A 0 9px,#161B20 9px 18px)', border: `1px solid ${color.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
        <div style={{ font: `500 10px/1 ${font.mono}`, color: '#6D767C', letterSpacing: '.14em' }}>NAMEPLATE PHOTO</div>
        <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDimmer }}>drop image here</div>
      </div>
      <div style={{ padding: '0 18px' }}>
        <div style={{ font: `500 12px/1.5 ${font.heading}`, color: color.textMuted, marginBottom: 12 }}>I identified this equipment as…</div>
        <Card>
          {rows.map(([k, v, bad], i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${color.borderSoft}` }}>
              <div style={{ flex: 1, font: `500 11px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.08em' }}>{k}</div>
              <div style={{ font: `600 13px/1 ${font.mono}`, color: bad ? color.redSoft : color.text }}>{v}</div>
            </div>
          ))}
        </Card>
        {lowConfidenceCount > 0 && (
          <div style={{ font: `500 10.5px/1.5 ${font.mono}`, color: color.redSoft, marginTop: 12 }}>
            {lowConfidenceCount} FIELD{lowConfidenceCount === 1 ? '' : 'S'} LOW-CONFIDENCE — TAP TO CORRECT BEFORE I USE {lowConfidenceCount === 1 ? 'IT' : 'THEM'}
          </div>
        )}
        <div
          onClick={() => actions.openEquipmentSetup('session')}
          style={{ marginTop: 16, height: 52, borderRadius: 12, background: color.amber, color: color.amberOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 12px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}
        >
          CONFIRM &amp; DIAGNOSE
        </div>
      </div>
    </div>
  );
}

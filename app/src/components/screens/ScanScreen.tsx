import { color, font } from '../../theme';
import { hasPtTable } from '../../engine/ptTables';
import { AI_OFF_MESSAGE, analyzeNameplate, isAiConfigured } from '../../engine/ai';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { Card, ScreenHeader } from '../ui/primitives';
import { PhotoCapture } from '../ui/PhotoCapture';

export function ScanScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const E = state.equipment;
  const hasPt = hasPtTable(E.refrigerant);
  const rows: [string, string, boolean][] = [
    ['MANUFACTURER', E.manufacturer.toUpperCase(), false],
    ['MODEL', E.model, false],
    ['SERIAL', E.serial || 'NOT SET', !E.serial],
    ['TYPE', E.equipmentType.toUpperCase(), false],
    ['REFRIGERANT', E.refrigerant, !hasPt],
    ['METERING', E.meteringDevice, false],
    ['CAPACITY', E.capacityTons + ' TONS', false],
    ['ELECTRICAL', E.voltage + ' / ' + E.phase, false],
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Scan equipment" subtitle="Photograph the nameplate, then confirm the details" onBack={() => actions.go('home')} />
      <div style={{ padding: '0 18px' }}>
        <PhotoCapture
          title="NAMEPLATE PHOTO"
          hint="Line up the data plate on the outdoor unit or the inside of the access panel"
          aiMessage={AI_OFF_MESSAGE}
          aiConfigured={isAiConfigured(state.ai)}
          onConnect={() => actions.openSettings('scan')}
          analyzeLabel="READ NAMEPLATE WITH AI"
          onAnalyze={async (img) => {
            const res = await analyzeNameplate(state.ai, img);
            actions.prefillEquipment(res.fields);
          }}
        />

        <div style={{ margin: '20px 0 10px', font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em' }}>CURRENT EQUIPMENT PROFILE</div>
        <Card>
          {rows.map(([k, v, bad], i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${color.borderSoft}` }}>
              <div style={{ flex: 1, font: `500 11px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.08em' }}>{k}</div>
              <div style={{ font: `600 13px/1 ${font.mono}`, color: bad ? color.redSoft : color.text }}>{v}</div>
            </div>
          ))}
        </Card>

        <div
          onClick={() => actions.openEquipmentSetup('session')}
          style={{ marginTop: 16, height: 52, borderRadius: 12, background: color.amber, color: color.amberOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 12px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}
        >
          ENTER / EDIT DETAILS &amp; DIAGNOSE
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { color, font } from '../../theme';
import type { HvacueActions } from '../../state/useHvacueState';
import { Card, ScreenHeader } from '../ui/primitives';
import { PhotoCapture } from '../ui/PhotoCapture';

const CODE_REFERENCE = [
  { code: 'HI PRESS / HP1', meaning: 'High discharge pressure trip — condenser airflow, overcharge, or non-condensables.', tree: true },
  { code: 'LO PRESS / LP1', meaning: 'Low suction pressure — low charge, restriction, low airflow, or metering device.', tree: true },
  { code: 'E5 / LOCK', meaning: 'Compressor lockout after repeated trips — clear the underlying pressure fault first.', tree: false },
  { code: 'F1 / SENSOR', meaning: 'Sensor / thermistor out of range — coil or ambient probe open or shorted.', tree: false },
  { code: 'dF / DEFROST', meaning: 'Defrost active or defrost fault on a heat pump — check reversing valve and defrost sensor.', tree: false },
];

export function FaultScreen({ actions }: { actions: HvacueActions }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Fault code" subtitle="Photograph the controller display, or pick a code below" onBack={() => actions.go('home')} />
      <div style={{ padding: '0 18px' }}>
        <PhotoCapture
          title="CONTROLLER DISPLAY"
          hint="Hold the phone square to the display so the code is sharp"
          aiMessage="AI code-reading is not connected yet. For now, match the code you see to the reference list below, or start a guided session."
        />

        <div style={{ margin: '20px 0 10px', font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em' }}>COMMON CODE REFERENCE · TAP ONE</div>
        <Card>
          {CODE_REFERENCE.map((c, i) => {
            const on = selected === c.code;
            return (
              <div
                key={c.code}
                onClick={() => setSelected(on ? null : c.code)}
                style={{ padding: 14, borderBottom: i === CODE_REFERENCE.length - 1 ? 'none' : `1px solid ${color.borderSoft}`, background: on ? color.cardAlt : 'transparent', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, font: `600 12px/1 ${font.mono}`, color: on ? color.amber : color.text }}>{c.code}</div>
                  {c.tree && <div style={{ font: `600 8.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.08em' }}>HAS TREE ›</div>}
                </div>
                {on && <div style={{ marginTop: 8, font: `500 12px/1.45 ${font.heading}`, color: color.textMuted }}>{c.meaning}</div>}
              </div>
            );
          })}
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

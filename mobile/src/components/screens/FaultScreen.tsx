import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { analyzeFaultCode, isAiConfigured } from '../../engine/ai';
import type { AppState } from '../../state/types';
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

export function FaultScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ code: string; meaning: string } | null>(null);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Fault code" subtitle="Photograph the controller display, or pick a code below" onBack={() => actions.go('home')} />
      <View style={{ paddingHorizontal: 18 }}>
        <PhotoCapture
          title="CONTROLLER DISPLAY"
          hint="Hold the phone square to the display so the code is sharp"
          aiMessage="AI code-reading is not connected yet. For now, match the code you see to the reference list below, or start a guided session."
          aiConfigured={isAiConfigured(state.ai)}
          onConnect={() => actions.openSettings('fault')}
          analyzeLabel="READ CODE WITH AI"
          onAnalyze={async (img) => {
            const res = await analyzeFaultCode(state.ai, img);
            setAiResult(res);
          }}
        />

        {aiResult && (
          <View style={{ marginTop: 14, borderRadius: 12, backgroundColor: color.cyanBg07, borderWidth: 1, borderColor: color.cyanBorder, padding: 15 }}>
            <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.2, color: color.cyan })}>AI READ · VERIFY BEFORE ACTING</Text>
            <Text style={[heading({ weight: 600, size: 18, lineHeight: 22 }), { marginTop: 9 }]}>{aiResult.code}</Text>
            <Text style={[heading({ weight: 500, size: 12.5, lineHeight: 19, color: color.textBody }), { marginTop: 8 }]}>{aiResult.meaning}</Text>
          </View>
        )}

        <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginTop: 20, marginBottom: 10 }]}>COMMON CODE REFERENCE · TAP ONE</Text>
        <Card>
          {CODE_REFERENCE.map((c, i) => {
            const on = selected === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => setSelected(on ? null : c.code)}
                style={{ padding: 14, borderBottomWidth: i === CODE_REFERENCE.length - 1 ? 0 : 1, borderColor: color.borderSoft, backgroundColor: on ? color.cardAlt : 'transparent' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={[mono({ weight: 600, size: 12, color: on ? color.amber : color.text }), { flex: 1 }]}>{c.code}</Text>
                  {c.tree && <Text style={mono({ weight: 600, size: 8.5, letterSpacing: 0.8, color: color.cyan })}>HAS TREE ›</Text>}
                </View>
                {on && <Text style={[heading({ weight: 500, size: 12, lineHeight: 17, color: color.textMuted }), { marginTop: 8 }]}>{c.meaning}</Text>}
              </Pressable>
            );
          })}
        </Card>

        <Pressable
          onPress={() => actions.go('session')}
          style={{ marginTop: 16, height: 52, borderRadius: 12, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={mono({ weight: 700, size: 12, letterSpacing: 1, color: color.amberOn })}>START GUIDED SESSION</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

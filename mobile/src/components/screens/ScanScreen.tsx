import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Scan equipment" subtitle="Photograph the nameplate, then confirm the details" onBack={() => actions.go('home')} />
      <View style={{ paddingHorizontal: 18 }}>
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

        <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginTop: 20, marginBottom: 10 }]}>CURRENT EQUIPMENT PROFILE</Text>
        <Card>
          {rows.map(([k, v, bad], i) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderColor: color.borderSoft }}>
              <Text style={[mono({ weight: 500, size: 11, letterSpacing: 0.8, color: color.textDim }), { flex: 1 }]}>{k}</Text>
              <Text style={mono({ weight: 600, size: 13, color: bad ? color.redSoft : color.text })}>{v}</Text>
            </View>
          ))}
        </Card>

        <Pressable
          onPress={() => actions.openEquipmentSetup('session')}
          style={{ marginTop: 16, height: 52, borderRadius: 12, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={mono({ weight: 700, size: 12, letterSpacing: 1, color: color.amberOn })}>ENTER / EDIT DETAILS & DIAGNOSE</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

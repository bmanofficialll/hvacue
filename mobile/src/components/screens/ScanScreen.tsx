import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Equipment identified" onBack={() => actions.go('home')} />
      <View style={{ marginHorizontal: 18, marginBottom: 18, height: 150, borderRadius: 14, backgroundColor: '#14181D', borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center', gap: 9 }}>
        <Text style={mono({ weight: 500, size: 10, letterSpacing: 1.4, color: '#6D767C' })}>NAMEPLATE PHOTO</Text>
        <Text style={mono({ weight: 500, size: 10, color: color.textDimmer })}>drop image here</Text>
      </View>
      <View style={{ paddingHorizontal: 18 }}>
        <Text style={[heading({ weight: 500, size: 12, lineHeight: 17, color: color.textMuted }), { marginBottom: 12 }]}>I identified this equipment as…</Text>
        <Card>
          {rows.map(([k, v, bad], i) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderColor: color.borderSoft }}>
              <Text style={[mono({ weight: 500, size: 11, letterSpacing: 0.8, color: color.textDim }), { flex: 1 }]}>{k}</Text>
              <Text style={mono({ weight: 600, size: 13, color: bad ? color.redSoft : color.text })}>{v}</Text>
            </View>
          ))}
        </Card>
        {lowConfidenceCount > 0 && (
          <Text style={[mono({ weight: 500, size: 10.5, lineHeight: 15, color: color.redSoft }), { marginTop: 12 }]}>
            {lowConfidenceCount} FIELD{lowConfidenceCount === 1 ? '' : 'S'} LOW-CONFIDENCE — TAP TO CORRECT BEFORE I USE {lowConfidenceCount === 1 ? 'IT' : 'THEM'}
          </Text>
        )}
        <Pressable
          onPress={() => actions.openEquipmentSetup('session')}
          style={{ marginTop: 16, height: 52, borderRadius: 12, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={mono({ weight: 700, size: 12, letterSpacing: 1, color: color.amberOn })}>CONFIRM & DIAGNOSE</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

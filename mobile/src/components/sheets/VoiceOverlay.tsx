import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { selectTree } from '../../engine/engine';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { Blip } from '../ui/Blip';

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
  const tree = selectTree(state.equipment);
  const lines = VOICE_SCRIPTS[tree.id] ?? VOICE_SCRIPTS.chiller;

  return (
    <Modal visible={state.voiceOpen} animationType="fade" onRequestClose={actions.closeVoice}>
      <View style={{ flex: 1, backgroundColor: '#07090A', paddingTop: 60, paddingHorizontal: 18, paddingBottom: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Blip color={color.cyan} duration={1400} />
          <Text style={[mono({ weight: 600, size: 10, letterSpacing: 1.6, color: color.cyan }), { flex: 1 }]}>VOICE MODE · LISTENING</Text>
          <Pressable
            onPress={actions.closeVoice}
            style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: color.chipBg, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={heading({ weight: 600, size: 13, color: color.textRow })}>✕</Text>
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1, marginTop: 22 }} contentContainerStyle={{ gap: 14 }}>
          {lines.map((v, i) => {
            const isTech = v.role === 'TECH';
            return (
              <View
                key={i}
                style={{
                  alignSelf: isTech ? 'flex-end' : 'flex-start', maxWidth: '84%', padding: 14, borderRadius: 14,
                  backgroundColor: isTech ? color.chipBg : color.cyanBg08, borderWidth: 1, borderColor: isTech ? color.borderStrong2 : color.cyanBorder28,
                }}
              >
                <Text style={mono({ weight: 600, size: 8.5, letterSpacing: 1.4, color: isTech ? color.textRow : color.cyan })}>{v.role}</Text>
                <Text style={[heading({ weight: 500, size: 13, lineHeight: 19, color: '#DDE3E7' }), { marginTop: 8 }]}>{v.t}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {['"REPEAT THAT"', '"WHY?"', '"NEXT STEP"', '"SAVE THIS READING"'].map((p) => (
            <View key={p} style={{ paddingHorizontal: 13, paddingVertical: 11, borderRadius: 9, borderWidth: 1, borderColor: color.borderStrong2 }}>
              <Text style={mono({ weight: 500, size: 11, color: color.textRow })}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

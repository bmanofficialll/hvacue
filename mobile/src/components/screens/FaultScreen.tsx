import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
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

function ScanLine() {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: 128, duration: 1200, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y]);
  return (
    <Animated.View style={{ position: 'absolute', left: 44, right: 44, top: 34, height: 2, backgroundColor: color.cyan, transform: [{ translateY: y }] }} />
  );
}

export function FaultScreen({ actions }: { actions: HvacueActions }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Fault code scanner" onBack={() => actions.go('home')} />
      <View style={{ marginHorizontal: 18, height: 196, borderRadius: 14, backgroundColor: '#0E1215', borderWidth: 1, borderColor: color.border, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: 44, right: 44, top: 34, bottom: 34, borderWidth: 1.5, borderColor: color.cyanBorder55, borderRadius: 8 }} />
        <ScanLine />
        <Text style={[mono({ weight: 600, size: 26, color: color.redSoft }), { position: 'absolute', left: 0, right: 0, top: 82, textAlign: 'center' }]}>P.05</Text>
        <Text style={[mono({ weight: 500, size: 9.5, letterSpacing: 1.4, color: color.textDim }), { position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center' }]}>
          HOLD OVER CONTROLLER DISPLAY
        </Text>
      </View>
      <View style={{ padding: 18 }}>
        <View style={{ borderRadius: 12, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, padding: 15 }}>
          <Text style={mono({ weight: 500, size: 9.5, letterSpacing: 1.2, color: color.cyan })}>READ · CONFIDENCE HIGH</Text>
          <Text style={[heading({ weight: 600, size: 17, lineHeight: 20 }), { marginTop: 9 }]}>High discharge pressure trip</Text>
          <Text style={[heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.textMuted }), { marginTop: 8 }]}>
            Code matched to the controller family on this nameplate. Meaning taken from manufacturer literature — not inferred.
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, backgroundColor: color.amberBg12 }}>
              <Text style={mono({ weight: 600, size: 9, letterSpacing: 1, color: color.amber })}>MFR SPEC</Text>
            </View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, backgroundColor: color.chipBg }}>
              <Text style={mono({ weight: 600, size: 9, letterSpacing: 1, color: color.textRow })}>IOM p.42</Text>
            </View>
          </View>
        </View>
        <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginTop: 18, marginBottom: 10 }]}>DIAGNOSTIC SEQUENCE</Text>
        <Card>
          {SEQUENCE.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, padding: 14, borderBottomWidth: i === SEQUENCE.length - 1 ? 0 : 1, borderColor: color.borderSoft }}>
              <Text style={mono({ weight: 600, size: 11, lineHeight: 15, color: color.textFaint })}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[heading({ weight: 500, size: 12, lineHeight: 17, color: color.textBody }), { flex: 1 }]}>{t}</Text>
            </View>
          ))}
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

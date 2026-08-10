import { Modal, Pressable, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { deriveKeypad } from '../../state/derive';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export function KeypadSheet({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const view = deriveKeypad(state);

  return (
    <Modal visible={!!state.keypad} transparent animationType="slide" onRequestClose={actions.closeKeypad}>
      <View style={{ flex: 1, backgroundColor: 'rgba(4,6,7,.72)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={actions.closeKeypad} />
        {view && (
          <View style={{ backgroundColor: color.sheet, borderTopWidth: 1, borderColor: color.borderStrong2, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 34 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.4, color: color.amber })}>LOG MEASUREMENT</Text>
                <Text style={[heading({ weight: 600, size: 15, lineHeight: 19 }), { marginTop: 8 }]}>{view.label}</Text>
              </View>
              <Pressable
                onPress={actions.closeKeypad}
                style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: color.chipBg, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={heading({ weight: 600, size: 13, color: color.textRow })}>✕</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginVertical: 18 }}>
              <Text style={mono({ weight: 600, size: 52, color: color.text })}>{state.draft === '' ? '0' : state.draft}</Text>
              <Text style={[mono({ weight: 600, size: 15, color: color.textDim }), { paddingBottom: 6 }]}>{view.unit}</Text>
            </View>
            <Text style={[mono({ weight: 500, size: 10.5, lineHeight: 15, color: view.hintColor }), { textAlign: 'center', minHeight: 32, paddingHorizontal: 10 }]}>
              {view.hint}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {KEYS.map((ch) => (
                <Pressable
                  key={ch}
                  onPress={() => actions.pressKey(ch)}
                  style={{
                    width: '31%', height: 54, borderRadius: 11, backgroundColor: ch === 'del' ? color.card : color.chipBg,
                    borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={mono({ weight: 600, size: 21, color: ch === 'del' ? color.textDim : color.text })}>{ch === 'del' ? '⌫' : ch}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 10 }}>
              <Pressable
                onPress={actions.openVoice}
                style={{ width: 60, height: 52, borderRadius: 12, borderWidth: 1, borderColor: color.cyanBorder, backgroundColor: color.cyanBg08, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color.cyan }} />
              </Pressable>
              <Pressable
                onPress={actions.commitReading}
                style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={mono({ weight: 700, size: 12, letterSpacing: 1.2, color: color.amberOn })}>SAVE READING</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

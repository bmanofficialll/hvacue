import { Modal, Pressable, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { selectTree } from '../../engine/engine';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';

export function RepairSheet({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const tree = selectTree(state.equipment);

  return (
    <Modal visible={state.repairOpen} transparent animationType="slide" onRequestClose={actions.closeRepair}>
      <View style={{ flex: 1, backgroundColor: 'rgba(4,6,7,.72)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={actions.closeRepair} />
        <View style={{ backgroundColor: color.sheet, borderTopWidth: 1, borderColor: color.borderStrong2, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 34 }}>
          <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.4, color: color.green })}>WHAT WAS REPAIRED?</Text>
          <Text style={[heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.textMuted }), { marginTop: 9 }]}>
            I will request the final readings that must change if this was the true root cause.
          </Text>
          <View style={{ gap: 9, marginTop: 14 }}>
            {tree.repairOptions.map((n) => (
              <Pressable
                key={n}
                onPress={() => actions.selectRepair(n)}
                style={{ padding: 15, borderRadius: 12, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong }}
              >
                <Text style={heading({ weight: 600, size: 13, lineHeight: 17, color: color.text })}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

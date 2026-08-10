import { Pressable, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';

/**
 * Shown wherever an AI feature is available but no provider key is connected.
 * Honest by design: it says the feature isn't connected and offers to connect.
 */
export function AiPlaceholder({ message, compact, onConnect }: { message: string; compact?: boolean; onConnect?: () => void }) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: 'rgba(79,209,224,.06)', borderWidth: 1, borderStyle: 'dashed', borderColor: color.cyanBorder, padding: compact ? 11 : 14, flexDirection: 'row', gap: 11, alignItems: 'flex-start' }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: color.cyanBg1, borderWidth: 1, borderColor: color.cyanBorder, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={mono({ weight: 700, size: 11, color: color.cyan })}>AI</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.3, color: color.cyan })}>AI · NOT CONNECTED</Text>
        <Text style={[heading({ weight: 500, size: 11, lineHeight: 16, color: color.textMuted }), { marginTop: 7 }]}>{message}</Text>
        {onConnect && (
          <Pressable onPress={onConnect} style={{ marginTop: 11, height: 38, borderRadius: 9, backgroundColor: color.cyan, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={mono({ weight: 700, size: 10.5, letterSpacing: 1, color: color.cyanOn })}>CONNECT AI</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

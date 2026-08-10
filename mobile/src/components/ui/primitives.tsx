import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 34, height: 34, borderRadius: 9, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong,
        alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={heading({ weight: 600, size: 17, lineHeight: 17, color: color.textRow })}>‹</Text>
    </Pressable>
  );
}

export function ScreenHeader({ title, subtitle, onBack, trailing }: { title: string; subtitle?: string; onBack: () => void; trailing?: ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <BackButton onPress={onBack} />
      <View style={{ flex: 1 }}>
        <Text style={heading({ weight: 600, size: 15 })}>{title}</Text>
        {subtitle && <Text style={heading({ weight: 500, size: 11, lineHeight: 15, color: color.textDim })}>{subtitle}</Text>}
      </View>
      {trailing}
    </View>
  );
}

export function SectionLabel({ children, style, color: c }: { children: ReactNode; style?: StyleProp<ViewStyle>; color?: string }) {
  return (
    <Text style={[mono({ weight: 600, size: 9.5, lineHeight: 12, letterSpacing: 1.5, color: c ?? color.textDim }), style]}>
      {children}
    </Text>
  );
}

export function PrimaryButton({ children, onPress, style, disabled }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{
        height: 52, borderRadius: 12, backgroundColor: color.amber,
        alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      }, style]}
    >
      <Text style={mono({ weight: 700, size: 12, lineHeight: 14, letterSpacing: 1.2, color: color.amberOn })}>{children}</Text>
    </Pressable>
  );
}

export function GhostButton({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        height: 46, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: color.borderStrong2,
        alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
      }, style]}
    >
      <Text style={mono({ weight: 600, size: 11, lineHeight: 13, letterSpacing: 0.9, color: color.textRow })}>{children}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderRadius: 12, borderWidth: 1, borderColor: color.border, overflow: 'hidden' }, style]}>
      {children}
    </View>
  );
}

export function Chip({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, backgroundColor: bg }}>
      <Text style={mono({ weight: 500, size: 9.5, lineHeight: 12, color: fg })}>{text}</Text>
    </View>
  );
}

export function ProgressBar({ pct, trackColor = 'rgba(255,255,255,.07)', fillColor, height = 4 }: { pct: number; trackColor?: string; fillColor: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' }}>
      <View style={{ height, borderRadius: height / 2, backgroundColor: fillColor, width: `${pct}%` }} />
    </View>
  );
}

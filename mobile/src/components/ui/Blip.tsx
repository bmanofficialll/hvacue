import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function Blip({ size = 9, color, duration = 1600 }: { size?: number; color: string; duration?: number }) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.25, duration: duration / 2, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, duration]);

  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }} />;
}

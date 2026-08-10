import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { color, heading, mono } from '../../theme';
import { AI_OFF_MESSAGE } from '../../engine/ai';
import { AiPlaceholder } from './AiPlaceholder';

export function PhotoCapture({
  title,
  hint,
  aiMessage = AI_OFF_MESSAGE,
}: {
  title: string;
  hint: string;
  aiMessage?: string;
}) {
  const [uri, setUri] = useState<string | null>(null);

  async function openCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', 'Enable camera access in Settings to photograph equipment.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled && res.assets[0]) setUri(res.assets[0].uri);
  }

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!res.canceled && res.assets[0]) setUri(res.assets[0].uri);
  }

  return (
    <View style={{ gap: 12 }}>
      {uri ? (
        <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: color.border }}>
          <Image source={{ uri }} style={{ width: '100%', height: 190 }} resizeMode="cover" />
          <Pressable onPress={openCamera} style={{ position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(10,12,14,.82)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={mono({ weight: 600, size: 10, letterSpacing: 0.8, color: color.text })}>RETAKE</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ height: 190, borderRadius: 14, backgroundColor: '#0E1215', borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Text style={mono({ weight: 500, size: 10, letterSpacing: 1.4, color: color.textDim })}>{title}</Text>
          <Text style={[mono({ weight: 500, size: 10, color: color.textDimmer }), { paddingHorizontal: 24, textAlign: 'center' }]}>{hint}</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 9 }}>
        <Pressable onPress={openCamera} style={{ flex: 1, height: 48, borderRadius: 11, backgroundColor: color.cyan, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={mono({ weight: 700, size: 11.5, letterSpacing: 1, color: color.cyanOn })}>📷  OPEN CAMERA</Text>
        </Pressable>
        <Pressable onPress={pickPhoto} style={{ height: 48, paddingHorizontal: 16, borderRadius: 11, borderWidth: 1, borderColor: color.borderStrong2, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={mono({ weight: 600, size: 11, letterSpacing: 0.8, color: color.textRow })}>LIBRARY</Text>
        </Pressable>
      </View>
      {uri && <AiPlaceholder message={aiMessage} />}
    </View>
  );
}

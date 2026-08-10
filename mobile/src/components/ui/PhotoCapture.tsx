import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { color, mono } from '../../theme';
import type { ImageInput } from '../../engine/ai';
import { AiPlaceholder } from './AiPlaceholder';

interface Props {
  title: string;
  hint: string;
  aiMessage: string;
  aiConfigured: boolean;
  onConnect: () => void;
  analyzeLabel?: string;
  onAnalyze?: (image: ImageInput) => Promise<void>;
}

export function PhotoCapture({ title, hint, aiMessage, aiConfigured, onConnect, analyzeLabel = 'READ WITH AI', onAnalyze }: Props) {
  const [uri, setUri] = useState<string | null>(null);
  const [image, setImage] = useState<ImageInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function accept(res: ImagePicker.ImagePickerResult) {
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    setUri(a.uri);
    setError(null);
    if (a.base64) setImage({ base64: a.base64, mimeType: a.mimeType || 'image/jpeg' });
    else setImage(null);
  }

  async function openCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', 'Enable camera access in Settings to photograph equipment.');
      return;
    }
    accept(await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true }));
  }

  async function pickPhoto() {
    accept(await ImagePicker.launchImageLibraryAsync({ quality: 0.5, base64: true }));
  }

  async function analyze() {
    if (!image || !onAnalyze) return;
    setBusy(true);
    setError(null);
    try {
      await onAnalyze(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI could not read this photo.');
    } finally {
      setBusy(false);
    }
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

      {uri && onAnalyze && aiConfigured && (
        <Pressable onPress={busy ? undefined : analyze} style={{ height: 48, borderRadius: 11, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.7 : 1 }}>
          <Text style={mono({ weight: 700, size: 11.5, letterSpacing: 1, color: color.amberOn })}>{busy ? 'READING…' : `✨  ${analyzeLabel}`}</Text>
        </Pressable>
      )}
      {error && (
        <View style={{ borderRadius: 10, backgroundColor: color.redBg09, borderWidth: 1, borderColor: color.redBorder35, padding: 12 }}>
          <Text style={mono({ weight: 500, size: 11.5, lineHeight: 17, color: color.redSoft })}>{error}</Text>
        </View>
      )}
      {uri && !aiConfigured && <AiPlaceholder message={aiMessage} onConnect={onConnect} />}
    </View>
  );
}

import { useRef, useState } from 'react';
import { color, font } from '../../theme';
import type { ImageInput } from '../../engine/ai';
import { AiPlaceholder } from './AiPlaceholder';

interface Props {
  title: string;
  hint: string;
  aiMessage: string;
  aiConfigured: boolean;
  onConnect: () => void;
  /** Shown on the AI button once a photo exists and AI is connected. */
  analyzeLabel?: string;
  onAnalyze?: (image: ImageInput) => Promise<void>;
}

function parseDataUrl(dataUrl: string): { preview: string; image: ImageInput } {
  const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl);
  const mimeType = match?.[1] || 'image/jpeg';
  const base64 = match?.[2] || '';
  return { preview: dataUrl, image: { base64, mimeType } };
}

export function PhotoCapture({ title, hint, aiMessage, aiConfigured, onConnect, analyzeLabel = 'READ WITH AI', onAnalyze }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<ImageInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { preview: p, image: img } = parseDataUrl(String(reader.result));
      setPreview(p);
      setImage(img);
      setError(null);
    };
    reader.readAsDataURL(file);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: 'none' }} />
      <input ref={libraryRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

      {preview ? (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${color.border}`, position: 'relative' }}>
          <img src={preview} alt="Captured" style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />
          <div onClick={() => cameraRef.current?.click()} style={{ position: 'absolute', right: 10, bottom: 10, background: 'rgba(10,12,14,.82)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', font: `600 10px/1 ${font.mono}`, letterSpacing: '.08em', color: color.text }}>
            RETAKE
          </div>
        </div>
      ) : (
        <div style={{ height: 190, borderRadius: 14, background: '#0E1215', border: `1px solid ${color.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.14em' }}>{title}</div>
          <div style={{ font: `500 10px/1.4 ${font.mono}`, color: color.textDimmer, padding: '0 24px', textAlign: 'center' }}>{hint}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 9 }}>
        <div onClick={() => cameraRef.current?.click()} style={{ flex: 1, height: 48, borderRadius: 11, background: color.cyan, color: color.cyanOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11.5px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}>
          📷&nbsp;&nbsp;OPEN CAMERA
        </div>
        <div onClick={() => libraryRef.current?.click()} style={{ height: 48, padding: '0 16px', borderRadius: 11, border: `1px solid ${color.borderStrong2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11px/1 ${font.mono}`, color: color.textRow, letterSpacing: '.08em', cursor: 'pointer' }}>
          UPLOAD
        </div>
      </div>

      {preview && onAnalyze && aiConfigured && (
        <div
          onClick={busy ? undefined : analyze}
          style={{ height: 48, borderRadius: 11, background: color.amber, color: color.amberOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11.5px/1 ${font.mono}`, letterSpacing: '.1em', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}
        >
          {busy ? 'READING…' : `✨  ${analyzeLabel}`}
        </div>
      )}
      {error && (
        <div style={{ borderRadius: 10, background: color.redBg09, border: `1px solid ${color.redBorder35}`, padding: 12, font: `500 11.5px/1.5 ${font.heading}`, color: color.redSoft }}>{error}</div>
      )}
      {preview && !aiConfigured && <AiPlaceholder message={aiMessage} onConnect={onConnect} />}
    </div>
  );
}

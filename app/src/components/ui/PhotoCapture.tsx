import { useRef, useState } from 'react';
import { color, font } from '../../theme';
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
  const [url, setUrl] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (url) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(file));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Hidden inputs: capture=environment opens the rear camera on phones. */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: 'none' }} />
      <input ref={libraryRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

      {url ? (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${color.border}`, position: 'relative' }}>
          <img src={url} alt="Captured" style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />
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
      {url && <AiPlaceholder message={aiMessage} />}
    </div>
  );
}

import { color, font } from '../../theme';

/**
 * Shown wherever an AI feature is available but no provider key is connected.
 * Honest by design: it says the feature isn't connected and offers to connect.
 */
export function AiPlaceholder({ message, compact, onConnect }: { message: string; compact?: boolean; onConnect?: () => void }) {
  return (
    <div
      style={{
        borderRadius: 12,
        background: 'rgba(79,209,224,.06)',
        border: `1px dashed ${color.cyanBorder}`,
        padding: compact ? 11 : 14,
        display: 'flex',
        gap: 11,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ width: 22, height: 22, borderRadius: 6, background: color.cyanBg1, border: `1px solid ${color.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', font: `700 11px/1 ${font.mono}`, color: color.cyan }}>
        AI
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.14em' }}>AI · NOT CONNECTED</div>
        <div style={{ font: `500 11px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 7 }}>{message}</div>
        {onConnect && (
          <div
            onClick={onConnect}
            style={{ marginTop: 11, height: 38, borderRadius: 9, background: color.cyan, color: color.cyanOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 10.5px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}
          >
            CONNECT AI
          </div>
        )}
      </div>
    </div>
  );
}

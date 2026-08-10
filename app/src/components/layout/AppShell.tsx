import type { ReactNode } from 'react';
import { color, font } from '../../theme';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: color.appBg,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100dvh',
          background: color.appBg,
          color: color.text,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: font.heading,
          boxShadow: '0 0 0 1px rgba(255,255,255,.04)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

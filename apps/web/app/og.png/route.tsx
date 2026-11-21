import { ImageResponse } from 'next/og';

/** Stable social-preview URL (/og.png) referenced explicitly by every marketing page. */
export const dynamic = 'force-static';

const OG_SIZE = { width: 1200, height: 630 } as const;

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 96,
        background:
          'linear-gradient(135deg, #C25E5E 0%, #C05683 20%, #A45EAA 40%, #656EC9 60%, #007CD3 80%, #0085C1 100%)',
        color: '#FFFFFF',
      }}
    >
      <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: -4 }}>Lamim</div>
      <div style={{ fontSize: 44, marginTop: 24, maxWidth: 900 }}>
        Salah, dhikr, habits and halal finance. Offline, on your device.
      </div>
    </div>,
    OG_SIZE,
  );
}

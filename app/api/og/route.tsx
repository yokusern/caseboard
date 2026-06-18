import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '80px',
        }}
      >
        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
            }}
          >
            📋
          </div>
          <span style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-2px' }}>
            CaseBoard
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: '30px', fontWeight: 600, color: '#c7d2fe', margin: '0 0 16px', textAlign: 'center' }}>
          フリーランス案件管理SaaS
        </p>
        <p style={{ fontSize: '22px', color: '#a5b4fc', margin: '0 0 60px', textAlign: 'center' }}>
          提案 → 受注 → 制作 → 入金 を1画面で管理
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['ランサーズ対応', 'ココナラ対応', '無料で5件まで', 'ドラッグ&ドロップ'].map(t => (
            <div
              key={t}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '100px',
                padding: '10px 22px',
                fontSize: '18px',
                color: '#e0e7ff',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

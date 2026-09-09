import { ImageResponse } from 'next/og';


export const alt = "HafalanKu — Platform Manajemen Hafalan Al-Qur'an";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0C313A',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #14B8A6 2%, transparent 0%), radial-gradient(circle at 75px 75px, #14B8A6 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a262d',
            padding: '60px 80px',
            borderRadius: '40px',
            border: '4px solid #14B8A6',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            {/* Simple logo representation */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                backgroundColor: '#14B8A6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '30px',
              }}
            >
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#0C313A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: '85px',
                fontWeight: '900',
                color: '#ECF3F5',
                margin: 0,
                letterSpacing: '-2px',
              }}
            >
              Hafalan<span style={{ color: '#14B8A6' }}>Ku</span>
            </h1>
          </div>
          
          <p
            style={{
              fontSize: '36px',
              color: '#9CA3AF',
              margin: '30px 0 0 0',
              textAlign: 'center',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Platform Manajemen Hafalan Al-Qur'an modern dengan integrasi notifikasi WhatsApp otomatis.
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
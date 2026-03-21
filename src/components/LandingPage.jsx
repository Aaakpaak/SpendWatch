import useExpenseStore from '../store/expenseStore'

export default function LandingPage() {
  const setScreen = useExpenseStore(s => s.setScreen)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', padding: '2rem',
      position: 'relative', overflow: 'hidden'
    }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(108,99,255,0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(56,189,248,0.1) 0%, transparent 50%)
        `
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', maxWidth: '480px', width: '100%'
      }}>

        {/* Logo */}
        <div style={{
          width: '72px', height: '72px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, #6c63ff, #38bdf8)',
          borderRadius: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px',
          boxShadow: '0 0 40px rgba(108,99,255,0.4)',
          animation: 'pulseGlow 3s ease-in-out infinite'
        }}>
          💸
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-head)',
          fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, #f1f0ff 0%, #a78bfa 60%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem'
        }}>
          SpendWatch
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text2)',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          fontWeight: 300
        }}>
          Track every rupee. Understand your money.<br />
          Make smarter decisions — every single day.
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '1.5rem',
          justifyContent: 'center', marginBottom: '2.5rem'
        }}>
          {[
            { num: '₹', label: 'Instant Log' },
            { num: '📊', label: 'Smart Charts' },
            { num: '💡', label: 'AI Insights' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-head)',
                fontSize: '1.8rem', fontWeight: 700,
                color: 'var(--accent2)'
              }}>{stat.num}</div>
              <div style={{
                fontSize: '0.75rem', color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setScreen('calendar')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '1rem 2.5rem',
            background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: '50px',
            fontFamily: 'var(--font-head)',
            fontSize: '1.1rem', fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 30px rgba(108,99,255,0.5)',
            transition: 'transform 0.2s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span>Start Tracking</span>
          <span>→</span>
        </button>

        {/* Feature cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem', marginTop: '2.5rem'
        }}>
          {[
            { icon: '📅', text: 'Calendar view' },
            { icon: '⌚', text: 'Watch picker' },
            { icon: '📱', text: 'Mobile first' },
          ].map(f => (
            <div key={f.text} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{f.icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{f.text}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(108,99,255,0.4); }
          50% { box-shadow: 0 0 60px rgba(108,99,255,0.7); }
        }
      `}</style>

    </div>
  )
}
import { useState, useEffect, useRef } from 'react'
import useExpenseStore from '../store/expenseStore'

export default function AddExpenseModal({ date, onClose }) {
  const categories  = useExpenseStore(s => s.categories)
  const addExpense  = useExpenseStore(s => s.addExpense)
  const addCategory = useExpenseStore(s => s.addCategory)

  const now = new Date()
  const [watchHour, setWatchHour]     = useState(now.getHours() % 12 || 12)
  const [watchMinute, setWatchMinute] = useState(now.getMinutes())
  const [watchMode, setWatchMode]     = useState('hour')
  const [selectedCat, setSelectedCat] = useState(null)
  const [amount, setAmount]           = useState('')
  const [note, setNote]               = useState('')
  const [showCustom, setShowCustom]   = useState(false)
  const [customIcon, setCustomIcon]   = useState('')
  const [customName, setCustomName]   = useState('')
  const [toast, setToast]             = useState('')
  const faceRef = useRef(null)

  const h  = String(watchHour).padStart(2, '0')
  const m  = String(watchMinute).padStart(2, '0')
  const hourDeg = (watchHour % 12) * 30 + watchMinute * 0.5
  const minDeg  = watchMinute * 6

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleWatchClick(e) {
    const rect = faceRef.current.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const angle = Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI + 90
    const norm  = ((angle % 360) + 360) % 360

    if (watchMode === 'hour') {
      setWatchHour(Math.round(norm / 30) % 12 || 12)
      setWatchMode('minute')
    } else {
      setWatchMinute(Math.round(norm / 6) % 60)
      setWatchMode('hour')
    }
  }

  function handleSave() {
    if (!amount || parseFloat(amount) <= 0) { showToast('Please enter an amount'); return }
    if (!selectedCat) { showToast('Please select a category'); return }

    addExpense({
      id:       Date.now().toString(),
      date,
      time:     `${h}:${m}`,
      amount:   parseFloat(amount),
      category: selectedCat,
      note:     note.trim(),
    })
    showToast('Expense added!')
    setTimeout(onClose, 600)
  }

  function handleAddCustomCat() {
    if (!customName.trim()) { showToast('Enter a category name'); return }
    const newCat = addCategory(customName.trim(), customIcon.trim() || '📝')
    setSelectedCat(newCat.id)
    setShowCustom(false)
    setCustomIcon('')
    setCustomName('')
    showToast('Category added!')
  }

  // Tick marks for watch face
  const ticks = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180
    const r = 82
    return {
      x: 100 + r * Math.cos(angle),
      y: 100 + r * Math.sin(angle),
      num: i === 0 ? 12 : i
    }
  })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '500px',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '28px 28px 0 0',
          padding: '1.5rem',
          maxHeight: '92vh', overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Handle */}
        <div style={{
          width: '40px', height: '4px',
          background: 'var(--bg4)', borderRadius: '2px',
          margin: '0 auto 1.2rem'
        }} />

        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '1.2rem',
          fontWeight: 700, textAlign: 'center', marginBottom: '1.2rem'
        }}>
          Add Expense
        </div>

        {/* ── WATCH FACE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>

          {/* Time display */}
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: '2.5rem',
            fontWeight: 700, letterSpacing: '0.05em',
            color: 'var(--accent2)', marginBottom: '1rem'
          }}>
            {h}:{m}
          </div>

          {/* Watch circle */}
          <div
            ref={faceRef}
            onClick={handleWatchClick}
            onTouchStart={handleWatchClick}
            style={{
              width: '200px', height: '200px',
              borderRadius: '50%',
              background: 'var(--bg3)',
              border: '2px solid var(--border)',
              position: 'relative', cursor: 'pointer',
              boxShadow: '0 0 40px rgba(108,99,255,0.2)',
              touchAction: 'none',
            }}
          >
            {/* SVG ticks + hands */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 200 200">
              {/* Hour numbers */}
              {ticks.map(t => (
                <text
                  key={t.num}
                  x={t.x} y={t.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="11" fill="rgba(157,155,184,0.7)"
                  fontFamily="Syne"
                >
                  {t.num}
                </text>
              ))}

              {/* Hour hand */}
              <line
                x1="100" y1="100"
                x2={100 + 50 * Math.sin((hourDeg) * Math.PI/180)}
                y2={100 - 50 * Math.cos((hourDeg) * Math.PI/180)}
                stroke="var(--text)" strokeWidth="4"
                strokeLinecap="round"
                style={{ transition: 'all 0.15s ease' }}
              />

              {/* Minute hand */}
              <line
                x1="100" y1="100"
                x2={100 + 70 * Math.sin((minDeg) * Math.PI/180)}
                y2={100 - 70 * Math.cos((minDeg) * Math.PI/180)}
                stroke="var(--accent2)" strokeWidth="3"
                strokeLinecap="round"
                style={{ transition: 'all 0.15s ease' }}
              />

              {/* Center dot */}
              <circle cx="100" cy="100" r="4" fill="var(--accent)" />
            </svg>
          </div>

          {/* Hour / Minute toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
            {['hour','minute'].map(mode => (
              <button
                key={mode}
                onClick={() => setWatchMode(mode)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px',
                  fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: watchMode === mode ? 'var(--accent)' : 'var(--bg3)',
                  color:      watchMode === mode ? '#fff'          : 'var(--text2)',
                  transition: 'all 0.2s',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── AMOUNT ── */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Amount (₹)</label>
          <input
            type="number" inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            style={inputStyle}
          />
        </div>

        {/* ── CATEGORY ── */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            Category —{' '}
            <span
              onClick={() => setShowCustom(!showCustom)}
              style={{ color: 'var(--accent2)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              or add your own
            </span>
          </label>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem'
          }}>
            {categories.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                style={{
                  background:   selectedCat === c.id ? 'rgba(108,99,255,0.2)' : 'var(--bg3)',
                  border:       `1px solid ${selectedCat === c.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '12px', padding: '0.6rem 0.3rem',
                  cursor: 'pointer', textAlign: 'center',
                  color: selectedCat === c.id ? 'var(--accent2)' : 'var(--text2)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '1.3rem' }}>{c.icon}</div>
                <div style={{ fontSize: '0.6rem', marginTop: '3px' }}>{c.name}</div>
              </div>
            ))}

            {/* Add new tile */}
            <div
              onClick={() => setShowCustom(!showCustom)}
              style={{
                background: 'var(--bg3)',
                border: '1px dashed var(--border)',
                borderRadius: '12px', padding: '0.6rem 0.3rem',
                cursor: 'pointer', textAlign: 'center', color: 'var(--text2)',
              }}
            >
              <div style={{ fontSize: '1.3rem' }}>➕</div>
              <div style={{ fontSize: '0.6rem', marginTop: '3px' }}>New</div>
            </div>
          </div>

          {/* Custom category inline form */}
          {showCustom && (
            <div style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '1rem', marginTop: '0.6rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text" placeholder="😀"
                  value={customIcon}
                  onChange={e => setCustomIcon(e.target.value)}
                  style={{ ...inputStyle, width: '64px', textAlign: 'center', fontSize: '1.3rem', padding: '0.5rem' }}
                />
                <input
                  type="text" placeholder="Category name..."
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  maxLength={14}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
              <button onClick={handleAddCustomCat} style={submitStyle}>
                + Add Category
              </button>
            </div>
          )}
        </div>

        {/* ── NOTE ── */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What was it for?"
            style={inputStyle}
          />
        </div>

        {/* ── SAVE ── */}
        <button onClick={handleSave} style={submitStyle}>
          Save Expense
        </button>
        <button onClick={onClose} style={{
          width: '100%', padding: '0.7rem',
          background: 'none', border: 'none',
          color: 'var(--text2)', cursor: 'pointer',
          fontSize: '0.9rem', marginTop: '0.5rem'
        }}>
          Cancel
        </button>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '90px', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: '30px', padding: '0.7rem 1.5rem',
          fontSize: '0.85rem', fontWeight: 500, zIndex: 300,
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '0.75rem',
  color: 'var(--text3)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: '0.4rem'
}

const inputStyle = {
  width: '100%', background: 'var(--bg3)',
  border: '1px solid var(--border)', borderRadius: '12px',
  padding: '0.75rem 1rem', color: 'var(--text)',
  fontFamily: 'var(--font-body)', fontSize: '1rem',
  outline: 'none',
}

const submitStyle = {
  width: '100%', padding: '1rem',
  background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
  border: 'none', borderRadius: '14px',
  color: '#fff', fontFamily: 'var(--font-head)',
  fontSize: '1.1rem', fontWeight: 600,
  cursor: 'pointer', marginTop: '0.5rem',
}
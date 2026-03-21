import { useState } from 'react'
import useExpenseStore from '../store/expenseStore'
import AddExpenseModal from './AddExpenseModal'
import DayDetailModal from './DayDetailModal'

export default function CalendarView() {
  const expenses     = useExpenseStore(s => s.expenses)
  const currentMonth = useExpenseStore(s => s.currentMonth)
  const setMonth     = useExpenseStore(s => s.setCurrentMonth)
  const getDayTotal  = useExpenseStore(s => s.getDayTotal)

  const [showAdd, setShowAdd]       = useState(false)
  const [showDay, setShowDay]       = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const monthDate  = new Date(currentMonth)
  const year       = monthDate.getFullYear()
  const month      = monthDate.getMonth()
  const today      = new Date()
  const todayStr   = today.toISOString().split('T')[0]

  // Summary totals
  const todayTotal = getDayTotal(todayStr)
  const monthTotal = expenses
    .filter(e => { const d = new Date(e.date); return d.getMonth()===month && d.getFullYear()===year })
    .reduce((s,e) => s + e.amount, 0)
  const yearTotal  = expenses
    .filter(e => new Date(e.date).getFullYear() === year)
    .reduce((s,e) => s + e.amount, 0)

  // Calendar grid
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()

  // Get day totals for color coding
  const dayTotals = {}
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    dayTotals[d] = getDayTotal(dateStr)
  }
  const maxSpend = Math.max(...Object.values(dayTotals), 1)

  function getSpendColor(total) {
    if (total === 0) return {}
    const pct = total / maxSpend
    if (pct < 0.33) return { background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' }
    if (pct < 0.66) return { background: 'rgba(245,158,11,0.12)',  borderColor: 'rgba(245,158,11,0.3)'  }
    return              { background: 'rgba(239,68,68,0.12)',   borderColor: 'rgba(239,68,68,0.3)'   }
  }

  function getAmountColor(total) {
    if (total === 0) return 'transparent'
    const pct = total / maxSpend
    if (pct < 0.33) return '#10b981'
    if (pct < 0.66) return '#f59e0b'
    return '#ef4444'
  }

  function formatAmount(n) {
    if (n >= 100000) return (n/100000).toFixed(1) + 'L'
    if (n >= 1000)   return (n/1000).toFixed(1) + 'k'
    return Math.round(n).toString()
  }

  function openDay(d) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    setSelectedDate(dateStr)
    setShowDay(true)
  }

  function changeMonth(dir) {
    setMonth(new Date(year, month + dir, 1))
  }

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{
        padding: '1.2rem 1.2rem 0.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>
          Calendar
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => changeMonth(-1)} style={monthBtnStyle}>‹</button>
          <span style={{ fontSize: '0.9rem', fontWeight: 500, minWidth: '130px', textAlign: 'center' }}>
            {monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} style={monthBtnStyle}>›</button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: '0.75rem', padding: '0.75rem 1.2rem'
      }}>
        {[
          { label: 'Today',      amount: todayTotal,  color: 'var(--accent2)' },
          { label: 'This Month', amount: monthTotal,  color: 'var(--accent3)' },
          { label: 'This Year',  amount: yearTotal,   color: 'var(--gold)'    },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '0.8rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700, color: s.color }}>
              ₹{formatAmount(s.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '0 1.2rem 1rem' }}>

        {/* Day name headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '4px' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', padding: '0.3rem 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px' }}>

          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d       = i + 1
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
            const total   = dayTotals[d]
            const isToday = dateStr === todayStr
            const spendStyle = getSpendColor(total)

            return (
              <div
                key={d}
                onClick={() => openDay(d)}
                style={{
                  aspectRatio: '1',
                  background: isToday ? 'rgba(108,99,255,0.12)' : (spendStyle.background || 'var(--bg2)'),
                  border: `1px solid ${isToday ? 'var(--accent)' : (spendStyle.borderColor || 'rgba(255,255,255,0.04)')}`,
                  borderRadius: '10px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', minHeight: '42px',
                  transition: 'transform 0.15s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                onMouseUp={e   => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{d}</span>
                {total > 0 && (
                  <span style={{ fontSize: '0.55rem', fontWeight: 600, color: getAmountColor(total) }}>
                    ₹{formatAmount(total)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddExpenseModal
          date={selectedDate || todayStr}
          onClose={() => setShowAdd(false)}
        />
      )}
      {showDay && selectedDate && (
        <DayDetailModal
          date={selectedDate}
          onClose={() => setShowDay(false)}
          onAddExpense={() => { setShowDay(false); setShowAdd(true) }}
        />
      )}

    </div>
  )
}

const monthBtnStyle = {
  width: '32px', height: '32px',
  background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text)',
  fontSize: '1rem', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
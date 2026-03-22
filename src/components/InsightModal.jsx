import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, ArcElement, PointElement, LineElement,
  Tooltip, Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import useExpenseStore from '../store/expenseStore'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, ArcElement, PointElement, LineElement,
  Tooltip, Filler
)

function formatAmount(n) {
  if (n >= 100000) return (n/100000).toFixed(1) + 'L'
  if (n >= 1000)   return (n/1000).toFixed(1) + 'k'
  return Math.round(n).toString()
}

const gridColor = 'rgba(255,255,255,0.04)'
const tickColor = '#9d9bb8'
const axisStyles = {
  grid:  { color: gridColor },
  ticks: { color: tickColor, font: { size: 11 } }
}

// ── TOP CATEGORY MODAL ──────────────────────────────────────────
function TopCategoryDetail({ onClose }) {
  const expenses = useExpenseStore(s => s.expenses)
  const getCat   = useExpenseStore(s => s.getCat)

  const today = new Date()
  const m = today.getMonth(), y = today.getFullYear()

  const monthExp = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === m && d.getFullYear() === y
  })

  const catTotals = {}
  monthExp.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount
  })

  const sorted = Object.entries(catTotals)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 6)

  const topCat    = sorted[0] ? getCat(sorted[0][0]) : null
  const topTotal  = sorted[0]?.[1] || 0
  const monthTotal = monthExp.reduce((s,e) => s + e.amount, 0)

  // Transactions for top category
  const topTransactions = monthExp
    .filter(e => e.category === sorted[0]?.[0])
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  return (
    <ModalShell title="Top Category Breakdown" onClose={onClose}>

      {/* Top category hero */}
      {topCat && (
        <div style={{
          background: topCat.color + '18',
          border: `1px solid ${topCat.color}44`,
          borderRadius: '16px', padding: '1rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          marginBottom: '1.2rem'
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: topCat.color + '33',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.6rem'
          }}>
            {topCat.icon}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700 }}>
              {topCat.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
              ₹{topTotal.toLocaleString('en-IN')} — {Math.round(topTotal/monthTotal*100)}% of month
            </div>
          </div>
        </div>
      )}

      {/* All categories bar */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>All categories this month</div>
        <div style={{ height: '180px' }}>
          <Bar
            data={{
              labels: sorted.map(([id]) => getCat(id).name),
              datasets: [{
                data: sorted.map(([,v]) => v),
                backgroundColor: sorted.map(([id]) => getCat(id).color + 'cc'),
                borderRadius: 6, borderSkipped: false,
              }]
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: axisStyles,
                y: { ...axisStyles, ticks: { ...axisStyles.ticks, callback: v => '₹' + formatAmount(v) } }
              }
            }}
          />
        </div>
      </div>

      {/* Recent transactions in top category */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Recent {topCat?.name} transactions</div>
        {topTransactions.map(e => (
          <div key={e.id} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '0.6rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                {e.time}{e.note ? ` · ${e.note}` : ''}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-head)', fontSize: '0.95rem',
              fontWeight: 700, color: '#ef4444'
            }}>
              ₹{e.amount.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  )
}

// ── PEAK DAY MODAL ──────────────────────────────────────────────
function PeakDayDetail({ onClose }) {
  const expenses = useExpenseStore(s => s.expenses)

  const dowNames  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const dowShort  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const dayTotals = {0:0,1:0,2:0,3:0,4:0,5:0,6:0}
  const dayCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0}

  expenses.forEach(e => {
    const dow = new Date(e.date).getDay()
    dayTotals[dow] += e.amount
    dayCounts[dow]++
  })

  const avgByDay = Array.from({length:7}, (_,i) =>
    dayCounts[i] ? Math.round(dayTotals[i] / dayCounts[i]) : 0
  )

  const peakDow   = avgByDay.indexOf(Math.max(...avgByDay))
  const peakAvg   = avgByDay[peakDow]
  const lowestDow = avgByDay.indexOf(Math.min(...avgByDay.filter(v => v > 0)))

  // Last 4 weeks of peak day spending
  const today  = new Date()
  const recent = []
  for (let w = 3; w >= 0; w--) {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + peakDow - w * 7)
    const dateStr = d.toISOString().split('T')[0]
    const total   = expenses.filter(e => e.date === dateStr).reduce((s,e) => s+e.amount, 0)
    recent.push({ label: d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }), total })
  }

  return (
    <ModalShell title="Peak Day Analysis" onClose={onClose}>

      {/* Peak day hero */}
      <div style={{
        background: 'rgba(108,99,255,0.12)',
        border: '1px solid rgba(108,99,255,0.3)',
        borderRadius: '16px', padding: '1rem',
        textAlign: 'center', marginBottom: '1.2rem'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>📅</div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent2)' }}>
          {dowNames[peakDow]}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '0.3rem' }}>
          Average spend: ₹{peakAvg.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Avg by day of week bar */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Average spend by day of week</div>
        <div style={{ height: '180px' }}>
          <Bar
            data={{
              labels: dowShort,
              datasets: [{
                data: avgByDay,
                backgroundColor: avgByDay.map((_,i) =>
                  i === peakDow
                    ? 'rgba(108,99,255,0.8)'
                    : 'rgba(108,99,255,0.25)'
                ),
                borderRadius: 6, borderSkipped: false,
              }]
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: axisStyles,
                y: { ...axisStyles, ticks: { ...axisStyles.ticks, callback: v => '₹' + formatAmount(v) } }
              }
            }}
          />
        </div>
      </div>

      {/* Last 4 occurrences */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Last 4 {dowNames[peakDow]}s</div>
        {recent.map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '0.6rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.label}</div>
            <div style={{
              fontFamily: 'var(--font-head)', fontSize: '0.95rem', fontWeight: 700,
              color: r.total > peakAvg ? '#ef4444' : '#10b981'
            }}>
              {r.total > 0 ? `₹${r.total.toLocaleString('en-IN')}` : '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{
        background: 'rgba(56,189,248,0.08)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: '12px', padding: '0.9rem',
        fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6
      }}>
        💡 Your lowest spend day is <strong style={{color:'var(--text)'}}>{dowNames[lowestDow]}</strong>. Try moving non-urgent purchases to that day.
      </div>
    </ModalShell>
  )
}

// ── MONTH COMPARISON MODAL ──────────────────────────────────────
function MonthComparisonDetail({ onClose }) {
  const expenses = useExpenseStore(s => s.expenses)
  const getCat   = useExpenseStore(s => s.getCat)

  const today = new Date()
  const m = today.getMonth(), y = today.getFullYear()
  const pm = (m - 1 + 12) % 12
  const py = m === 0 ? y - 1 : y

  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === m && d.getFullYear() === y
  })
  const prevMonth = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === pm && d.getFullYear() === py
  })

  const thisTotal = thisMonth.reduce((s,e) => s+e.amount, 0)
  const prevTotal = prevMonth.reduce((s,e) => s+e.amount, 0)
  const diff      = thisTotal - prevTotal
  const pct       = prevTotal > 0 ? Math.round(diff/prevTotal*100) : 0

  // Category comparison
  const thisCats = {}, prevCats = {}
  thisMonth.forEach(e => { thisCats[e.category] = (thisCats[e.category]||0) + e.amount })
  prevMonth.forEach(e => { prevCats[e.category] = (prevCats[e.category]||0) + e.amount })

  const allCatIds = [...new Set([...Object.keys(thisCats), ...Object.keys(prevCats)])]
  const catRows   = allCatIds
    .map(id => ({
      cat:   getCat(id),
      thisM: thisCats[id] || 0,
      prevM: prevCats[id] || 0,
    }))
    .sort((a,b) => b.thisM - a.thisM)
    .slice(0, 6)

  const thisMonthName = today.toLocaleDateString('en-IN', { month: 'long' })
  const prevMonthName = new Date(py, pm).toLocaleDateString('en-IN', { month: 'long' })

  // Line chart: last 6 months
  const lineLabels = [], lineData = []
  for (let i = 5; i >= 0; i--) {
    const d  = new Date(y, m - i, 1)
    const lm = d.getMonth(), ly = d.getFullYear()
    const total = expenses
      .filter(e => { const ed = new Date(e.date); return ed.getMonth()===lm && ed.getFullYear()===ly })
      .reduce((s,e) => s+e.amount, 0)
    lineLabels.push(d.toLocaleDateString('en-IN', { month: 'short' }))
    lineData.push(total)
  }

  return (
    <ModalShell title="Month Comparison" onClose={onClose}>

      {/* This vs last month hero */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem', marginBottom: '1.2rem'
      }}>
        {[
          { label: prevMonthName, total: prevTotal, color: 'var(--text2)' },
          { label: thisMonthName, total: thisTotal, color: diff > 0 ? '#ef4444' : '#10b981' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '1rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 700, color: s.color }}>
              ₹{formatAmount(s.total)}
            </div>
          </div>
        ))}
      </div>

      {/* Difference pill */}
      <div style={{
        textAlign: 'center', marginBottom: '1.2rem',
        padding: '0.6rem 1rem',
        background: diff > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
        border: `1px solid ${diff > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
        borderRadius: '12px',
        fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 600,
        color: diff > 0 ? '#ef4444' : '#10b981'
      }}>
        {diff > 0 ? '▲' : '▼'} ₹{Math.abs(diff).toLocaleString('en-IN')} ({Math.abs(pct)}% {diff > 0 ? 'more' : 'less'})
      </div>

      {/* 6 month trend */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>6-month trend</div>
        <div style={{ height: '160px' }}>
          <Line
            data={{
              labels: lineLabels,
              datasets: [{
                data: lineData,
                borderColor: '#6c63ff',
                backgroundColor: 'rgba(108,99,255,0.1)',
                fill: true, tension: 0.4,
                pointBackgroundColor: '#a78bfa',
                pointRadius: 5,
              }]
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: axisStyles,
                y: { ...axisStyles, ticks: { ...axisStyles.ticks, callback: v => '₹' + formatAmount(v) } }
              }
            }}
          />
        </div>
      </div>

      {/* Category comparison table */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Category breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem 1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Category</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', textAlign: 'right' }}>{prevMonthName}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', textAlign: 'right' }}>{thisMonthName}</div>

          {catRows.map(r => (
            <>
              <div key={r.cat.id + 'name'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span>{r.cat.icon}</span> {r.cat.name}
              </div>
              <div key={r.cat.id + 'prev'} style={{ fontSize: '0.85rem', color: 'var(--text2)', textAlign: 'right' }}>
                {r.prevM > 0 ? `₹${formatAmount(r.prevM)}` : '—'}
              </div>
              <div key={r.cat.id + 'this'} style={{
                fontSize: '0.85rem', fontWeight: 600, textAlign: 'right',
                color: r.thisM > r.prevM ? '#ef4444' : r.thisM < r.prevM ? '#10b981' : 'var(--text)'
              }}>
                {r.thisM > 0 ? `₹${formatAmount(r.thisM)}` : '—'}
              </div>
            </>
          ))}
        </div>
      </div>
    </ModalShell>
  )
}

// ── SHARED MODAL SHELL ──────────────────────────────────────────
function ModalShell({ title, onClose, children }) {
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
          maxHeight: '88vh', overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{
          width: '40px', height: '4px',
          background: 'var(--bg4)', borderRadius: '2px',
          margin: '0 auto 1.2rem'
        }} />
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '1.2rem',
          fontWeight: 700, textAlign: 'center', marginBottom: '1.2rem'
        }}>
          {title}
        </div>

        {children}

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '0.8rem',
            background: 'none', border: 'none',
            color: 'var(--text2)', cursor: 'pointer',
            fontSize: '0.9rem', marginTop: '1rem'
          }}
        >
          Close
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const sectionStyle = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: '14px', padding: '1rem',
  marginBottom: '0.8rem'
}

const sectionTitleStyle = {
  fontFamily: 'var(--font-head)',
  fontSize: '0.85rem', fontWeight: 600,
  color: 'var(--text2)', marginBottom: '0.8rem',
  textTransform: 'uppercase', letterSpacing: '0.05em'
}

export { TopCategoryDetail, PeakDayDetail, MonthComparisonDetail }
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

export default function Analytics() {
  const expenses   = useExpenseStore(s => s.expenses)
  const categories = useExpenseStore(s => s.categories)
  const getCat     = useExpenseStore(s => s.getCat)

  const today = new Date()
  const m     = today.getMonth()
  const y     = today.getFullYear()

  // ── Bar chart: last 14 days ──
  const barLabels = []
  const barData   = []
  for (let i = 13; i >= 0; i--) {
    const d       = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const total   = expenses
      .filter(e => e.date === dateStr)
      .reduce((s, e) => s + e.amount, 0)
    barLabels.push(d.getDate().toString())
    barData.push(total)
  }

  // ── Donut chart: this month by category ──
  const monthExp = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === m && d.getFullYear() === y
  })
  const catTotals = {}
  monthExp.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount
  })
  const donutLabels  = []
  const donutData    = []
  const donutColors  = []
  categories.forEach(c => {
    if (catTotals[c.id]) {
      donutLabels.push(c.name)
      donutData.push(catTotals[c.id])
      donutColors.push(c.color)
    }
  })

  // ── Line chart: last 6 months ──
  const lineLabels = []
  const lineData   = []
  for (let i = 5; i >= 0; i--) {
    const d      = new Date(y, m - i, 1)
    const lm     = d.getMonth()
    const ly     = d.getFullYear()
    const total  = expenses
      .filter(e => {
        const ed = new Date(e.date)
        return ed.getMonth() === lm && ed.getFullYear() === ly
      })
      .reduce((s, e) => s + e.amount, 0)
    lineLabels.push(d.toLocaleDateString('en-IN', { month: 'short' }))
    lineData.push(total)
  }

  // ── Chart options ──
  const gridColor  = 'rgba(255,255,255,0.04)'
  const tickColor  = '#9d9bb8'
  const tickFont   = { size: 11 }

  const axisStyles = {
    grid:  { color: gridColor },
    ticks: { color: tickColor, font: tickFont }
  }

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: axisStyles,
      y: {
        ...axisStyles,
        ticks: {
          ...axisStyles.ticks,
          callback: v => '₹' + formatAmount(v)
        }
      }
    }
  }

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: axisStyles,
      y: {
        ...axisStyles,
        ticks: {
          ...axisStyles.ticks,
          callback: v => '₹' + formatAmount(v)
        }
      }
    }
  }

  const donutOptions = {
    responsive: true, maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ₹${ctx.raw.toLocaleString('en-IN')}`
        }
      }
    }
  }

  const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0)

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ padding: '1.2rem 1.2rem 0.5rem' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>
          Analytics
        </div>
      </div>

      <div style={{ padding: '0 1.2rem' }}>

        {/* ── Bar chart ── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Daily Spending (Last 14 days)</div>
          <div style={{ height: '200px' }}>
            <Bar
              data={{
                labels: barLabels,
                datasets: [{
                  data: barData,
                  backgroundColor: barData.map(v =>
                    v > 0 ? 'rgba(108,99,255,0.7)' : 'rgba(108,99,255,0.15)'
                  ),
                  borderRadius: 6,
                  borderSkipped: false,
                }]
              }}
              options={barOptions}
            />
          </div>
        </div>

        {/* ── Donut chart ── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Spending by Category</div>
          {donutData.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text3)', padding: '3rem 0' }}>
              No data this month yet
            </p>
          ) : (
            <>
              <div style={{ height: '220px' }}>
                <Doughnut
                  data={{
                    labels: donutLabels,
                    datasets: [{
                      data: donutData,
                      backgroundColor: donutColors,
                      borderWidth: 0,
                      hoverOffset: 4,
                    }]
                  }}
                  options={donutOptions}
                />
              </div>

              {/* Legend */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem', marginTop: '1rem'
              }}>
                {donutLabels.map((label, i) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{
                      width: '10px', height: '10px',
                      borderRadius: '50%',
                      background: donutColors[i],
                      flexShrink: 0
                    }} />
                    <span style={{ color: 'var(--text2)' }}>
                      {label}:{' '}
                      <strong style={{ color: 'var(--text)' }}>
                        ₹{formatAmount(donutData[i])}
                      </strong>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Line chart ── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Monthly Trend (Last 6 months)</div>
          <div style={{ height: '200px' }}>
            <Line
              data={{
                labels: lineLabels,
                datasets: [{
                  data: lineData,
                  borderColor: '#6c63ff',
                  backgroundColor: 'rgba(108,99,255,0.1)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#a78bfa',
                  pointRadius: 5,
                }]
              }}
              options={lineOptions}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

const cardStyle = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '1.2rem',
  marginBottom: '1rem',
}

const cardTitleStyle = {
  fontFamily: 'var(--font-head)',
  fontSize: '1rem', fontWeight: 600,
  marginBottom: '1rem',
}
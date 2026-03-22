import { useState } from 'react'
import useExpenseStore from '../store/expenseStore'
import { TopCategoryDetail, PeakDayDetail, MonthComparisonDetail } from './InsightModal'

export default function Insights() {
  const expenses = useExpenseStore(s => s.expenses)
  const getCat   = useExpenseStore(s => s.getCat)
  const [openModal, setOpenModal] = useState(null)

  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const m        = today.getMonth()
  const y        = today.getFullYear()

  const monthExp = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === m && d.getFullYear() === y
  })
  const prevMonthExp = expenses.filter(e => {
    const d  = new Date(e.date)
    const pm = (m - 1 + 12) % 12
    const py = m === 0 ? y - 1 : y
    return d.getMonth() === pm && d.getFullYear() === py
  })
  const todayExp = expenses.filter(e => e.date === todayStr)

  const monthTotal     = monthExp.reduce((s, e) => s + e.amount, 0)
  const prevMonthTotal = prevMonthExp.reduce((s, e) => s + e.amount, 0)
  const todayTotal     = todayExp.reduce((s, e) => s + e.amount, 0)
  const dailyAvg       = monthTotal / Math.max(today.getDate(), 1)

  const catTotals = {}
  monthExp.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount })
  const topCatEntry = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0]

  const dayTotals  = {0:0,1:0,2:0,3:0,4:0,5:0,6:0}
  const dayCounts  = {0:0,1:0,2:0,3:0,4:0,5:0,6:0}
  expenses.forEach(e => {
    const dow = new Date(e.date).getDay()
    dayTotals[dow] += e.amount
    dayCounts[dow]++
  })
  let topDow = 0
  for (let i = 1; i < 7; i++) {
    const avgI   = dayCounts[i]      ? dayTotals[i]      / dayCounts[i]      : 0
    const avgTop = dayCounts[topDow] ? dayTotals[topDow] / dayCounts[topDow] : 0
    if (avgI > avgTop) topDow = i
  }
  const dowNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  const tagColors = {
    warning: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
    good:    { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
    tip:     { bg: 'rgba(108,99,255,0.15)',  color: '#a78bfa' },
    info:    { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' },
  }

  const insights = []

  if (prevMonthTotal > 0 && monthTotal > 0) {
    const pct = Math.round((monthTotal - prevMonthTotal) / prevMonthTotal * 100)
    if (pct > 10) {
      insights.push({
        icon: '📈', bg: 'rgba(239,68,68,0.12)',
        tag: 'warning', tagText: 'Spending Up',
        title: `${pct}% more than last month`,
        desc: `₹${monthTotal.toLocaleString('en-IN')} this month vs ₹${prevMonthTotal.toLocaleString('en-IN')} last month.`,
        modal: 'month', cta: 'See breakdown →'
      })
    } else if (pct < -10) {
      insights.push({
        icon: '📉', bg: 'rgba(16,185,129,0.12)',
        tag: 'good', tagText: 'Great Job!',
        title: `${Math.abs(pct)}% less than last month`,
        desc: `You saved ₹${Math.abs(monthTotal - prevMonthTotal).toLocaleString('en-IN')} vs last month.`,
        modal: 'month', cta: 'See comparison →'
      })
    }
  }

  if (topCatEntry) {
    const cat = getCat(topCatEntry[0])
    const pct = Math.round(topCatEntry[1] / monthTotal * 100)
    insights.push({
      icon: cat.icon, bg: cat.color + '22',
      tag: 'info', tagText: 'Top Category',
      title: `${cat.name} is your top expense`,
      desc: `₹${topCatEntry[1].toLocaleString('en-IN')} — ${pct}% of your spending this month.`,
      modal: 'category', cta: 'See all transactions →'
    })
  }

  if (dayCounts[topDow] > 0) {
    insights.push({
      icon: '📅', bg: 'rgba(108,99,255,0.12)',
      tag: 'tip', tagText: 'Spending Pattern',
      title: `${dowNames[topDow]}s cost you the most`,
      desc: `You spend the most on ${dowNames[topDow]}s on average.`,
      modal: 'peakday', cta: 'See day analysis →'
    })
  }

  if (todayTotal > 0 && todayTotal > dailyAvg * 1.5) {
    insights.push({
      icon: '⚠️', bg: 'rgba(245,158,11,0.12)',
      tag: 'warning', tagText: 'High Day',
      title: `Today is an expensive day`,
      desc: `₹${todayTotal.toLocaleString('en-IN')} today — ${Math.round(todayTotal/dailyAvg*100-100)}% above your daily average.`,
      modal: 'month', cta: 'See month view →'
    })
  }

  insights.push({
    icon: '💡', bg: 'rgba(56,189,248,0.12)',
    tag: 'tip', tagText: 'Pro Tip',
    title: 'Track every transaction',
    desc: 'Users who log daily are 3x more likely to meet savings goals.',
    modal: null, cta: null
  })

  return (
    <div style={{ paddingBottom: '80px' }}>

      <div style={{ padding: '1.2rem 1.2rem 0.5rem' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>
          Insights
        </div>
      </div>

      <div style={{ padding: '0 1.2rem' }}>
        {insights.map((ins, i) => (
          <div
            key={i}
            onClick={() => ins.modal && setOpenModal(ins.modal)}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '20px', padding: '1.2rem',
              marginBottom: '0.8rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              cursor: ins.modal ? 'pointer' : 'default',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => { if (ins.modal) e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { if (ins.modal) e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: ins.bg,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0
            }}>
              {ins.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                {ins.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5 }}>
                {ins.desc}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.6rem', borderRadius: '20px',
                  fontSize: '0.65rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: tagColors[ins.tag]?.bg,
                  color:      tagColors[ins.tag]?.color,
                }}>
                  {ins.tagText}
                </span>
                {ins.cta && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent2)', fontWeight: 500 }}>
                    {ins.cta}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {openModal === 'category' && <TopCategoryDetail    onClose={() => setOpenModal(null)} />}
      {openModal === 'peakday'  && <PeakDayDetail        onClose={() => setOpenModal(null)} />}
      {openModal === 'month'    && <MonthComparisonDetail onClose={() => setOpenModal(null)} />}
    </div>
  )
}
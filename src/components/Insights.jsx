import useExpenseStore from '../store/expenseStore'

export default function Insights() {
  const expenses = useExpenseStore(s => s.expenses)
  const getCat   = useExpenseStore(s => s.getCat)

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

  // Top category this month
  const catTotals = {}
  monthExp.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount
  })
  const topCatEntry = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0]

  // Peak day of week
  const dayTotals  = {0:0,1:0,2:0,3:0,4:0,5:0,6:0}
  const dayCounts  = {0:0,1:0,2:0,3:0,4:0,5:0,6:0}
  expenses.forEach(e => {
    const dow = new Date(e.date).getDay()
    dayTotals[dow] += e.amount
    dayCounts[dow]++
  })
  let topDow = 0
  for (let i = 1; i < 7; i++) {
    const avgI   = dayCounts[i]   ? dayTotals[i]   / dayCounts[i]   : 0
    const avgTop = dayCounts[topDow] ? dayTotals[topDow] / dayCounts[topDow] : 0
    if (avgI > avgTop) topDow = i
  }
  const dowNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  // Daily average
  const dailyAvg = monthTotal / Math.max(today.getDate(), 1)

  // Build insight cards
  const insights = []

  // Month vs prev month
  if (prevMonthTotal > 0 && monthTotal > 0) {
    const pct = Math.round((monthTotal - prevMonthTotal) / prevMonthTotal * 100)
    if (pct > 10) {
      insights.push({
        icon: '📈', bg: 'rgba(239,68,68,0.12)',
        tag: 'warning', tagText: 'Spending Up',
        title: `${pct}% more than last month`,
        desc: `You've spent ₹${monthTotal.toLocaleString('en-IN')} this month vs ₹${prevMonthTotal.toLocaleString('en-IN')} last month. Consider reviewing discretionary expenses.`
      })
    } else if (pct < -10) {
      insights.push({
        icon: '📉', bg: 'rgba(16,185,129,0.12)',
        tag: 'good', tagText: 'Great Job!',
        title: `${Math.abs(pct)}% less than last month`,
        desc: `You saved ₹${Math.abs(monthTotal - prevMonthTotal).toLocaleString('en-IN')} compared to last month. Keep it up!`
      })
    }
  }

  // Top category
  if (topCatEntry) {
    const cat = getCat(topCatEntry[0])
    const pct = Math.round(topCatEntry[1] / monthTotal * 100)
    insights.push({
      icon: cat.icon, bg: cat.color + '22',
      tag: 'info', tagText: 'Top Category',
      title: `${cat.name} is your top expense`,
      desc: `You spent ₹${topCatEntry[1].toLocaleString('en-IN')} on ${cat.name} this month — that's ${pct}% of your total spending.`
    })
  }

  // Peak day
  if (dayCounts[topDow] > 0) {
    insights.push({
      icon: '📅', bg: 'rgba(108,99,255,0.12)',
      tag: 'tip', tagText: 'Spending Pattern',
      title: `${dowNames[topDow]}s cost you the most`,
      desc: `On average you spend the most on ${dowNames[topDow]}s. Plan ahead and set a budget for this day!`
    })
  }

  // High spend today
  if (todayTotal > 0 && todayTotal > dailyAvg * 1.5) {
    insights.push({
      icon: '⚠️', bg: 'rgba(245,158,11,0.12)',
      tag: 'warning', tagText: 'High Day',
      title: `Today is an expensive day`,
      desc: `You've spent ₹${todayTotal.toLocaleString('en-IN')} today — ${Math.round(todayTotal/dailyAvg*100-100)}% above your daily average of ₹${Math.round(dailyAvg).toLocaleString('en-IN')}.`
    })
  }

  // Pro tip — always show
  insights.push({
    icon: '💡', bg: 'rgba(56,189,248,0.12)',
    tag: 'tip', tagText: 'Pro Tip',
    title: 'Track every transaction',
    desc: 'Users who log expenses daily are 3x more likely to meet their savings goals. Try logging right after every purchase.'
  })

  // Empty state
  if (insights.length === 1) {
    insights.unshift({
      icon: '🚀', bg: 'rgba(108,99,255,0.12)',
      tag: 'tip', tagText: 'Getting Started',
      title: 'Start adding expenses',
      desc: "Once you have a few days of data, you'll see personalized insights about your spending patterns here."
    })
  }

  const tagColors = {
    warning: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
    good:    { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
    tip:     { bg: 'rgba(108,99,255,0.15)',  color: '#a78bfa' },
    info:    { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' },
  }

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ padding: '1.2rem 1.2rem 0.5rem' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700 }}>
          Insights
        </div>
      </div>

      <div style={{ padding: '0 1.2rem' }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '20px', padding: '1.2rem',
            marginBottom: '0.8rem',
            display: 'flex', gap: '1rem', alignItems: 'flex-start'
          }}>
            {/* Icon */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: ins.bg,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.3rem',
              flexShrink: 0
            }}>
              {ins.icon}
            </div>

            {/* Body */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-head)',
                fontSize: '0.95rem', fontWeight: 600,
                marginBottom: '0.3rem'
              }}>
                {ins.title}
              </div>
              <div style={{
                fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5
              }}>
                {ins.desc}
              </div>
              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.65rem', fontWeight: 600,
                marginTop: '0.5rem',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                background: tagColors[ins.tag]?.bg,
                color:      tagColors[ins.tag]?.color,
              }}>
                {ins.tagText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
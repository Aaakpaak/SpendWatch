import useExpenseStore from '../store/expenseStore'

export default function DayDetailModal({ date, onClose, onAddExpense }) {
  const expenses      = useExpenseStore(s => s.expenses)
  const deleteExpense = useExpenseStore(s => s.deleteExpense)
  const getCat        = useExpenseStore(s => s.getCat)

  const d           = new Date(date)
  const dayExpenses = expenses.filter(e => e.date === date)
  const total       = dayExpenses.reduce((s, e) => s + e.amount, 0)

  const title = d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
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
          maxHeight: '85vh', overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Handle */}
        <div style={{
          width: '40px', height: '4px',
          background: 'var(--bg4)', borderRadius: '2px',
          margin: '0 auto 1.2rem'
        }} />

        {/* Title */}
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '1.2rem',
          fontWeight: 700, textAlign: 'center', marginBottom: '1.2rem'
        }}>
          {title}
        </div>

        {/* Expense list */}
        {dayExpenses.length === 0 ? (
          <p style={{
            textAlign: 'center', color: 'var(--text3)',
            padding: '1.5rem 0', fontSize: '0.9rem'
          }}>
            No expenses yet. Add one!
          </p>
        ) : (
          <>
            {dayExpenses.map(e => {
              const cat = getCat(e.category)
              return (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.8rem',
                  background: 'var(--bg3)',
                  borderRadius: '12px', marginBottom: '0.5rem'
                }}>
                  {/* Category icon */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: cat.color + '22',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    {cat.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                      {e.time}
                    </div>
                    {e.note && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>
                        {e.note}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div style={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '1rem', fontWeight: 700,
                    color: 'var(--red)'
                  }}>
                    ₹{e.amount.toLocaleString('en-IN')}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteExpense(e.id)}
                    style={{
                      width: '28px', height: '28px',
                      background: 'rgba(239,68,68,0.1)',
                      border: 'none', borderRadius: '8px',
                      color: 'var(--red)', fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            })}

            {/* Total */}
            <div style={{
              textAlign: 'right', padding: '0.5rem',
              fontFamily: 'var(--font-head)',
              fontSize: '1rem', color: 'var(--accent2)'
            }}>
              Total: ₹{total.toLocaleString('en-IN')}
            </div>
          </>
        )}

        {/* Add button */}
        <button
          onClick={onAddExpense}
          style={{
            width: '100%', padding: '1rem',
            background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
            border: 'none', borderRadius: '14px',
            color: '#fff', fontFamily: 'var(--font-head)',
            fontSize: '1.1rem', fontWeight: 600,
            cursor: 'pointer', marginTop: '0.5rem'
          }}
        >
          + Add Expense
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '0.7rem',
            background: 'none', border: 'none',
            color: 'var(--text2)', cursor: 'pointer',
            fontSize: '0.9rem', marginTop: '0.5rem'
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
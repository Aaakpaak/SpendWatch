import useExpenseStore from '../store/expenseStore'

const NAV_ITEMS = [
  { id: 'calendar',   icon: '📅', label: 'Calendar'   },
  { id: 'analytics',  icon: '📊', label: 'Analytics'  },
  { id: 'add',        icon: '＋', label: ''            },
  { id: 'insights',   icon: '💡', label: 'Insights'   },
  { id: 'categories', icon: '🗂️', label: 'Categories' },
]

export default function BottomNav({ onAddClick, onCategoriesClick }) {
  const currentScreen = useExpenseStore(s => s.currentScreen)
  const setScreen     = useExpenseStore(s => s.setScreen)

  function handleTap(id) {
    if (id === 'add')        { onAddClick?.();        return }
    if (id === 'categories') { onCategoriesClick?.(); return }
    setScreen(id)
  }

  return (
    <>
      {/* Spacer so content doesn't hide behind the nav */}
      <div style={{ height: '70px' }} />

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.5rem 0',
        height: '70px',
      }}>
        {NAV_ITEMS.map(item => {
          const isAdd    = item.id === 'add'
          const isActive = currentScreen === item.id

          if (isAdd) return (
            <button
              key="add"
              onClick={() => handleTap('add')}
              style={{
                width: '52px', height: '52px',
                background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
                borderRadius: '50%', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', color: '#fff', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(108,99,255,0.6)',
                marginTop: '-20px',
                transition: 'transform 0.2s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={e   => e.currentTarget.style.transform = 'scale(1)'}
            >
              ＋
            </button>
          )

          return (
            <button
              key={item.id}
              onClick={() => handleTap(item.id)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px',
                padding: '0.4rem 1rem',
                background: 'none', border: 'none',
                color: isActive ? 'var(--accent2)' : 'var(--text3)',
                cursor: 'pointer', flex: 1,
                transition: 'color 0.2s',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
import { useState } from 'react'
import useExpenseStore from '../store/expenseStore'

export default function CategoriesManager({ onClose }) {
  const categories    = useExpenseStore(s => s.categories)
  const addCategory   = useExpenseStore(s => s.addCategory)
  const deleteCategory = useExpenseStore(s => s.deleteCategory)

  const [newIcon, setNewIcon] = useState('')
  const [newName, setNewName] = useState('')
  const [toast, setToast]     = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleAdd() {
    if (!newName.trim()) { showToast('Enter a category name'); return }
    const exists = categories.find(c => c.name.toLowerCase() === newName.trim().toLowerCase())
    if (exists) { showToast('Category already exists'); return }
    addCategory(newName.trim(), newIcon.trim() || '📝')
    setNewIcon('')
    setNewName('')
    showToast('Category added!')
  }

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
        {/* Handle */}
        <div style={{
          width: '40px', height: '4px',
          background: 'var(--bg4)', borderRadius: '2px',
          margin: '0 auto 1.2rem'
        }} />

        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '1.2rem'
        }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 700 }}>
            Categories
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text2)',
              padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            Done
          </button>
        </div>

        {/* Add new category */}
        <div style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '1rem', marginBottom: '1.2rem'
        }}>
          <div style={{
            fontSize: '0.75rem', color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: '0.6rem'
          }}>
            Add new category
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              placeholder="😀"
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
              style={{
                ...inputStyle,
                width: '64px', textAlign: 'center',
                fontSize: '1.3rem', padding: '0.5rem'
              }}
            />
            <input
              type="text"
              placeholder="Category name (e.g. Gym, Chai, Rent...)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              maxLength={14}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <button onClick={handleAdd} style={submitStyle}>
            + Add Category
          </button>
        </div>

        {/* Category list */}
        <div style={{
          fontSize: '0.75rem', color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: '0.6rem'
        }}>
          Your categories ({categories.length})
        </div>

        {categories.map(c => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.7rem 0.8rem',
            background: 'var(--bg3)', borderRadius: '12px',
            marginBottom: '0.5rem'
          }}>
            {/* Icon */}
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: c.color + '22',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
            }}>
              {c.icon}
            </div>

            {/* Name */}
            <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>
              {c.name}
            </div>

            {/* Default badge OR delete button */}
            {c.isDefault ? (
              <span style={{
                fontSize: '0.65rem', color: 'var(--text3)',
                background: 'var(--bg4)',
                padding: '0.2rem 0.5rem', borderRadius: '6px'
              }}>
                Default
              </span>
            ) : (
              <button
                onClick={() => { deleteCategory(c.id); showToast('Category removed') }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: 'none', borderRadius: '8px',
                  color: '#ef4444', padding: '0.3rem 0.7rem',
                  cursor: 'pointer', fontSize: '0.8rem'
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '0.8rem',
            background: 'none', border: 'none',
            color: 'var(--text2)', cursor: 'pointer',
            fontSize: '0.9rem', marginTop: '0.5rem'
          }}
        >
          Close
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
          whiteSpace: 'nowrap', animation: 'fadeIn 0.3s ease',
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

const inputStyle = {
  width: '100%', background: 'var(--bg2)',
  border: '1px solid var(--border)', borderRadius: '12px',
  padding: '0.75rem 1rem', color: 'var(--text)',
  fontFamily: 'var(--font-body)', fontSize: '1rem', outline: 'none',
}

const submitStyle = {
  width: '100%', padding: '0.9rem',
  background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
  border: 'none', borderRadius: '12px',
  color: '#fff', fontFamily: 'var(--font-head)',
  fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
}
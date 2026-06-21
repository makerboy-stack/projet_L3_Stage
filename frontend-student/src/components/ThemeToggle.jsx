import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ storageKey = 'theme' }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem(storageKey) === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem(storageKey, 'dark')
    } else {
      root.removeAttribute('data-theme')
      localStorage.setItem(storageKey, 'light')
    }
  }, [dark, storageKey])

  return (
    <button
      onClick={() => setDark(d => !d)}
      title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        border: '1.5px solid var(--gray-200)',
        background: 'var(--bg-card)',
        color: 'var(--gray-500)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--primary-light)'
        e.currentTarget.style.color = 'var(--primary)'
        e.currentTarget.style.borderColor = 'var(--primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-card)'
        e.currentTarget.style.color = 'var(--gray-500)'
        e.currentTarget.style.borderColor = 'var(--gray-200)'
      }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

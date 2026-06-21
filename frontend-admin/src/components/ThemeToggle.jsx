import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ storageKey = 'admin_theme' }) {
  const [dark, setDark] = useState(() => localStorage.getItem(storageKey) === 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (dark) { root.setAttribute('data-theme', 'dark'); localStorage.setItem(storageKey, 'dark') }
    else       { root.removeAttribute('data-theme');       localStorage.setItem(storageKey, 'light') }
  }, [dark, storageKey])

  return (
    <button onClick={() => setDark(d => !d)} title={dark ? 'Mode clair' : 'Mode sombre'}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', width:34, height:34, borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', cursor:'pointer', transition:'all 0.2s', flexShrink:0 }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(59,130,246,0.15)'; e.currentTarget.style.color='var(--primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.6)' }}
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const THEMES = ['light', 'dark', 'warm']

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('benkiz-theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('benkiz-theme', theme)
  }, [theme])

  function cycleTheme() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
    setTheme(next)
  }

  function setThemeName(name) {
    if (THEMES.includes(name)) setTheme(name)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeName, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

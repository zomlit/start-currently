const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
  localStorage.setItem('vite-ui-theme', newTheme)
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(newTheme)
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext(null)

export function Router({ children }) {
  const [path, setPath] = useState(() => window.location.pathname)
  const [params, setParams] = useState({})

  useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  // Extract params from dynamic routes
  useEffect(() => {
    const match = path.match(/^\/groups\/([^/]+)/)
    if (match) {
      setParams({ groupId: match[1] })
    } else {
      setParams({})
    }
  }, [path])

  return (
    <RouterContext.Provider value={{ path, params, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  return useContext(RouterContext)
}

export function Link({ to, children, className = '', onClick }) {
  const { navigate } = useRouter()
  const handle = (e) => {
    e.preventDefault()
    if (onClick) onClick()
    navigate(to)
  }
  return <a href={to} className={className} onClick={handle}>{children}</a>
}

// Simple route matcher
export function matchRoute(pattern, path) {
  if (pattern === path) return true
  if (pattern.includes(':')) {
    const parts = pattern.split('/')
    const pathParts = path.split('/')
    if (parts.length !== pathParts.length) return false
    return parts.every((p, i) => p.startsWith(':') || p === pathParts[i])
  }
  if (pattern.endsWith('/*')) {
    return path.startsWith(pattern.slice(0, -2))
  }
  return false
}

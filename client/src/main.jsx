import { createRoot } from 'react-dom/client'
import { AppProvider } from './AppContext.jsx'
import { SocketProvider } from './SocketContext.jsx'
import { Router } from './Router.jsx'
import App from './App.jsx'
import './styles.js'  // inject CSS

const root = createRoot(document.getElementById('root'))
root.render(
  <AppProvider>
    <SocketProvider>
      <Router>
        <App />
      </Router>
    </SocketProvider>
  </AppProvider>
)

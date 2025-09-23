import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { store } from './store'
import './index.css'
import { registerServiceWorker, setupOfflineStorage } from './serviceWorkerRegistration'
import './i18n' // Import i18n configuration

// Register service worker for offline capabilities
registerServiceWorker();

// Setup IndexedDB for offline storage
setupOfflineStorage()
  .then(() => console.log('Offline storage setup complete'))
  .catch(error => console.error('Offline storage setup failed:', error));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
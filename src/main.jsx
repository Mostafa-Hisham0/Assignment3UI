import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }

  try {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  } catch (error) {
    console.warn('MSW initialization failed, continuing without mock server:', error)
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

enableMocking()
  .then(() => {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )
  })
  .catch((error) => {
    console.error('Failed to initialize app:', error)
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <div className="min-h-screen bg-teal-500 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Initialization Error</h1>
              <p className="text-gray-700 mb-4">{error.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </ErrorBoundary>
      </React.StrictMode>
    )
  })


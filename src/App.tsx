import { useEffect } from 'react'
import pulsePrismApp from './templates/pulse-prism-app.js?raw'
import pulsePrismTemplate from './templates/pulse-prism-ui.html?raw'

const pulsePrismDocument = pulsePrismTemplate.replace('__PULSE_PRISM_APP__', pulsePrismApp)

function App() {
  useEffect(() => {
    document.title = 'Pulse Prism'
  }, [])

  return (
    <main className="app-host">
      <iframe
        title="Pulse Prism"
        srcDoc={pulsePrismDocument}
        className="app-frame"
        allow="autoplay"
        sandbox="allow-same-origin allow-scripts"
      />
    </main>
  )
}

export default App

import { FilePicker } from './components/FilePicker'
import './App.css'


function App() {

  return (
    <>
      <main className="app">
        <header className="header">
          <h1>
            Audio <span>Transcriber</span>
          </h1>
          <p>Runs entirely in your browser. Your files never leave your machine.</p>
        </header>
        <FilePicker />
      </main>
    </>
  )
}

export default App

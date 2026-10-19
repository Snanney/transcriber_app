import { useState } from 'react'
import { FilePicker } from './components/FilePicker'
import './App.css'


function App() {

  return (
    <>
      <section id="center">
        <div>
          <h1>Transcriber</h1>
        </div>
      </section>

      <FilePicker />
    </>
  )
}

export default App

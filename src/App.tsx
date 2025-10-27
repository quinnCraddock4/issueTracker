import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/login-page'

function App() {
  const [username, setUsername] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage username={username} setUsername={setUsername} />} />
        <Route path="/login" element={<LoginPage username={username} setUsername={setUsername} />} />
        <Route path="/signup" element={<div>Signup page - Coming soon!</div>} />
        <Route path="/home" element={<div>Home page - Welcome {username}!</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

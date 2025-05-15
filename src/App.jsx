// src/App.jsx
import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './App.css'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MatchesPage from './pages/MatchesPage'
import SearchPage from './pages/SearchPage'
import LandingPage from './pages/LandingPage'
import { AsideProvider } from '/src/context/AsideContext';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("http://192.168.0.5:5000/users/debug", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          // console.log("Data recibida de /debug:", data)
          setIsLoggedIn(data.authenticated)
          setUserId(data.user_id)

        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error("Error checking login status:", error)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkLoginStatus()
  }, [])

  useEffect(() => {
    if (redirectTo && !isLoading && isLoggedIn && userId !== null) {
      console.log("Redirigiendo a:", redirectTo)
      navigate(redirectTo, { replace: true })
      setRedirectTo(null)
    }
  }, [redirectTo, isLoading, isLoggedIn, userId, navigate])


  const handleLoginSuccess = (loggedInUserId, originalPath) => {
    setIsLoggedIn(true)
    setUserId(loggedInUserId)
    setRedirectTo(originalPath || '/')
    // console.log("Login exitoso, seteando redirectTo:", originalPath || '/')
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("http://192.168.0.5:5000/users/logout", { credentials: "include" })
      if (res.ok) {
        window.location.href = '/'
        setIsLoggedIn(false)

      } else {
        console.error("Logout failed on backend")
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error("Error during logout:", error)
      setIsLoggedIn(false)
    }
  }

  return (
    <div className=' w-full min-h-screen bg-gray-50 dark:bg-gray-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,216,255,0.5),rgba(255,255,255,0.9))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]'>
    <AsideProvider>
      <div className='grid-container-app' >
          {!isLoading && <Sidebar isLoggedIn={isLoggedIn} userId={userId} />}
        <div>
          <main style={{ flexGrow: 1 }} className="relative w-full min-h-screen bg-gray-50 dark:bg-gray-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,216,255,0.5),rgba(255,255,255,0.9))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            {isLoading ? (
              <div className="flex justify-center items-center fixed w-full min-h-screen bg-gray-50 dark:bg-gray-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,216,255,0.5),rgba(255,255,255,0.9))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
                <p className="text-xl text-gray-600 dark:text-gray-300">Cargando...</p>
              </div>
            )
               :<Routes>
                {isLoggedIn ? (
                    <>
                      <Route path="/" element={<HomePage currentUserId={userId} />} />
                      <Route path="/profile/:id" element={<ProfilePage onLogout={handleLogout} id={userId}/>} />
                      <Route path="/messages" element={<MessagesPage currentUserId={userId}/>} />
                      <Route path="/matches" element={<MatchesPage currentUserId={userId}/>} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/login" element={<Navigate to="/" replace />} />
                      <Route path="/register" element={<Navigate to="/" replace />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                ) : (
                  <>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile/:id" element={<Navigate to="/login" state={{ from: location.pathname }} replace />} />
                    <Route path="/messages" element={<Navigate to="/login" state={{ from: location.pathname }} replace />} />
                    <Route path="/matches" element={<Navigate to="/login" state={{ from: location.pathname }} replace />} />
                    <Route path="/search" element={<Navigate to="/login" state={{ from: location.pathname }} replace />} />
                  </>
                )}
              </Routes>}
          </main>
        </div>
      </div>
    </AsideProvider>
    </div>
  )
}

export default App
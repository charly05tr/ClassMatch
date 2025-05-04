// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MatchesPage from './pages/MatchesPage'; 
import SearchPage from './pages/SearchPage';  


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/debug", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(data.authenticated);
          setUserId(data.user_id)
        } else {
           setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);


  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

   const handleLogout = async () => {
     try {
        const res = await fetch("http://localhost:5000/logout", { credentials: "include" });
        if (res.ok) {
          setIsLoggedIn(false);
        } else {
           console.error("Logout failed on backend");
           setIsLoggedIn(false);
        }
     } catch (error) {
        console.error("Error during logout:", error);
        setIsLoggedIn(false); 
     }
  };


  return (
    <Router>
      <div style={{ display: 'flex' }} > 
        <Sidebar isLoggedIn={isLoggedIn} onLogout={handleLogout} userId={userId}/>

        <main style={{ flexGrow: 1, padding: '20px' }} className="relative  w-full min-h-screen bg-gray-50 dark:bg-gray-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,216,255,0.5),rgba(255,255,255,0.9))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"> 
          <Routes>
            <Route path="/" element={<HomePage />} />
            {isLoggedIn ? (
              <>
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/matches" element={<MatchesPage />} /> 
                <Route path="/search" element={<SearchPage />} />   
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                 <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                 <Route path="/register" element={<RegisterPage />} />
                 <Route path="/profile" element={<Navigate to="/login" replace />} />
                 <Route path="/messages" element={<Navigate to="/login" replace />} />
                 <Route path="/matches" element={<Navigate to="/login" replace />} />
                 <Route path="/search" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
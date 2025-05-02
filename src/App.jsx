// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Importa tu componente Sidebar
// Importa tus componentes de página
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MatchesPage from './pages/MatchesPage'; // Componente para Matches
import SearchPage from './pages/SearchPage';   // Componente para Buscar


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Lógica para verificar el estado de login al cargar (ej. llamada a /debug)
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/debug", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(data.authenticated);
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
     // Podrías usar useNavigate hook aquí para redirigir después del login
     // import { useNavigate } from 'react-router-dom';
     // const navigate = useNavigate(); // Dentro de un componente funcional
     // navigate('/profile');
  };

   const handleLogout = async () => {
     try {
        const res = await fetch("http://localhost:5000/logout", { credentials: "include" });
        if (res.ok) {
          setIsLoggedIn(false);
          // navigate('/login'); // Redirigir al login después del logout
        } else {
           console.error("Logout failed on backend");
           setIsLoggedIn(false); // Desloguear en el frontend incluso si falla el backend (puede que la cookie ya no sirva)
        }
     } catch (error) {
        console.error("Error during logout:", error);
        setIsLoggedIn(false); // Desloguear en el frontend
     }
  };


  return (
    <Router>
      {/* El contenedor principal podría usar CSS Grid o Flexbox para colocar el aside y el contenido */}
      <div style={{ display: 'flex' }}> {/* Ejemplo simple con flexbox */}
        {/* Sidebar se muestra siempre */}
        <Sidebar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        {/* Área de contenido donde se renderizan las páginas */}
        <main style={{ flexGrow: 1, padding: '20px' }}> {/* Ejemplo simple de estilos */}
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Rutas Protegidas */}
            {isLoggedIn ? (
              <>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/matches" element={<MatchesPage />} /> {/* Agrega Matches */}
                <Route path="/search" element={<SearchPage />} />   {/* Agrega Buscar */}
                {/* Opcional: redirigir /login y /register si ya está logueado */}
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
              </>
            ) : (
              /* Rutas accesibles solo si NO está logueado, o redirige las protegidas */
              <>
                 <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                 <Route path="/register" element={<RegisterPage />} />
                 {/* Redirige todas las rutas protegidas al login si no está logueado */}
                 <Route path="/profile" element={<Navigate to="/login" replace />} />
                 <Route path="/messages" element={<Navigate to="/login" replace />} />
                 <Route path="/matches" element={<Navigate to="/login" replace />} />
                 <Route path="/search" element={<Navigate to="/login" replace />} />
                 {/* Opcional: redirigir cualquier otra ruta no definida a login */}
                 {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
              </>
            )}

            {/* Ruta fallback para 404 (opcional) */}
            {/* <Route path="*" element={<div>404 Not Found</div>} /> */}

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
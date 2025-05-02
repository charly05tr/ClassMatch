// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css'; 


function Sidebar({ isLoggedIn, onLogout }) {
  return (
    <aside> 
      <h2>Class Match</h2>

      <Link to="/">
        <i className="fas fa-house"></i> 
        {" "} 
        Home
      </Link>

      {isLoggedIn && (
        <> 
          <Link to="/matches">
            <i className="fas fa-star"></i>
            {" "}
            Matches
          </Link>
          <Link to="/messages">
            <i className="fa-regular fa-message fa-solid"></i>
            {" "}
            Messages
          </Link>
          <Link to="/search">
            <i className="fas fa-search"></i>
            {" "}
            Buscar
          </Link>
          <Link to="/profile">
            <i className="fa-regular fa-circle-user fa-solid fa-lg"></i>
            {" "}
            Profile
          </Link>
        </>
      )}

      {isLoggedIn ? (
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textAlign: 'left' }}>
             <i className="fas fa-right-from-bracket"></i> 
             {" "}
             Cerrar Sesión
          </button>
      ) : (
         <>
             <Link to="/login">
                <i className="fas fa-sign-in-alt"></i> 
                {" "}
                Iniciar Sesión
             </Link>
             <Link to="/register">
                 <i className="fas fa-user-plus"></i> 
                 {" "}
                 Registro
             </Link>
         </>
      )}
    </aside>
  );
}

export default Sidebar;
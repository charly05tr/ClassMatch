// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css'; 


function Sidebar({ isLoggedIn, onLogout }) {
  return (
    <aside> 
      <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500">Class Match</h1>

      <Link to="/">
        <i className="fas fa-house"></i> 
        {" "} 
        <p>Home</p>
      </Link>

      {isLoggedIn && (
        <> 
          <Link to="/matches">
            <i className="fas fa-star"></i>
            {" "}
            <p>Matches</p>
          </Link>
          <Link to="/messages">
            <i className="fa-regular fa-message fa-solid"></i>
            {" "}
            <p>Messages</p>
          </Link>
          <Link to="/search">
            <i className="fas fa-search"></i>
            {" "}
            <p>Search</p>
          </Link>
          <Link to="/profile">
            <i className="fa-regular fa-circle-user fa-solid fa-lg"></i>
            {" "}
            <p>Profile</p>
          </Link>
        </>
      )}

      {isLoggedIn ? (
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textAlign: 'left' }}>
             <i className="fas fa-right-from-bracket"></i> 
             {" "}
             <p>Log Out</p>
          </button>
      ) : (
         <>
             <Link to="/login">
                <i className="fas fa-sign-in-alt"></i> 
                {" "}
                Log In
             </Link>
             <Link to="/register">
                 <i className="fas fa-user-plus"></i> 
                 {" "}
                 Register
             </Link>
         </>
      )}
    </aside>
  );
}

export default Sidebar;
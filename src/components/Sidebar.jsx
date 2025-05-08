// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
function Sidebar({ isLoggedIn, userId }) {

  return (
    <>
    {(!isLoggedIn) ? (
      <Link to="/">
      </Link>) :
      <div className='aside'>
      <aside>
          <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500">DevConnect</h1>

          {isLoggedIn && (
            <>
              <Link to="/">
                <i className="fas fa-house"></i>
                {" "}
                <p>Home</p>
              </Link>
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
              <Link to={`/profile/${userId}`}>
                <i className="fa-regular fa-circle-user fa-solid fa-lg"></i>
                {" "}
                <p>Portfolio</p>
              </Link>
            </>
          )}
          {isLoggedIn ?? (
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
      <div className='background'>
          <div className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></div>
          <div className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></div>
          <div className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></div>
          <div className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></div>
          <div className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></div>
      </div>
      </div>
      }
      </>
  );
}

export default Sidebar;
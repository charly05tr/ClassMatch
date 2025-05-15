import { Link } from 'react-router-dom'
import { useAside } from '/src/context/AsideContext'
import './sidebar.css'
import MatchesPage from '../pages/MatchesPage'
import { useState, useRef, useEffect } from 'react'

function useViewportWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  return width
}

function Sidebar({ isLoggedIn, userId }) {
  const [displayMatches, setDisplayMatches] = useState(false)
  const { isOpen } = useAside()
  const ref = useRef()

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (ref.current && !ref.current.contains(event.target)) {
  //       setDisplayMatches(false)
  //     }
  //   }
  //   document.addEventListener('pointerdown', handleClickOutside)

  //   return () => {
  //     document.removeEventListener('pointerdown', handleClickOutside)
  //   }
  // }, [])
  const viewPortWidth = useViewportWidth()

  return (
    <div className='flex aside-container' ref={ref}>
      {(!isLoggedIn) ? (
        <Link to="/">
        </Link>) :
        <div className={`${(!displayMatches) ? "aside" : "aside-no-hover"} ${(isOpen) ? "open" : "closed"}`}>
          <aside>
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500">DevConnect</h1>

            {isLoggedIn && (
              <>
                {(viewPortWidth > 800) ?
                  <img src="/logo_devconnect.png" className='size-10 mt-10'></img>:""}
                  <Link to="/" className='z-10'>
                  <i className="fas fa-house"></i>
                  {" "}
                  <p>Home</p>
                </Link>
                {(viewPortWidth < 800) ?
                  <Link to="/matches" className='z-10'>
                    <i className="fas fa-star"></i>
                    {" "}
                    <p>Matches</p>
                  </Link> :
                  <a onClick={() => setDisplayMatches(prev => !prev)} className='z-10 cursor-pointer'>
                    <i className="fas fa-star"></i>
                    {" "}
                    <p>Matches</p>
                  </a>
                }
                <Link to="/messages" className='z-10'>
                  <i className="fa-regular fa-message fa-solid"></i>
                  {" "}
                  <p>Messages</p>
                </Link>
                <Link to={`/profile/${userId}`} className='z-10'>
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
            <div className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 opacity-10 '></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
            <div className='animated-div bg-gradient-to-br from-purple-600/5 to-blue-500/5 opacity-10'></div>
          </div>
        </div>
      }
      {(displayMatches) ? (
        <div className='z-10 sticky top-0 h-[100vh] overflow-y-auto w-[350px] bg-transparent rounded-xl custom-scrollbar'>
          <MatchesPage currentUserId={userId} />
        </div>)
        : ''}
    </div>
  )
}

export default Sidebar
import { Link } from 'react-router-dom'
import { useAside } from '/src/context/AsideContext'
import './sidebar.css'
import MatchesPage from '../pages/MatchesPage'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function Sidebar({ isLoggedIn, userId }) {
  const [displayMatches, setDisplayMatches] = useState(false)
  const { isOpen } = useAside()
  const ref = useRef()

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setDisplayMatches(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [])


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
                <Link to="/" className='z-10'>
                  <i className="fas fa-house"></i>
                  {" "}
                  <p>Home</p>
                </Link>
                <a onClick={() => setDisplayMatches(prev => !prev)} className='z-10 cursor-pointer'>
                  <i className="fas fa-star"></i>
                  {" "}
                  <p>Matches</p>
                </a>
                <Link to="/messages" className='z-10'>
                  <i className="fa-regular fa-message fa-solid"></i>
                  {" "}
                  <p>Messages</p>
                </Link>
                {/* <Link to="/search">
                <i className="fas fa-search"></i>
                {" "}
                <p>Search</p> */}
                {/* </Link> */}
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
      {/* <AnimatePresence> */}
        {(displayMatches) ? (
          // <motion.div
          //   ref={ref}
          //   initial={{ opacity: 0, x: 100 }}
          //   animate={{ opacity: 1, x: 0 }}
          //   exit={{ opacity: 0, x: -100 }}
          //   transition={{
          //     type: 'spring',
          //     stiffness: 300,
          //     damping: 25
          //   }}
          //   className='z-10'
          // >

            <div className='z-10 sticky top-0 h-[100vh] overflow-y-auto'>
              <MatchesPage currentUserId={userId} />
            </div>)
          : ''}
          {/* // </motion.div>) */}
      {/* // </AnimatePresence> */}
    </div>
  )
}

export default Sidebar
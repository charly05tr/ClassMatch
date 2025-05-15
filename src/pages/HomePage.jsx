import React, { useState, useEffect, useCallback, useRef } from 'react'
import './HomePage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable';
import ProfilePage from './ProfilePage'
import './MessagePage.css'


function useViewportWidth() {
    const [width, setWidth] = useState(window.innerWidth)
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])
    return width
}


function HomePage({ currentUserId }) {

    const [users, setUsers] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const navigate = useNavigate()
    const { state } = useLocation()
    const [isSendingMatch, setIsSendingMatch] = useState(false)
    const playerRef = useRef()
    const [matches, setMatches] = useState({})
    const [loading, setLoading] = useState(true)
    const [animaDic, setAnimaDic] = useState(0)
    const viewportWidth = useViewportWidth()
    const goToProfile = (index, userId) => {
        navigate(`/profile/${userId}`, { state: { index } })
    }



    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (currentIndex < users.length - 1) {
                setAnimaDic(1)
                setCurrentIndex(currentIndex + 1)
            }
        },
        onSwipedRight: () => {
            if (currentIndex > 0) {
                setAnimaDic(-1)
                setCurrentIndex(currentIndex - 1)
            }
        },
        preventScrollOnSwipe: false,
        trackTouch: true,
        trackMouse: false,
    })

    const fetchUsersData = async () => {
        try {
            const response = await fetch(`https://api.devconnect.network/${currentUserId}`, {
                credentials: "include",
                method: "GET"
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
                setLoading(false)
            } else {
                console.error("Error fetching user data:", response.statusText)
                setLoading(false)
            }
        } catch (error) {
            console.error("Error fetching user data:", error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsersData()
    }, [])

    useEffect(() => {
        if (state?.index !== undefined) {
            setCurrentIndex(state.index)
        }
    }, [state])



    const handleSendMatch = async () => {
        if (!currentUserId) {
            console.log("Debes iniciar sesión para enviar un match.")
            return
        }
        if (!users[currentIndex].id || String(currentUserId) === String(users[currentIndex].id)) {
            console.log("No se puede enviar match a este usuario.")
            return
        }

        setIsSendingMatch(true)

        try {
            const res = await fetch(`https://api.devconnect.network/matches/${users[currentIndex].id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (res.ok) {
                const matchData = await res.json()
                fetchUsersData()

            } else {
                const errorData = await res.json()
                console.log(`Error al enviar match: ${errorData.message || res.status}`)
            }
        } catch (error) {
            console.log(`Error de red al enviar match: ${error.message}`)
        } finally {
            setIsSendingMatch(false)
        }
    }

    const fetchMatches = async () => {
        const res = await fetch(`https://api.devconnect.network/matches/user/${currentUserId}`, {
            method: "GET",
            credentials: "include"
        })
        try {
            if (res.ok) {
                const data = await res.json()
                data.forEach(match => {
                    setMatches(prevMatches => ({
                        ...prevMatches,
                        [match.matched_user_id]: match.status,
                        [match.user_id]: match.status
                    }))
                })
                setLoading(false)
                if (!loading) {
                    console.log(matches[1])
                }
            }
            else {
                console.log("error cargando los matches")
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchMatches()
    }, [users])


    return (
        <main className='overflow-y-auto h-screen custom-scrollbar-hidden'>
            {(viewportWidth > 800)?
            <form className="max-w-md mx-auto my-4 top-4 sticky">
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="search" id="default-search" className="outline-none block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-3xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 focus:border-blue-900" placeholder="Search users and projects (coming soon)" required />
                </div>
            </form>:""}
            <div className='arrow-left fixed bottom-[50%] ml-4'>
                {((!currentIndex < 1) && (viewportWidth > 800)) ?
                    <button type='button' title='backward' onClick={() => { setCurrentIndex(currentIndex - 1); setAnimaDic(-1) }}>
                        <FontAwesomeIcon icon={faArrowLeft} size="2xl" />
                    </button>
                    : ''}
            </div>
            {!loading ?
                <div className='rounded shadow touch-pan-x  overflow-y-auto h-screen' {...handlers}>
                    {users && String(currentUserId) !== String(users[currentIndex]?.id) && matches[users[currentIndex]?.id] !== 'match' ? (
                        <button
                            onClick={handleSendMatch}
                            type="button"
                            disabled={matches[users[currentIndex]?.id] === 'like'}
                            className="absolute top-[105px] right-[54px] text-white bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-500 shadow-lg shadow-yellow-500/50 dark:shadow-lg dark:shadow-yellow-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                        >
                            {matches[users[currentIndex]?.id] !== 'like' ? "Match" : "Requested"}
                        </button>
                    ) : ""}
                    <AnimatePresence mode="wait" className=" overflow-y-auto h-screen">
                        {users.length > 0 && (
                            <motion.div
                                key={users[currentIndex].id}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className=' overflow-y-auto h-screen custom-scrollbar px-5'
                            >
                                {(!loading) ?
                                    <ProfilePage id={users[currentIndex].id} isMatched={matches[users[currentIndex]?.id] === 'match'}></ProfilePage> : "Loading"}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div> : ""}
            <div className='arrow-right fixed bottom-[50%] right-0 mr-4'>
                {((currentIndex < users.length - 1) && viewportWidth > 800) ?
                    <button type='button' title='foward' onClick={() => { setCurrentIndex(currentIndex + 1); setAnimaDic(1) }}>
                        <FontAwesomeIcon icon={faArrowRight} size="2xl" />
                    </button>
                    : ''}
            </div>
        </main>
    )
}
export default HomePage

import React, { useState, useEffect } from 'react'
import './HomePage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';


const UserCard = ({ index, users, goToProfile }) => {
    
    return (
        <div className='flex justify-center  px-4'>
            <div className="bg-black-100 shadow-xl rounded-xl max-w-lg w-full min-w-[400px]">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-28 rounded-t-xl relative">
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                        {(users[index].profile_picture) ? <img src={users[index].profile_picture} alt="Profile" className='rounded-full shadow-lg w-20 h-20' /> : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 border-4 border-white"></div>}
                    </div>
                </div>
                <div className="pt-16 pb-6 px-6 text-center">
                    <h1 className="text-xl font-bold">{users[index].name} {users[index].first_name}</h1>
                    <p className="text-sm text-pink-600 font-medium mt-1">{users[index].profesion}</p>
                    <div className="mt-6 grid grid-cols-2 gap-y-10 gap-x-4 text-sm text-gray-600">
                        <div className=" bg-gray-200 rounded-lg py-4 shadow">
                            <p className='text-gray-900 font-medium text-2xl'>{users[index].match_count}</p>
                            <div className="text-yellow-500 mb-1 text-xl font-bold">⚡Matches</div>
                        </div>
                        <div className=" bg-gray-200 rounded-lg py-4 shadow">
                            <p className='text-gray-900 font-medium text-2xl'>{users[index].projects_count}</p>
                            <div className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">💼 Projects</div>
                        </div>
                        <button type="button" className="text-white bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-500 shadow-lg shadow-yellow-500/50 dark:shadow-lg dark:shadow-yellow-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">Match</button>
                        <button
                            type="button" 
                            onClick={() => goToProfile(index, users[index].id)}
                            className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2">See Portfolio</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function HomePage() {
    
    const [users, setUsers] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const navigate = useNavigate()
    const { state } = useLocation()

    const goToProfile = (index, userId) => {
        navigate(`/profile/${userId}`, { state: { index } })
    }
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("https://classmatchapi-1.onrender.com", {
                    credentials: "include",
                    method: "GET"
                })
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data)
                } else {
                    console.error("Error fetching user data:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
        
        fetchUserData();
    }, []);
    
    useEffect(() => {
        if (state?.index !== undefined) {
          setCurrentIndex(state.index);
        }
      }, [state]);

    return (
        <main className="flex flex-col px-4">
            <div className='grid-container'>
                <div className='arrow mr-4'>
                    {(!currentIndex<1)?
                    <button type='button' title='backward' onClick={() => setCurrentIndex(currentIndex-1)}>
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                    :''}
                </div>
                <div className='relative overflow-hidden rounded shadow'>
                    <AnimatePresence mode="wait">
                        {users.length > 0 && (
                            <motion.div
                            key={users[currentIndex].id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3 }}
                            >
                                <UserCard index={currentIndex} users={users} goToProfile={goToProfile}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className='arrow ml-4'>
                    {(currentIndex<users.length-1)?
                    <button type='button' title='foward' onClick={() => setCurrentIndex(currentIndex+1)}>
                        <FontAwesomeIcon icon={faArrowRight} size="lg" />
                    </button>
                    :''}
                </div>
            </div>
        </main>
    )
}
export default HomePage;


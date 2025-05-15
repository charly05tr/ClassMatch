import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as solidStar, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons'
import { useNavigate } from 'react-router-dom'

const API_URL_MATCHES = "http://192.168.0.5:5000/matches/"
const placeholder = "http://api.dicebear.com/9.x/notionists-neutral/svg?seed=placeholder-avatar"

function MatchesPage({ currentUserId }) {

    const [matches, setMatches] = useState([])
    const [isMatched, setIsMatched] = useState("")
    const navigate = useNavigate()
    const goToProfile = (userId) => {
        navigate(`/profile/${userId}`)
    }

    const fetchMatches = async () => {
        const res = await fetch(`${API_URL_MATCHES}user/${currentUserId}`, {
            method: "GET",
            credentials: "include"
        })
        try {
            if (res.ok) {
                const data = await res.json()
                console.log(data)
                setMatches(data)
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
    }, [currentUserId])

    const handleDeleteMatch = async (match_user_id) => {
        const res = await fetch(`${API_URL_MATCHES}${match_user_id}`, {
            method: "DELETE",
            credentials: "include"
        })
        try {
            if (res.ok) {
                console.log(res)
                fetchMatches()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleCreateMatch = async (match_user_id) => {
        const res = await fetch(`${API_URL_MATCHES}${match_user_id}`, {
            method: "POST",
            credentials: "include"
        })
        try {
            if (res.ok) {
                const data = await res.json()
                fetchMatches()

            } else {
                console.log("Error al crear el match")
            }
        } catch (e) {
            console.error(e)
        }
    }


    return (
        <div className='flex rounded-lg flex-col gap-2 w-full'>
            {(matches.length > 0) ?
                <>
                    <div className='rounded-lg h-fit w-full'>
                    <h1 className='text-start text-4xl font-bold pl-4 py-4 text-transparent bg-clip-text bg-gradient-to-br text-white'>Match</h1>
                      {matches.filter(match => match.status === "like" && String(match.matched_user_id) !== String(currentUserId)).length === 0 ? (
                            ''
                        ) :
                        <ul>
                            <h1 className='text-start font-bold p-4 text-transparent bg-clip-text bg-gradient-to-br text-white'>Matches requested</h1>
                            {matches.map(match => (
                                <li key={match.id}>

                                    {match.status === "like" && String(match.matched_user_id) !== String(currentUserId) ?
                                        <div className='mb-1 grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded shadow p-2 w-full text-white bg-gradient-to-r from-sky-700/50 via-blue-900/70 to-sky-900/50 hover:bg-gradient-to-br'>
                                            <img src={match.matched_user.profile_picture || placeholder} className='size-12 flex-none rounded-full bg-gray-50'></img>
                                            <button onClick={() => goToProfile(match.matched_user_id)} className='text-bold text-lg justify-self-start'>{match.matched_user.name}</button>
                                            <div className='flex flex-col justify-end items-end h-full gap-2'>
                                                <button onClick={() => handleDeleteMatch(match.matched_user_id)}>
                                                    <FontAwesomeIcon icon={faXmark} />
                                                </button>
                                                <p className='ml-2 text-xs self-end text-gray-300'>{match.timestamp}</p>
                                            </div>
                                        </div>
                                        : ''}
                                </li>
                            ))}
                        </ul>}
                    </div>
                    <div className='rounded-lg h-fit w-full'>
                        {matches.filter(match => match.status === "liked" && String(match.matched_user_id) === String(currentUserId)).length === 0 ? (
                            ''
                        ) :
                            <ul>
                                <h1 className='text-start font-bold p-4 text-transparent bg-clip-text bg-gradient-to-br text-white'>Matches received</h1>
                                {matches
                                    .filter(match => match.status === "liked" && String(match.matched_user_id) === String(currentUserId))
                                    .map(match => (
                                        <li key={match.user_id} className='mb-1 grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded shadow p-2 w-full text-white bg-gradient-to-r from-sky-700/50 via-blue-900/70 to-sky-900/50 hover:bg-gradient-to-br'>
                                            <img src={match.user.profile_picture || placeholder} className='size-12 flex-none rounded-full bg-gray-50' />
                                            <button onClick={() => goToProfile(match.user_id)} className='text-bold text-lg justify-self-start'>
                                                {match.user.name}
                                            </button>
                                            <div className='flex flex-col justify-end items-end h-full gap-2'>
                                                <button onClick={() => handleCreateMatch(match.user_id)}>
                                                    <FontAwesomeIcon icon={regularStar} />
                                                </button>
                                                <p className='ml-2 text-xs self-end text-gray-300'>{match.timestamp}</p>
                                            </div>
                                        </li>
                                    ))}
                            </ul>}
                    </div>
                    <div className='rounded h-fit'>
                         {matches.filter(match => match.status === "match" && String(match.user_id) !== String(currentUserId)).length === 0 ? (
                            ''
                        ) :
                        <ul>
                            <h1 className='text-start font-bold p-4 w-full text-transparent bg-clip-text bg-gradient-to-br text-white'>Matches</h1>
                            {matches.map(match => (
                                <li key={match.id}>
                                    {match.status === "match" && String(match.user_id) !== String(currentUserId) ?
                                        <div className='mb-1 grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded shadow p-2 w-full text-white bg-gradient-to-r from-sky-700/50 via-blue-900/70 to-sky-900/50 hover:bg-gradient-to-br'>
                                            <img src={match.user.profile_picture || placeholder} className='size-12 flex-none rounded-full bg-gray-50'></img>
                                            <button onClick={() => navigate('/messages', { state: { user: match.user } })} className='text-bold text-lg justify-self-start'>{match.user.name}</button>
                                            <div className='flex flex-col justify-end items-end h-full gap-2'>
                                                <button onClick={() => handleDeleteMatch(match.user_id)}>
                                                    <FontAwesomeIcon icon={solidStar} />
                                                </button>
                                                <p className='ml-2 text-xs self-end text-gray-300'>{match.timestamp}</p>
                                            </div>
                                        </div>
                                        : ''}
                                </li>
                            ))}
                        </ul>}
                    </div></> : <h1 className='text-center mt-[50vh] px-10 text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-500'>No matches</h1>}
        </div>
    )
}

export default MatchesPage
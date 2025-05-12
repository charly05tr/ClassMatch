import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as solidStar, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons'
import { useNavigate } from 'react-router-dom';
// end points:
// /user/<int:user_id>: los matches (cuando ya se creo un match, o los likes son mutuos) method: get
// /<int:matched_user_id>: crea un like o un match (en el caso de que el otro usuario tambien le haya dado like) method: post
// /<int:matched_user_id>: elimina un match o un like method: delete
// /status/<int:other_user_id>: verifica el estado del match method: get


const API_URL_MATCHES = "http://192.168.0.4:5000/matches/"
const placeholder = "http://api.dicebear.com/9.x/notionists-neutral/svg?seed=placeholder-avatar"

function MatchesPage({ currentUserId }) {

    const [matches, setMatches] = useState([])
    const [isMatched, setIsMatched] = useState("")
    const navigate = useNavigate()
    const goToProfile = (index, userId) => {
        navigate(`/profile/${userId}`, { state: { index } })
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
                setMatches(prev =>
                    [
                        ...prev.filter(m => m.id !== data.id),
                        data
                    ]
                );
            } else {
                console.log("Error al crear el match")
            }
        } catch (e) {
            console.error(e)
        }
    }


    return (
        <div className='grid shadow inset-shadow-initial rounded justify-start grid-rows-3 p-4 gap-2 w-fit'>
            <div className=' rounded p-4'>
                <h1 className='text-center'>Matches requested</h1>
                <hr className='mb-1 opacity-50' />
                <ul>
                    {matches.map(match => (
                        <li key={match.id}>
                            {match.status === "like" && String(match.matched_user_id) !== String(currentUserId) ?
                                <div className='flex items-center gap-2 justify-around rounded shadow p-2 w-full'>
                                    <img src={match.matched_user.profile_picture || placeholder} className='size-12 flex-none rounded-full bg-gray-50'></img>
                                    <button onClick={() => goToProfile(match.matched_user_id)} className='text-bold text-lg'>{match.matched_user.name}</button>
                                    <div className='flex flex-col justify-end items-end h-full gap-2'>
                                        <button onClick={() => handleDeleteMatch(match.matched_user_id)}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                        <p className='ml-2 text-xs self-end text-gray-500'>{match.timestamp}</p>
                                    </div>
                                </div>
                                : ''}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='rounded p-4'>
                <h1 className='text-center'>Matches received</h1>
                <hr className='mb-1 opacity-50' />
                <ul>
                    {matches.map(match => (
                        <li key={match.id}>
                            {match.status === "like" && String(match.matched_user_id) === String(currentUserId)?
                                <div className='flex items-center gap-2 justify-around rounded shadow p-2 w-full'>
                                    <img src={match.user.profile_picture || placeholder} className='size-12 flex-none rounded-full bg-gray-50'></img>
                                    <button onClick={() => goToProfile(match.user_id)} className='text-bold text-lg'>{match.user.name}</button>
                                    <div className='flex flex-col justify-end items-end h-full gap-2'>
                                        <button onClick={() => handleCreateMatch(match.user_id)}>
                                            <FontAwesomeIcon icon={regularStar} />
                                        </button>
                                        <p className='ml-2 text-xs self-end text-gray-500'>{match.timestamp}</p>
                                    </div>
                                </div>
                                : ''}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='rounded p-4'>
                <h1 className='text-center'>Matches</h1>
                <hr className='mb-1 opacity-50' />
                <ul>
                    {matches.map(match => (
                        <li key={match.id}>
                            {match.status === "match" ?
                                <div className='flex items-center gap-2 justify-around rounded shadow p-2 w-full'>
                                    <img src={match.user.profile_picture || placeholder} className='size-12 flex-none rounded-full bg-gray-50'></img>
                                    <button onClick={() => goToProfile(match.user_id)} className='text-bold text-lg'>{match.user.name}</button>
                                    <div className='flex flex-col justify-end items-end h-full gap-2'>
                                        <button onClick={() => handleDeleteMatch(match.user_id)}>
                                            <FontAwesomeIcon icon={solidStar} />
                                        </button>
                                        <p className='ml-2 text-xs self-end text-gray-500'>{match.timestamp}</p>
                                    </div>
                                </div>
                                : ''}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default MatchesPage
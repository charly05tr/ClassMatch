import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { faArrowLeft, faArchive, faCodeBranch, faCodeCommit} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConversationListItem from '../components/ConversationListItem'
import { UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { XMarkIcon, CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAside } from '/src/context/AsideContext'
import { io } from 'socket.io-client'
import './MessagePage.css'
import { debounce } from 'lodash'
const API_BASE_URL = 'https://api.devconnect.network'

function useViewportWidth() {
    const [width, setWidth] = useState(window.innerWidth)
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])
    return width
}


function MessagesPage({ currentUserId }) {
    const navigate = useNavigate()
    const WEBSOCKET_URL = `https://api.devconnect.network?userId=${currentUserId}`
    const [userSearchResults, setUserSearchResults] = useState([])
    const [isSearchingUsers, setIsSearchingUsers] = useState(false)
    const [userSearchError, setUserSearchError] = useState(null)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [conversations, setConversations] = useState([])
    const [isLoadingConversations, setIsLoadingConversations] = useState(true)
    const [conversationsError, setConversationsError] = useState(null)
    const [socket, setSocket] = useState(null)
    const [selectedConversationId, setSelectedConversationId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [messagesError, setMessagesError] = useState(null)
    const [messagePagination, setMessagePagination] = useState({
        total_items: 0,
        total_pages: 0,
        current_page: 0,
        items_per_page: 100,
        has_next: false,
        has_prev: false,
        next_page: null,
        prev_page: null,
    })
    const [inviteSearchTerm, setInviteSearchTerm] = useState('')
    const [inviteSearchResults, setInviteSearchResults] = useState([])
    const [isLoadingInviteSearch, setIsLoadingInviteSearch] = useState(false)
    const [inviteSearchError, setInviteSearchError] = useState(null)
    const [isInvitingUser, setIsInvitingUser] = useState(false)

    const [newMessageContent, setNewMessageContent] = useState('')
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [sendMessageError, setSendMessageError] = useState(null)
    const oldScrollHeightRef = useRef(0)
    const [conversationSearchTerm, setConversationSearchTerm] = useState('')
    const messagesContainerRef = useRef(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [isFormVisible, setIsFormVisible] = useState(false)
    const textareaRef = useRef(null)
    const searchResultsRef = useRef(null)
    const searchInputRef = useRef(null)
    const [isCreatingGroup, setIsCreatingGroup] = useState(false)
    const [selectedParticipants, setSelectedParticipants] = useState([])
    const [newGroupName, setNewGroupName] = useState('')
    const [isCreatingGroupConversation, setIsCreatingGroupConversation] = useState(false)
    const [createGroupError, setCreateGroupError] = useState(null)
    const [showParticipantsModal, setShowParticipantsModal] = useState(false)
    const PLACEHOLDER_PHOTO_URL = 'http://picsum.photos/200/300'
    const socketRef = useRef(null)
    const [userToDM, setUserToDM] = useState("")
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const { toggleAside } = useAside()
    const location = useLocation()
    const [repos, setRepos] = useState([])
    const getUserPhotoUrl = (user) => {
        return (user && user.profile_picture) ? user.profile_picture : PLACEHOLDER_PHOTO_URL
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date)
    }

    const waitUntilSocketReady = (callback, retries = 20, delay = 100) => {
        if (!socket) {
            if (retries === 0) return console.error("Socket aún no está listo después de varios intentos.")
            setTimeout(() => waitUntilSocketReady(callback, retries - 1, delay), delay)
        } else {
            callback()
        }
    }

    const fetchConversations = async () => {
        setIsLoadingConversations(true)
        setConversationsError(null)
        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                console.log("Conversations fetched:", data)
                setConversations(data)
            } else {
                const errorData = await res.json()
                setConversationsError(errorData.message || `Error fetching conversations: ${res.status}`)
                console.error("Error fetching conversations:", res.status, errorData)
                setConversations([])
            }
        } catch (error) {
            setConversationsError(`Network error fetching conversations: ${error.message}`)
            console.error("Network error fetching conversations:", error)
            setConversations([])
        } finally {
            setIsLoadingConversations(false)
        }
    }
    useEffect(() => {

        if (currentUserId) {
            fetchConversations()
        }
    }, [])


    const fetchMessages = useCallback(async (conversationId, page = 1, perPage = 100) => {
        console.log(`Workspaceing messages for conv ${conversationId}, page ${page}...`)
        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages?page=${page}&per_page=${perPage}`, {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                console.log(`Received messages for conv ${conversationId}, page ${page}:`, data)
                setMessages(prevMessages => {

                    if (page < messagePagination.current_page) {
                        console.log(`Prepending messages for older page ${page}.`)
                        return [...data.messages, ...prevMessages]
                    } else if (page === 1 && prevMessages.length === 0) {
                        console.log("Replacing messages with page 1 (initial).")
                        return data.messages
                    }
                    else {
                        console.log(`Replacing messages with page ${page} (assuming last page initial load).`)
                        return data.messages
                    }
                })

                setMessagePagination(data.pagination)
            } else {
                setMessages(prevMessages => page < messagePagination.current_page ? prevMessages : [])
            }
        } catch (error) {
            setMessages(prevMessages => page < messagePagination.current_page ? prevMessages : [])
        }
    }, [selectedConversationId, messagePagination.items_per_page, messagePagination.current_page])

    const handlecloseConversation = () => {
        setSelectedConversationId(null)
        if (width < 800) {
            toggleAside()
        }
    }

    useEffect(() => {
        if (selectedConversationId !== null) {
            fetchMessages(selectedConversationId, 1, messagePagination.items_per_page)
        } else {
            setMessages([])
            setMessagePagination({
                total_items: 0, total_pages: 0, current_page: 0, items_per_page: messagePagination.items_per_page,
                has_next: false, has_prev: false, next_page: null, prev_page: null,
            })
            oldScrollHeightRef.current = 0
        }

    }, [selectedConversationId, fetchMessages, messagePagination.items_per_page])


    const handlersRef = useRef({})
    useEffect(() => {
        handlersRef.current = {
            setMessages,
            setConversations,
            selectedConversationId,
            currentUserId,
            messagesContainerRef,
        }
    }, [setMessages, setConversations, selectedConversationId, currentUserId, messagesContainerRef])
    const width = useViewportWidth()

    const handleConversationSelect = useCallback((conversationId) => {
        console.log("Conversation selected:", conversationId)

        const socket = socketRef.current
        if (socket && socket.connected) {
            console.log(`Intentando unirse a la room de conversación: conversation_${conversationId}`)
            socket.emit('join_conversation', { conversation_id: conversationId })
        } else {
            console.warn("Socket no conectado, no se pudo emitir join_conversation")
        }

        setSelectedConversationId(conversationId)
        setNewMessageContent('')
        setSendMessageError(null)

        if (width < 800) {
            toggleAside()
        }
    }, [width, toggleAside])

    useEffect(() => {
        if (userToDM && isSocketConnected) {
            console.log("Socket listo y userToDM presente, iniciando DM...")

            handleSelectUserForDM(userToDM)
                .then(conversation => {
                    console.log("Conversación DM creada/obtenida:", conversation)
                    handleConversationSelect(conversation.id)
                })
                .catch(err => {
                    console.error("Error al obtener/crear conversación DM:", err)
                })
        }
    }, [userToDM, isSocketConnected])


    useEffect(() => {
        if (currentUserId !== null) {
            console.log(`Intentando conectar WebSocket para user ${currentUserId}...`)
            const newSocket = io(`${WEBSOCKET_URL}`, {
                cors: {
                    origin: "http://192.168.0.4:5173",
                    credentials: true
                }
            })
            socketRef.current = newSocket

            setSocket(newSocket)
            newSocket.on('connect', () => {
                console.log('WebSocket conectado!', newSocket.id)
                setIsSocketConnected(true)
            })

            newSocket.on('disconnect', (reason) => {
                console.log('WebSocket desconectado:', reason)
                setIsSocketConnected(false)
            })

            newSocket.on('joined_conversation', (conv) => {
                setConversations(prev => {
                    const exists = prev.some(c => String(c.id) === String(conv.id))
                    if (exists) return prev
                    return [conv, ...prev]
                })
            })

            newSocket.on('connect_error', (error) => {
                console.error('WebSocket Connection Error:', error)
            })

            newSocket.on('user_left_conv', (data) => {
                console.log('Evento leave_conversation recibido por WebSocket:', data)
                const { conversation_id, user_id } = data
                const current = handlersRef.current
                if (String(user_id) === String(current.currentUserId)) {
                    console(`User ${user_id} (current user) left conversation ${conversation_id}. Removing from list.`)
                    current.setConversations(prevConversations =>
                        prevConversations.filter(conv => String(conv.id) !== String(conversation_id))
                    )
                    if (String(current.selectedConversationId) === String(conversation_id)) {
                        console(`Conversation ${conversation_id} was selected. Deselecting.`)
                        current.setSelectedConversationId(null)
                        current.setMessages([])
                        current.setMessagePagination({
                            total_items: 0, total_pages: 0, current_page: 0, items_per_page: 100,
                            has_next: false, has_prev: false, next_page: null, prev_page: null,
                        })
                    }

                } else {
                    console.log(`User ${user_id} (another user) left conversation ${conversation_id}.`)
                    current.setConversations(prevConversations => {
                        const conversationIndex = prevConversations.findIndex(conv => String(conv.id) === String(conversation_id))
                        if (conversationIndex !== -1) {
                            const updatedConversations = [...prevConversations]
                            const targetConv = updatedConversations[conversationIndex]
                            updatedConversations[conversationIndex] = {
                                ...targetConv,
                                participants: targetConv.participants.filter(p => String(p.user_id) !== String(user_id)),
                            }
                            console.log(`Participant ${user_id} removed from conversation ${conversation_id} in state.`)
                            return updatedConversations
                        }
                        return prevConversations
                    })
                    if (String(current.selectedConversationId) === String(conversation_id)) {
                        console(`Conversation ${conversation_id} is selected. Adding system message.`)

                        const systemMessage = {
                            id: `system-${Date.now()}-${Math.random()}`,
                            conversation_id: conversation_id,
                            sender_id: null,
                            content: `Usuario ${user_id} ha salido del chat.`,
                            timestamp: new Date().toISOString(),
                            sender: null
                        }
                        current.setMessages(prevMessages => [...current.messages, systemMessage])
                    }
                }
            })

            newSocket.on('participant_added', (data) => {
                console.log('Evento participant_added recibido por WebSocket:', data)
                const { conversation_id, participant } = data
                const current = handlersRef.current

                current.setConversations(prevConversations => {
                    const conversationIndex = prevConversations.findIndex(conv => String(conv.id) === String(conversation_id))
                    if (conversationIndex !== -1) {
                        const updatedConversations = [...prevConversations]
                        const targetConv = updatedConversations[conversationIndex]
                        if (!targetConv.participants.some(p => String(p.user_id) === String(participant.user_id))) {
                            updatedConversations[conversationIndex] = {
                                ...targetConv,
                                participants: [...targetConv.participants, participant],
                            }
                            console.log(`Participant ${participant.user.name || participant.user.username} added to conversation ${conversation_id} in state.`)
                            return updatedConversations
                        } else {
                            console.log(`Participant ${participant.user.name || participant.user.username} already exists in conversation ${conversation_id} in state.`)
                            return prevConversations
                        }
                    }
                    console.warn(`Received participant_added for conversation ${conversation_id} not found in list. Re-fetching conversations.`)
                    current.fetchConversations()
                    return prevConversations
                })
                if (String(participant.user_id) === String(current.currentUserId)) {
                    console.log(`User ${current.currentUserId} was just added to conversation ${conversation_id}. Selecting it.`)
                    current.handleConversationSelect(conversation_id)
                }

            })

            newSocket.on('new_message', (message) => {
                console.log('--- Nuevo mensaje WS recibido ---')
                console.log('Mensaje completo recibido:', message)
                const current = handlersRef.current
                console.log('ID de conversación del mensaje (message.conversation_id):', message.conversation_id)
                console.log('ID de conversación seleccionada (current.selectedConversationId):', current.selectedConversationId)
                console.log('¿Son iguales (comparando como string)?', String(message.conversation_id) === String(current.selectedConversationId))
                if (current.selectedConversationId !== null && String(message.conversation_id) === String(current.selectedConversationId)) {
                    console.log(`¡CONDICIÓN CUMPLIDA! Mensaje para la conversación activa (${current.selectedConversationId}). Añadiendo a la vista.`)
                    current.setMessages(prevMessages => [...prevMessages, message])
                    setTimeout(() => {
                        const container = current.messagesContainerRef.current
                        if (container) {
                            requestAnimationFrame(() => {
                                if (container.scrollHeight > container.clientHeight) {
                                    container.scrollTop = container.scrollHeight - container.clientHeight
                                } else {
                                    container.scrollTop = 0
                                }
                                console.log("Scroll al fondo después de añadir nuevo mensaje (via setTimeout + rAF).")
                            })
                        } else {
                            console.warn("messagesContainerRef.current es null al intentar scrollear en listener WS.")
                        }
                    }, 0)

                } else {
                    console.log(`CONDICIÓN NO CUMPLIDA. Mensaje es para conv ${message.conversation_id}, seleccionada es ${current.selectedConversationId}. Actualizando lista de conversaciones.`) // Log si la condición NO se cumple
                }
                current.setConversations(prevConversations => {
                    const conversationIndex = prevConversations.findIndex(conv => String(conv.id) === String(message.conversation_id))
                    if (conversationIndex !== -1) {
                        const updatedConversations = [...prevConversations]
                        updatedConversations[conversationIndex] = {
                            ...updatedConversations[conversationIndex],
                            last_message: message,
                        }
                        const [movedConv] = updatedConversations.splice(conversationIndex, 1)
                        return [movedConv, ...updatedConversations]
                    }
                    return prevConversations
                })
                console.log('--- Fin del handler WS ---')
            })
            return () => {
                console.log('Desconectando WebSocket...')
                newSocket.off('user_left_conv')
                newSocket.off('participant_added')
                newSocket.off('new_conversation')
                newSocket.off('connect')
                newSocket.off('disconnect')
                newSocket.off('connect_error')
                newSocket.off('new_message')
                newSocket.disconnect()
                setSocket(null)
            }
        } else {
            if (socket) {
                console.log('Desconectando WebSocket debido a logout...')
                socket.disconnect()
                setSocket(null)
            }
        }
    }, [currentUserId])


    const handleLoadMoreMessages = useCallback(() => {
        console.log("handleLoadMoreMessages called for older messages.")
        if (messagePagination.has_prev && messagePagination.prev_page !== null && messagePagination.prev_page > 0) {
            console.log("Loading previous page of messages:", messagePagination.prev_page)
            fetchMessages(selectedConversationId, messagePagination.prev_page, messagePagination.items_per_page)
        } else {
            console.log("Cannot load more OLDER messages. has_prev:", messagePagination.has_prev, "prev_page:", messagePagination.prev_page)
        }
    }, [messagePagination.has_prev, messagePagination.prev_page, selectedConversationId, fetchMessages, messagePagination.items_per_page])


    useEffect(() => {
        const loadInitialMessages = async () => {
            if (selectedConversationId !== null) {
                setMessages([])
                setMessagePagination({
                    total_items: 0, total_pages: 0, current_page: 0, items_per_page: 100,
                    has_next: false, has_prev: false, next_page: null, prev_page: null,
                })
                oldScrollHeightRef.current = 0
                setIsLoadingMessages(true)
                setMessagesError(null)

                try {
                    const resPage1 = await fetch(`${API_BASE_URL}/messages/conversations/${selectedConversationId}/messages?page=1&per_page=100`, {
                        credentials: 'include',
                    })
                    if (resPage1.ok) {
                        const dataPage1 = await resPage1.json()
                        console.log(`Initial fetch (Page 1) for pagination info, conv ${selectedConversationId}:`, dataPage1)

                        const totalPages = dataPage1.pagination.total_pages

                        if (totalPages > 0) {
                            const pageToFetch = totalPages

                            console.log(`Workspaceing page ${pageToFetch} (last page) for conv ${selectedConversationId}...`)
                            const resLastPage = await fetch(`${API_BASE_URL}/messages/conversations/${selectedConversationId}/messages?page=${pageToFetch}&per_page=100`, {
                                credentials: 'include',
                            })

                            if (resLastPage.ok) {
                                const dataLastPage = await resLastPage.json()
                                console.log(`Workspaceed last page (${pageToFetch}) messages:`, dataLastPage)
                                setMessages(dataLastPage.messages)
                                setMessagePagination(dataLastPage.pagination)
                            } else {
                                const errorData = await resLastPage.json()
                                setMessagesError(errorData.message || `Error fetching last page of messages: ${resLastPage.status}`)
                                console.error("Error fetching last page of messages:", resLastPage.status, errorData)
                                setMessages([])
                                setMessagePagination({
                                    total_items: 0, total_pages: 0, current_page: 0, items_per_page: 100,
                                    has_next: false, has_prev: false, next_page: null, prev_page: null,
                                })
                            }
                        } else {
                            console.log("No messages found in conversation.")
                            setMessages([])
                            setMessagePagination(dataPage1.pagination)
                        }

                    } else {
                        const errorData = await resPage1.json()
                        setMessagesError(errorData.message || `Error fetching initial pagination info: ${resPage1.status}`)
                        console.error("Error fetching initial pagination info:", resPage1.status, errorData)
                        setMessages([])
                        setMessagePagination({
                            total_items: 0, total_pages: 0, current_page: 0, items_per_page: 100,
                            has_next: false, has_prev: false, next_page: null, prev_page: null,
                        })
                    }

                } catch (error) {
                    setMessagesError(`Network error fetching messages: ${error.message}`)
                    console.error("Network error fetching messages:", error)
                    setMessages([])
                    setMessagePagination({
                        total_items: 0, total_pages: 0, current_page: 0, items_per_page: 100,
                        has_next: false, has_prev: false, next_page: null, prev_page: null,
                    })
                } finally {
                    setIsLoadingMessages(false)
                }
            } else {
                setMessages([])
                setMessagePagination({
                    total_items: 0, total_pages: 0, current_page: 0, items_per_page: 100,
                    has_next: false, has_prev: false, next_page: null, prev_page: null,
                })
                oldScrollHeightRef.current = 0
            }
        }
        loadInitialMessages()
    }, [selectedConversationId])


    useLayoutEffect(() => {
        const messagesContainer = messagesContainerRef.current

        if (messagesContainer && selectedConversationId !== null && messagePagination.current_page > 1 && !isLoadingMessages && !isLoadingMore) {
            const newScrollHeight = messagesContainer.scrollHeight
            const heightDifference = newScrollHeight - oldScrollHeightRef.current
            console.log("Adjusting scroll...", { oldScrollHeight: oldScrollHeightRef.current, newScrollHeight, heightDifference })
            messagesContainer.scrollTop += heightDifference
            console.log("Scroll adjusted to:", messagesContainer.scrollTop)
        } else if (messagesContainer && selectedConversationId !== null && messagePagination.current_page === 1 && messages.length > 0 && !isLoadingMessages) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight
            console.log("Initial load (page 1), scrolling to visual bottom.")
        }

    }, [messages, selectedConversationId, messagePagination.current_page, isLoadingMessages, isLoadingMore])


    const messagesContainer = messagesContainerRef.current
    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = 50
            const isNearTopVisual = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - scrollThreshold
            if (!messagesContainer || selectedConversationId === null || isLoadingMessages || isLoadingMore || !messagePagination.has_next) {
                if (messagesContainer) {
                    messagesContainer.removeEventListener('scroll', handleScroll)
                    console.log("Scroll listener cleanup.")
                }
                return
            }
            messagesContainer.addEventListener('scroll', handleScroll)
            console.log("Scroll listener attached for conv:", selectedConversationId)

            if (isNearTopVisual && !isLoadingMessages && !isLoadingMore && messagePagination.has_next) {
                console.log("Scrolled near visual top, attempting to load more...")
                handleLoadMoreMessages()
            }
        }
        if (!messagesContainer || selectedConversationId === null || isLoadingMessages || isLoadingMore || !messagePagination.has_next) {
            if (messagesContainer) {
                messagesContainer.removeEventListener('scroll', handleScroll)
                console.log("Scroll listener cleanup.")
            }
            return
        }
        messagesContainer.addEventListener('scroll', handleScroll)
        console.log("Scroll listener attached for conv:", selectedConversationId)

        return () => {
            messagesContainer.removeEventListener('scroll', handleScroll)
            console.log("Scroll listener removed for conv:", selectedConversationId)
        }

    }, [selectedConversationId, isLoadingMessages, isLoadingMore, messagePagination.has_next, handleLoadMoreMessages])


    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!selectedConversationId || !newMessageContent.trim()) {
            console.log("Cannot send empty message or no conversation selected.")
            return
        }
        setIsSendingMessage(true)
        setSendMessageError(null)

        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations/${selectedConversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newMessageContent }),
            })
            if (res.ok) {
                const newMessage = await res.json()
                console.log("Message sent:", newMessage)
            } else {
                const errorData = await res.json()
                setSendMessageError(errorData.message || `Error sending message: ${res.status}`)
                console.error("Error sending message:", res.status, errorData)
            }
        } catch (error) {
            setSendMessageError(`Network error sending message: ${error.message}`)
            console.error("Network error sending message:", error)
        } finally {
            setIsSendingMessage(false)
            setNewMessageContent('')
        }
    }


    const getConversationDisplayName = useCallback((conv) => {

        if (conv?.name) {
            return conv.name
        } else {
            if (conv?.participants && conv?.participants.length > 0) {
                const otherParticipants = conv?.participants.filter(p => String(p.id) !== String(currentUserId))
                if (otherParticipants.length > 0) {
                    return otherParticipants.map(p => p.name || `Usuario ${p.id}`).join(', ')
                } else {
                    return `Yo`
                }
            } else {
                console.warn("Conversation participants not loaded for display name:", conv || 'putaaaa')
                return `Conversación (ID: ${conv?.id})`
            }
        }
    }, [currentUserId])


    const handleLeaveConversation = async (conversationId) => {
        if (!window.confirm(`¿Estás seguro de que quieres salir de esta conversación (ID: ${conversationId})?`)) {
            return
        }
        setIsLoadingConversations(true)
        setConversationsError(null)
        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/participants/me`, {
                method: 'DELETE',
                credentials: 'include',
            })

            if (res.ok) {
                console.log(`Left conversation ${conversationId}`)
                setConversations(conversations.filter(conv => conv.id !== conversationId))
                if (selectedConversationId === conversationId) {
                    setSelectedConversationId(null)
                    setMessages([])
                    setMessagePagination({
                        total_items: 0, total_pages: 0, current_page: 0, items_per_page: messagePagination.items_per_page,
                        has_next: false, has_prev: false, next_page: null, prev_page: null,
                    })
                    socket.emit('user_left_conv', {
                        conversation_id: conversationId,
                        user_id: currentUserId,
                    })
                }
            } else {
                const errorData = await res.json()
                setConversationsError(errorData.message || `Error leaving conversation ${conversationId}: ${res.status}`)
                console.error(`Error leaving conversation ${conversationId}:`, res.status, errorData)
            }
        } catch (error) {
            setConversationsError(`Network error leaving conversation ${conversationId}: ${error.message}`)
            console.error(`Network error leaving conversation ${conversationId}:`, error)
        }
    }

    const searchUsers = useCallback(async (query) => {
        if (!query || query.trim().length === 0) {
            setUserSearchResults([])
            return
        }
        setIsSearchingUsers(true)
        setUserSearchError(null)
        try {
            const res = await fetch(`${API_BASE_URL}/users/search?term=${encodeURIComponent(query)}`, {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                console.log("User search results:", data)
                setUserSearchResults(data.filter(user => String(user.id) !== String(currentUserId)))
            } else {
                const errorData = await res.json()
                setUserSearchError(errorData.message || `Error searching users: ${res.status}`)
                console.error("Error searching users:", res.status, errorData)
                setUserSearchResults([])
            }
        } catch (error) {
            setUserSearchError(`Network error searching users: ${error.message}`)
            console.error("Network error searching users:", error)
            setUserSearchResults([])
        } finally {
            setIsSearchingUsers(false)
        }
    }, [currentUserId])

    const debouncedSearchUsers = useCallback(debounce(searchUsers, 300), [searchUsers])
    useEffect(() => {
        if (conversationSearchTerm.trim()) {
            setShowSearchResults(true)
            debouncedSearchUsers(conversationSearchTerm)
        } else {
            setShowSearchResults(false)
            setUserSearchResults([])
            setUserSearchError(null)
        }
        return () => {
            debouncedSearchUsers.cancel()
        }
    }, [conversationSearchTerm, debouncedSearchUsers])


    const handleStartGroupCreation = () => {
        console.log("Starting group creation mode.")
        setIsCreatingGroup(true)
        setSelectedParticipants([])
        setNewGroupName('')
        setConversationSearchTerm('')
        setUserSearchResults([])
        setUserSearchError(null)
    }

    const handleSelectUserForGroup = (user) => {
        console.log("Toggling user selection for group:", user)
        const isSelected = selectedParticipants.some(p => String(p.id) === String(user.id))

        if (isSelected) {
            setSelectedParticipants(prev => prev.filter(p => String(p.id) !== String(user.id)))
            if (user.username.toLowerCase().includes(conversationSearchTerm.toLowerCase()) ||
                (user.name && user.name.toLowerCase().includes(conversationSearchTerm.toLowerCase()))) {
                setUserSearchResults(prev => [...prev, user].sort((a, b) => (a.username || a.name).localeCompare(b.username || b.name)))
            }

        } else {
            setSelectedParticipants(prev => [...prev, user])
        }
    }
    const handleRemoveParticipant = (participantToRemove) => {
        console.log("Removing participant:", participantToRemove)
        setSelectedParticipants(prev => prev.filter(p => String(p.id) !== String(participantToRemove.id)))
        if (participantToRemove.name.toLowerCase().includes(conversationSearchTerm.toLowerCase()) ||
            (participantToRemove.name && participantToRemove.name.toLowerCase().includes(conversationSearchTerm.toLowerCase()))) {
            setUserSearchResults(prev => [...prev, participantToRemove].sort((a, b) => (a.username || a.name).localeCompare(b.username || b.name)))
        }
    }
    const handleCreateGroup = async () => {
        console.log("Attempting to create group conversation.")
        if (selectedParticipants.length === 0) {
            alert("Por favor, selecciona al menos un participante.")
            return
        }
        if (!newGroupName.trim()) {
            alert("Por favor, ingresa un nombre para el grupo.")
            return
        }

        setIsCreatingGroupConversation(true)
        setCreateGroupError(null)
        const participantIds = selectedParticipants.map(p => parseInt(p.id))
        participantIds.push(parseInt(currentUserId))

        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    participant_ids: participantIds,
                    name: newGroupName.trim(),
                    is_group: true,
                }),
            })

            if (res.ok) {
                const conversation = await res.json()
                console.log("Group conversation created:", conversation)
                setConversations(prevConversations => {
                    const conversationDataForList = { ...conversation, last_message: conversation.last_message || null, }
                    if (!prevConversations.some(c => c.id === conversation.id)) {
                        return [conversationDataForList, ...prevConversations]
                    }
                    return prevConversations
                })
                setIsCreatingGroup(false)
                setSelectedParticipants([])
                setNewGroupName('')
                setConversationSearchTerm('')
                setUserSearchResults([])
                handleConversationSelect(conversation.id)

            } else {
                const errorData = await res.json()
                setCreateGroupError(errorData.message || `Error creating group: ${res.status}`)
                console.error("Error creating group:", res.status, errorData)
                alert(`Error creating group: ${errorData.message || res.status}`)
            }
        } catch (error) {
            setCreateGroupError(`Network error creating group: ${error.message}`)
            console.error("Network error creating group:", error)
            alert(`Network error creating group: ${error.message}`)
        } finally {
            setIsCreatingGroupConversation(false)
        }
    }

    const handleCancelGroupCreation = () => {
        console.log("Cancelling group creation mode.")
        setIsCreatingGroup(false)
        setSelectedParticipants([])
        setNewGroupName('')
        setConversationSearchTerm('')
        setUserSearchResults([])
        setUserSearchError(null)
    }

    const handleSelectUserForDM = useCallback(async (user) => {
        console.log("Selected user for DM:", user)

        setConversationSearchTerm('')
        setUserSearchResults([])

        try {

            const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    participant_ids: [parseInt(currentUserId), user.userId || user.id],
                    name: null,
                }),
            })

            if (res.ok) {
                const conversation = await res.json()
                console.log("Conversación DM creada/obtenida:", conversation)

                setConversations(prevConversations => {
                    const existingIndex = prevConversations.findIndex(conv => String(conv.id) === String(conversation.id))
                    if (existingIndex !== -1) {
                        const updatedConversations = [...prevConversations]
                        const [movedConv] = updatedConversations.splice(existingIndex, 1)

                        const updatedMovedConv = { ...movedConv, ...conversation }
                        return [updatedMovedConv, ...updatedConversations]
                    } else {
                        return [conversation, ...prevConversations]
                    }
                })

                waitUntilSocketReady(() => handleConversationSelect(conversation.id))

            } else {
                const errorData = await res.json()
                console.error("Error al iniciar DM:", res.status, errorData)
                alert(`Error al iniciar chat: ${errorData.message || res.status}`)
            }
        } catch (error) {
            console.error("Error de red al iniciar DM:", error)

        }
    }, [currentUserId, setConversationSearchTerm, setUserSearchResults, setConversations, handleConversationSelect, API_BASE_URL])



    useEffect(() => {
        console.log("MessagesPage mounted or location state changed. Checking location.state...")
        console.log("Location state:", location.state)
        if (location.state && location.state.conversationIdToOpen !== undefined) {
            const convIdToOpen = location.state.conversationIdToOpen
            console.log(`Found conversationIdToOpen in state: ${convIdToOpen}. Attempting to select it.`)
            handleConversationSelect(convIdToOpen)
            navigate(location.pathname, { replace: true, state: {} })

        } else if (location.state && location.state.user !== undefined) {
            setUserToDM(location.state.user)
            console.log(`Found user object in state:`, userToDM, `. Attempting to initiate DM.`)
            console.log("User object from state:", userToDM)
            console.log("userToDM.userId:", userToDM.userId)
            console.log("userToDM.id:", userToDM.id)
            handleSelectUserForDM(userToDM)
            navigate(location.pathname, { replace: true, state: {} })
        }

    }, [])

    const handleToggleParticipantsModal = () => {
        if (selectedConversationId !== null) {
            setShowParticipantsModal(prev => !prev)
            console.log("Toggling participants modal, new state:", !showParticipantsModal)
        }
    }

    const handleToggleParticipantSelection = (user) => {
        setSelectedParticipants(prevSelected => {
            if (String(user.id) === String(currentUserId)) {
                console.log("Cannot select self as group participant via UI.")
                return prevSelected
            }
            const isSelected = prevSelected.some(p => String(p.id) === String(user.id))
            if (isSelected) {
                return prevSelected.filter(p => String(p.id) !== String(user.id))
            } else {
                return [...prevSelected, user]
            }
        })
    }

    const handleInviteUserToGroup = useCallback(async (conversationId, userToInvite) => {
        console.log(`Attempting to invite user ${userToInvite?.id} to conversation ${conversationId}`)

        if (!conversationId || !userToInvite || !userToInvite.id) {
            console.error("Cannot invite: missing conversationId or userToInvite (or userToInvite.userId)")
            alert("Error: Información de invitación incompleta.")
            return
        }
        setIsInvitingUser(true)
        setInviteSearchError(null)

        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/participants`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userToInvite.id,
                }),
            })

            if (res.ok) {
                const result = await res.json()
                console.log("User invited successfully:", result)
                socket.emit('participant_added', {
                    conversation_id: conversationId,
                    participant: result
                })
            } else {
                const errorData = await res.json()
                console.error("Error inviting user:", res.status, errorData)
                setInviteSearchError(errorData.message || `Error inviting user: ${res.status}`)
                alert(`Error al invitar usuario: ${errorData.message || res.status}`)
            }
        } catch (error) {
            console.error("Network error inviting user:", error)
            setInviteSearchError(`Network error inviting user: ${error.message}`)
            alert(`Error de red al invitar usuario: ${error.message}`)
        } finally {
            setIsInvitingUser(false)
            setInviteSearchTerm('')
            setInviteSearchResults([])
        }
    }, [API_BASE_URL, currentUserId, selectedConversationId, conversations])

    const selectedConversation = conversations.find(c => c.id === selectedConversationId)
    const isGroupConversation = selectedConversation?.name !== null && selectedConversation?.name !== undefined


    const searchUsersForInvite = useCallback(async (query) => {
        if (!query || query.trim().length === 0) {
            setInviteSearchResults([])
            setIsLoadingInviteSearch(false)
            return
        }
        setIsLoadingInviteSearch(true)
        setInviteSearchError(null)
        try {
            const res = await fetch(`${API_BASE_URL}/users/search?term=${encodeURIComponent(query)}`, {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                console.log("Invite user search results:", data)
                const currentParticipantIds = selectedConversation?.participants?.map(p => String(p.id)) || []
                const filteredResults = data.filter(user =>
                    String(user.id) !== String(currentUserId)
                    && !currentParticipantIds.includes(String(user.id))
                )

                setInviteSearchResults(filteredResults)
            } else {
                const errorData = await res.json()
                setInviteSearchError(errorData.message || `Error searching users: ${res.status}`)
                console.error("Error searching users for invite:", res.status, errorData)
                setInviteSearchResults([])
            }
        } catch (error) {
            setInviteSearchError(`Network error searching users for invite: ${error.message}`)
            console.error("Network error searching users for invite:", error)
            setInviteSearchResults([])
        } finally {
            setIsLoadingInviteSearch(false)
        }
    }, [API_BASE_URL, currentUserId, selectedConversation, inviteSearchTerm])

    useEffect(() => {
        const debounceDelay = 200
        let timer
        if (timer) {
            clearTimeout(timer)
        }
        if (inviteSearchTerm.trim().length > 0) {
            console.log(`Debouncing search for invite term: "${inviteSearchTerm}". Setting timer...`)
            timer = setTimeout(() => {
                console.log(`Debounce timer finished for term: "${inviteSearchTerm}". Calling searchUsersForInvite.`)
                searchUsersForInvite(inviteSearchTerm)
            }, debounceDelay)
        } else {
            console.log("Invite search term is empty. Clearing results.")
            setInviteSearchResults([])
            setInviteSearchError(null)
            setIsLoadingInviteSearch(false)
        }
        return () => {
            console.log("Cleaning up debounce timer.")
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [inviteSearchTerm, searchUsersForInvite])


    const fetchRepos = async () => {
        const res = await fetch("https://api.devconnect.network/github/repos", {
            method: "GET",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        try {
            if (res.ok) {
                const data = await res.json()
                setRepos(data)
            } else {
                console.log(res)
                setRepos(null)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchRepos()
    }, [])

     const sesionWithGitHub = () => {
        window.location.href = 'https://api.devconnect.network/github/login';
    }
    const [selectedRepo, setSelectedRepo] = useState({})
    const [isRepoSelected, setIsRepoSelected] = useState(false)

    const checkRepo = async () => {
        if (selectedConversationId === null) {
            return
        }
        const res = await fetch(`https://api.devconnect.network/repos/${selectedConversationId}`, {
             method:"POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        try {
            if (res.status === 302) {
                const data = await res.json()
                const repo = repos.find(repo => repo.id.toString() === String(data.github_repo_id))
                setSelectedRepo(repo)
                console.log(repo)
                setIsRepoSelected(true)
            } else {
                setIsRepoSelected(false)
            }
        } catch(e) {
            setIsRepoSelected(false)
        }
    }
    const handleSelectRepo = async (event) => {
        if (selectedConversationId === null) {
            return
        }

        const selectedRepoId = event.target.value
        const repo = repos.find(repo => repo.id.toString() === String(selectedRepoId))
        setSelectedRepo(repo)
        const res = await fetch(`https://api.devconnect.network/repos/${selectedConversationId}`, {
            method:"POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: repo.id,
                full_name: repo.full_name
            }),
        })
        try{
            if(res.ok) {
                setIsRepoSelected(true)
            }
            else{
                setSelectedRepo(null)
                setIsRepoSelected(true)
            }
        } catch (e) {
            setIsRepoSelected(false)
        }
    }

    useEffect(() => {
       checkRepo()
    },[selectedConversationId])


    return (
        <div className={`shadow grid text-gray-900 gap-3 dark:text-gray-100 grid-template-rows${useViewportWidth() < 800 ? "grid-cols-[1fr]" : " grid-cols-[1fr_2fr] h-100 pl-4 min-h-screen"}`}>
            <div className={`${(useViewportWidth() < 800 && selectedConversationId) ? 'chat-converation-hide' : ''} justify-self-start  min-w-[300px]  w-full max-w-full overflow-hidden`}>
                {(isFormVisible) ?
                    <div>
                        <header className='border-left pl-4 grid grid-cols-[auto_auto] justify-start w-full"'>
                            <button type="button" onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                            </button>
                            <h1 className="text-2xl p-4 font-bold">New chat</h1>
                        </header>
                        <div className="relative w-full ">
                            <div className=" relative">
                                <div>
                                    {!isCreatingGroup ? (
                                        <button
                                            onClick={handleStartGroupCreation}
                                            className='flex p-4 gap-2 items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
                                        >
                                            <UserGroupIcon className="-ml-0.5 size-5" aria-hidden="true" />
                                            New project group
                                        </button>
                                    ) : (
                                        <div className="flex gap-2 items-center max-h-[45px]">
                                            <button
                                                onClick={handleCreateGroup}
                                                disabled={selectedParticipants.length === 0 || !newGroupName.trim() || isCreatingGroupConversation}
                                                className={`text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" ${selectedParticipants.length === 0 || !newGroupName.trim() || isCreatingGroupConversation ? 'cursor-not-allowed' : 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600'}`}
                                            >
                                                {isCreatingGroupConversation ? 'Creating project...' : 'Create project group'}
                                            </button>
                                            <button
                                                onClick={handleCancelGroupCreation}
                                                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    {isCreatingGroup && (
                                        <div className="mt-3 mb-3">
                                            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project group name:</label>
                                            <input
                                                type="text"
                                                id="group-name"
                                                className="block w-full p-2 text-sm text-gray-900 outline-none bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                placeholder="E.g: Alpha Team project"
                                                value={newGroupName}
                                                onChange={(e) => setNewGroupName(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="relative mb-3">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        id="conversation-search"
                                        ref={searchInputRef}
                                        className="block w-full p-2 ps-10 outline-none text-sm text-gray-900  bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder={isCreatingGroup ? 'Search users to add' : 'Search chat'}
                                        value={conversationSearchTerm}
                                        onChange={(e) => setConversationSearchTerm(e.target.value)}
                                    />
                                </div>
                                {isCreatingGroup && selectedParticipants.length > 0 && (
                                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                                        <h3 className="text-sm font-medium mb-2">Participantes Seleccionados:</h3>
                                        <ul className="flex flex-wrap gap-2">
                                            {selectedParticipants.map(participant => (
                                                <li key={`selected-participant-${participant.id}`} className="flex items-center bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-blue-100 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    {participant.username || participant.name || `Usuario ${participant.id}`}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveParticipant(participant)}
                                                        className="ml-1 -mr-0.5 size-3 text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-50 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        aria-label={`Remover a ${participant.username || participant.name}`}
                                                    >
                                                        <XMarkIcon aria-hidden="true" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {(conversationSearchTerm.trim().length > 0 || isCreatingGroup) && (
                                    <div ref={searchResultsRef} className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {isSearchingUsers ? (
                                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Buscando usuarios...</div>
                                        ) : userSearchError ? (
                                            <div className="p-4 text-center text-red-500">{userSearchError}</div>
                                        ) : userSearchResults.length > 0 ? (
                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700 ">
                                                {userSearchResults.map(user => {
                                                    const isSelected = selectedParticipants.some(p => String(p.id) === String(user.id))
                                                    return (
                                                        <li
                                                            key={`user-search-${user.id}`}
                                                            className="flex items-center gap-x-4 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            onClick={() => isCreatingGroup ? handleSelectUserForGroup(user) : handleSelectUserForDM(user)}
                                                        >
                                                            <img
                                                                className="size-8 flex-none rounded-full bg-gray-50"
                                                                src={getUserPhotoUrl(user, 'small')}
                                                                alt={`Foto de perfil de ${user.username || user.name}`}
                                                            />
                                                            <div className="min-w-0 flex-auto">
                                                                <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                                                    {user.username || user.name || `Usuario ${user.id}`}
                                                                </p>
                                                            </div>
                                                            {isCreatingGroup && (
                                                                <div className="ml-auto">
                                                                    {isSelected ? (
                                                                        <CheckIcon className="size-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                                                                    ) : (
                                                                        <div className="size-5  border dark:border-gray-400 rounded-sm"></div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        ) :
                                            (conversationSearchTerm.trim().length > 0) && !isSearchingUsers && (
                                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">No se encontraron usuarios.</div>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        <header className='grid grid-cols-[auto_auto] justify-start'>
                            <h1 className="text-2xl p-4 font-bold">Chats</h1>
                            <button
                                onClick={() => setIsFormVisible(true)}
                                className="px-4 py-2 focus:outline-none inline-flex items-center justify-center gap-x-2"
                            >
                                <UserGroupIcon className="-ml-0.5 size-8" aria-hidden="true" />
                            </button>
                        </header>
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="conversation-search"
                                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 bg-gray-50 focus:ring-none focus:border-none dark:bg-gray-700 outline-none dark:border-none dark:placeholder-gray-400 dark:text-white dark:focus:ring-none dark:focus:border-none"
                                placeholder="Search chat"
                                value={conversationSearchTerm}
                                onChange={(e) => setConversationSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>}
                {isLoadingConversations && <p>...</p>}
                {conversationsError && <p className="text-red-500">{conversationsError}</p>}
                {!isLoadingConversations && conversations.filter(conv => conv.deleted_at === null).filter(conv =>
                    getConversationDisplayName(conv).toLowerCase().includes(conversationSearchTerm.toLowerCase())
                ).length === 0 && !conversationsError && (
                        <p></p>
                    )}
                {!isLoadingConversations && conversations.length > 0 && (
                    <ul role="list">
                        {conversations
                            .filter(conv => conv.deleted_at === null)
                            .filter(conv =>
                                getConversationDisplayName(conv).toLowerCase()
                                    .includes(conversationSearchTerm.toLowerCase())
                            )
                            .map(conv => (
                                <ConversationListItem
                                    key={conv.id}
                                    conv={conv}
                                    currentUserId={currentUserId}
                                    selectedConversationId={selectedConversationId}
                                    onSelectConversation={handleConversationSelect}
                                    onLeaveConversation={handleLeaveConversation}
                                    getConversationDisplayName={getConversationDisplayName}
                                    formatTime={formatTime}
                                />
                            ))}
                    </ul>
                )}
            </div>
            <div className={`${(useViewportWidth() < 800 && selectedConversationId) ? 'chat-messages' : ''}flex flex-col`}>
                {isLoadingMessages && selectedConversationId !== null && <p className="text-end absolute"></p>}
                {isLoadingMore && selectedConversationId !== null && <p className="text-end absolute"></p>}
                {messagesError && <p className="text-red-500">{messagesError}</p>}
                {selectedConversationId !== null && !isLoadingMessages ? (
                    <div
                        ref={messagesContainerRef}
                        className="flex flex-col msg-container overflow-y-auto h-screen shadow custom-scrollbar"
                    >
                        <div
                            className="text-xl font-bold fixed py-2 px-3 msg-container-header"
                        >
                            {selectedConversationId === null
                                ? ''
                                : (<div className="flex flex-row-reverse justify-end mt-2 items-center mb-2 gap-4">
                                    <div>
                                        {(repos)?<div>{(!isRepoSelected)?
                                                <select onChange={handleSelectRepo} value={selectedRepo?.id?.toString() ?? ""} className="text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                                    <option defaultValue>Select repository to link with this chat</option>
                                                    {repos.map( repo => (
                                                        <option value={repo.id.toString()} key={repo.id}>{repo.name}</option>
                                                    ))}
                                                </select>: <a href={selectedRepo.html_url} className='text-gray-200 font-light flex gap-2 text-lg'>{<p><FontAwesomeIcon icon={faArchive} />{selectedRepo.name}</p>} {<p><FontAwesomeIcon icon={faCodeBranch} />{selectedRepo.default_branch}</p>}</a>
                                            }
                                        </div>
                                        :<button onClick={sesionWithGitHub} type="button" className="text-white-400 bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-xs px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 ">
                                        <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clipRule="evenodd" />
                                        </svg>
                                        Sign in with Github to link repositories to chats
                                    </button>}
                                    </div>
                                    <button type='button' onClick={handleToggleParticipantsModal} disabled={selectedConversation == undefined} className='flex flex-row-reverse justify-end items-center gap-2'>
                                        {getConversationDisplayName(conversations.find(c => c.id === selectedConversationId))}
                                        <img
                                            src={selectedConversation ? (isGroupConversation ? getUserPhotoUrl() :
                                                (selectedConversation.participants && selectedConversation.participants.length === 2 ?
                                                    getUserPhotoUrl(selectedConversation.participants.find(p => String(p.id) !== String(currentUserId)), 'default') :
                                                    getUserPhotoUrl())) : getUserPhotoUrl()} alt='foo'
                                            className='size-12 flex-none rounded-full bg-gray-50'></img>
                                    </button>
                                    <ArrowLeftIcon className="w-6 h-6 cursor-pointer" onClick={handlecloseConversation} />
                                </div>)
                            }
                        </div>
                        {showParticipantsModal && selectedConversation && isGroupConversation && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                                    <button
                                        onClick={handleToggleParticipantsModal}
                                        className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        aria-label="Cerrar"
                                    >
                                        <XMarkIcon className="size-6" aria-hidden="true" />
                                    </button>
                                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                                        Members
                                    </h3>
                                    {selectedConversation.participants && selectedConversation.participants.length > 1 ? (
                                        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {selectedConversation.participants.map(participant => (
                                                <li key={participant.id} className="flex items-center gap-3">
                                                    <img
                                                        className="size-8 flex-none rounded-full bg-gray-50"
                                                        src={getUserPhotoUrl(participant, 'small')}
                                                        alt={`Foto de perfil de ${participant.username || participant.name}`}
                                                    />
                                                    <div className="min-w-0 flex-auto">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {participant.username || participant.name || `Usuario ${participant.id}`}
                                                            {String(participant.id) === String(currentUserId) && (
                                                                <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full">Tú</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-gray-500 dark:text-gray-400">No se encontraron participantes.</p>
                                    )}

                                    {isGroupConversation && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="relative mb-2 overflow-hidden">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar usuario para invitar"
                                                    className="block p-2 ps-10 outline-none text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    value={inviteSearchTerm}
                                                    onChange={(e) => setInviteSearchTerm(e.target.value)}
                                                />
                                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleLeaveConversation(selectedConversation.id)}
                                                className="ext-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                            >
                                                Leave group
                                            </button>
                                            {isLoadingInviteSearch ? (
                                                <div className="text-center text-gray-500 dark:text-gray-400 text-sm">Buscando...</div>
                                            ) : inviteSearchError ? (
                                                <div className="text-center text-red-500 dark:text-red-400 text-sm">Error: {inviteSearchError}</div>
                                            ) : inviteSearchResults.length > 0 ? (
                                                <div className="max-h-24 overflow-y-auto  rounded-lg mb-2">
                                                    {inviteSearchResults.map(user => (
                                                        <div
                                                            key={user.userId || user.id}
                                                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                                                            onClick={() => {
                                                                if (selectedConversationId) {
                                                                    handleInviteUserToGroup(selectedConversationId, user)
                                                                } else {
                                                                    alert("Error: No hay conversación seleccionada para invitar.")
                                                                }
                                                            }}
                                                        >
                                                            <img src={getUserPhotoUrl(user)} alt={user.name || user.username} className='size-7 rounded-full bg-gray-50'></img>
                                                            <span className="text-gray-900 dark:text-white">{user.name || user.username}</span>
                                                            {isInvitingUser && isInvitingUser === user.userId && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Invitando...</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : inviteSearchTerm && !isLoadingInviteSearch && (
                                                <div className="text-center text-gray-500 dark:text-gray-400 text-sm">No se encontraron usuarios.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {isLoadingMore && <p className="text-center text-sm text-gray-600 dark:text-gray-400"></p>}
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex mb-2 rounded-lg ${String(message.sender_id) === String(currentUserId) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`grid grid-cols[auto_auto] grid-rows-[1] max-w-sm lg:max-w-md p-2 mx-2 min-w-[60px] rounded-lg shadow ${(parseInt(message.sender_id) != 3)?String(message.sender_id) === String(currentUserId) ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 hover:bg-gradient-to-br text-white' : 'bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 hover:bg-gradient-to-br ':'text-white bg-gradient-to-r from-green-700 via-green-800 to-green-900 hover:bg-gradient-to-br rounded-lg text-sm'}`}>
                                    <div>
                                        {String(message.sender.id) !== String(currentUserId) ?
                                            <p className="text-xs text-left font-semibold mb-1">
                                                {String(message.sender.name)}
                                            </p> : <p></p>}
                                        <p className={`text-base text-lg whitespace-pre-wrap pr-4 break-words${String(message.sender_id) !== String(currentUserId) ? 'text-left' : 'text-right'}`}>
                                            {(parseInt(message.sender_id) === 3)?<FontAwesomeIcon icon={faCodeCommit} />:''} {message.content}
                                        </p>
                                    </div>
                                    <p className="text-xs msg-timestamp text-right opacity-80">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        {!isLoadingMessages && !isLoadingMore && messages.length === 0 && !messagesError && (
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-auto">This chat doesn't have messages yet.</p>
                        )}
                        {selectedConversationId !== null && (

                            <form onSubmit={handleSendMessage} className="w-full flex gap-4 mt-4 send-message">
                                <label htmlFor="chat" className="sr-only">Your message</label>
                                <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 w-full">
                                    <button type="button" className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                                            <path fill="currentColor" d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z" />
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 1H2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" />
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z" />
                                        </svg>
                                        <span className="sr-only">Upload image</span>
                                    </button>
                                    <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z" />
                                        </svg>
                                        <span className="sr-only">Add emoji</span>
                                    </button>
                                    <textarea
                                        id="chat" rows="1" className="w-full block mx-4 p-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Your message..."
                                        value={newMessageContent}
                                        onChange={(e) => setNewMessageContent(e.target.value)}
                                        disabled={isSendingMessage}
                                        ref={textareaRef}
                                    >
                                    </textarea>
                                    <button type="submit" className=" inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                                        <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                                        </svg>
                                        <span className="sr-only">Send message</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ):<div className='text-center mt-[50vh] text-gray-400'><h1>Select a conversation.</h1></div>}
            </div>
        </div >
    )
}
export default MessagesPage
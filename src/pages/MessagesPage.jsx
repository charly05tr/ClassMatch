import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConversationListItem from '../components/ConversationListItem'
import { UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { XMarkIcon, CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client'
import './MessagePage.css'
import { debounce } from 'lodash';
const API_BASE_URL = 'https://classmatchapi-1.onrender.com'

function MessagesPage({ currentUserId }) {

    const WEBSOCKET_URL = `https://classmatchapi-1.onrender.com?userId=${currentUserId}`
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [userSearchError, setUserSearchError] = useState(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
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

    const [newMessageContent, setNewMessageContent] = useState('')
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [sendMessageError, setSendMessageError] = useState(null)
    const oldScrollHeightRef = useRef(0)
    const [conversationSearchTerm, setConversationSearchTerm] = useState('')
    const messagesContainerRef = useRef(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [isFormVisible, setIsFormVisible] = useState(false)
    const textareaRef = useRef(null)
    const searchResultsRef = useRef(null);
    const searchInputRef = useRef(null);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false); // True when user is in group creation mode
    const [selectedParticipants, setSelectedParticipants] = useState([]); // Users selected for the group
    const [newGroupName, setNewGroupName] = useState(''); // Name for the new group
    const [isCreatingGroupConversation, setIsCreatingGroupConversation] = useState(false); // Loading state for backend API call
    const [createGroupError, setCreateGroupError] = useState(null);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const PLACEHOLDER_PHOTO_URL = 'https://picsum.photos/200/300'

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

    const handleConversationSelect = useCallback((conversationId) => {
        console.log("Conversation selected:", conversationId)
        if (socket && socket.connected) {
            console.log(`Intentando unirse a la room de conversación: conversation_${conversationId}`)
            socket.emit('join_conversation', { conversation_id: conversationId })
        } else {
            console.warn("Socket no conectado, no se pudo emitir join_conversation")
        }
        setSelectedConversationId(conversationId)
        setNewMessageContent('')
        setSendMessageError(null)
    }, [socket, handlersRef])


    useEffect(() => {
        if (currentUserId !== null) {
            console.log(`Intentando conectar WebSocket para user ${currentUserId}...`)
            const newSocket = io(`${WEBSOCKET_URL}`, {
                cors: {
                    origin: "http://192.168.0.6:5173",
                    credentials: true
                }
            })

            setSocket(newSocket)
            newSocket.on('connect', () => {
                console.log('WebSocket conectado!', newSocket.id)
            })

            newSocket.on('disconnect', (reason) => {
                console.log('WebSocket desconectado:', reason)
            })

            newSocket.on('connect_error', (error) => {
                console.error('WebSocket Connection Error:', error)
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
                }
                console.log('--- Fin del handler WS ---')
            })
            return () => {
                console.log('Desconectando WebSocket...')
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
        if (conv.name) {
            return conv.name
        } else {
            if (conv.participants && conv.participants.length > 0) {
                const otherParticipants = conv.participants.filter(p => String(p.id) !== String(currentUserId))
                if (otherParticipants.length > 0) {
                    return otherParticipants.map(p => p.name || `Usuario ${p.id}`).join(', ')
                } else {
                    return `Yo`
                }
            } else {
                console.warn("Conversation participants not loaded for display name:", conv)
                return `Conversación (ID: ${conv.id})`
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
            setUserSearchResults([]);
            return;
        }
        setIsSearchingUsers(true);
        setUserSearchError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/users/search?term=${encodeURIComponent(query)}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                console.log("User search results:", data);
                // Filter out the current user from results
                setUserSearchResults(data.filter(user => String(user.id) !== String(currentUserId)));
            } else {
                const errorData = await res.json();
                setUserSearchError(errorData.message || `Error searching users: ${res.status}`);
                console.error("Error searching users:", res.status, errorData);
                setUserSearchResults([]);
            }
        } catch (error) {
            setUserSearchError(`Network error searching users: ${error.message}`);
            console.error("Network error searching users:", error);
            setUserSearchResults([]);
        } finally {
            setIsSearchingUsers(false);
        }
    }, [currentUserId]); // Dependency on currentUserId to filter self

    // Create a debounced version of the searchUsers function
    // Adjust debounce delay (e.g., 300ms) as needed
    const debouncedSearchUsers = useCallback(debounce(searchUsers, 300), [searchUsers]);

    // --- Effect to Trigger User Search ---
    // This effect runs when the conversationSearchTerm changes
    useEffect(() => {
        if (conversationSearchTerm.trim()) {
            // Show search results section when there's a search term
            setShowSearchResults(true);
            // Trigger the debounced user search
            debouncedSearchUsers(conversationSearchTerm);
        } else {
            // Hide search results and clear them when the search term is empty
            setShowSearchResults(false);
            setUserSearchResults([]);
            setUserSearchError(null); // Clear any previous error
        }
        // Cleanup the debounced search on effect cleanup
        return () => {
            debouncedSearchUsers.cancel(); // Cancel any pending debounced calls
        };
    }, [conversationSearchTerm, debouncedSearchUsers]); // Dependencies: search term and the debounced function


    // --- Handler to Select a User from Search Results and Start a DM ---


    const handleStartGroupCreation = () => {
        console.log("Starting group creation mode.");
        setIsCreatingGroup(true);
        setSelectedParticipants([]); // Clear selected participants
        setNewGroupName(''); // Clear group name
        setConversationSearchTerm(''); // Clear search term
        setUserSearchResults([]); // Clear search results
        setUserSearchError(null); // Clear user search error
        // Optional: Focus the search input field
        // if (searchInputRef.current) {
        //     searchInputRef.current.focus();
        // }
    };

    // --- Handler to Select/Deselect User for Group ---
    // This handler is called when clicking a user in the search results list
    const handleSelectUserForGroup = (user) => {
        console.log("Toggling user selection for group:", user);
        const isSelected = selectedParticipants.some(p => String(p.id) === String(user.id));

        if (isSelected) {
            // Deselect: Remove from selectedParticipants
            setSelectedParticipants(prev => prev.filter(p => String(p.id) !== String(user.id)));
            // Add back to search results if they match the current search term (optional, but good UX)
            if (user.username.toLowerCase().includes(conversationSearchTerm.toLowerCase()) ||
                (user.name && user.name.toLowerCase().includes(conversationSearchTerm.toLowerCase()))) { // Basic check
                setUserSearchResults(prev => [...prev, user].sort((a, b) => (a.username || a.name).localeCompare(b.username || b.name))); // Add back and sort
            }

        } else {
            // Select: Add to selectedParticipants
            setSelectedParticipants(prev => [...prev, user]);
            // Optional: Remove from userSearchResults visually (handled by filter in searchUsers)
            // setUserSearchResults(prev => prev.filter(p => String(p.id) !== String(user.id)));
        }
    };

    // --- Handler to Remove Participant from Selected List ---
    const handleRemoveParticipant = (participantToRemove) => {
        console.log("Removing participant:", participantToRemove);
        setSelectedParticipants(prev => prev.filter(p => String(p.id) !== String(participantToRemove.id)));
        // Add back to search results if they match the current search term
        if (participantToRemove.username.toLowerCase().includes(conversationSearchTerm.toLowerCase()) ||
            (participantToRemove.name && participantToRemove.name.toLowerCase().includes(conversationSearchTerm.toLowerCase()))) { // Basic check
            setUserSearchResults(prev => [...prev, participantToRemove].sort((a, b) => (a.username || a.name).localeCompare(b.username || b.name))); // Add back and sort
        }
    };


    // --- Handler to Create Group Conversation (Backend API Call) ---
    const handleCreateGroup = async () => {
        console.log("Attempting to create group conversation.");
        if (selectedParticipants.length === 0) {
            alert("Por favor, selecciona al menos un participante.");
            return;
        }
        if (!newGroupName.trim()) {
            alert("Por favor, ingresa un nombre para el grupo.");
            return;
        }

        setIsCreatingGroupConversation(true);
        setCreateGroupError(null);

        // Get IDs of selected participants + current user ID
        const participantIds = selectedParticipants.map(p => p.id);
        participantIds.push(currentUserId); // Add the current user's ID

        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    participant_ids: participantIds,
                    name: newGroupName.trim(),
                    is_group: true, // Explicitly mark as a group
                }),
            });

            if (res.ok) {
                const conversation = await res.json(); // Backend should return the new group conversation object
                console.log("Group conversation created:", conversation);

                // Add the new conversation to the top of the conversations list
                setConversations(prevConversations => {
                    const conversationDataForList = { ...conversation, last_message: conversation.last_message || null, };
                    // Add to top, ensuring no duplicates if WS event arrives first (less likely here)
                    if (!prevConversations.some(c => c.id === conversation.id)) {
                        return [conversationDataForList, ...prevConversations];
                    }
                    return prevConversations;
                });


                // Reset group creation state
                setIsCreatingGroup(false);
                setSelectedParticipants([]);
                setNewGroupName('');
                // Clear search results if still visible
                setConversationSearchTerm('');
                setUserSearchResults([]);


                // Select the newly created conversation
                handleConversationSelect(conversation.id);

            } else {
                const errorData = await res.json();
                setCreateGroupError(errorData.message || `Error creating group: ${res.status}`);
                console.error("Error creating group:", res.status, errorData);
                alert(`Error creating group: ${errorData.message || res.status}`); // Basic error feedback
            }
        } catch (error) {
            setCreateGroupError(`Network error creating group: ${error.message}`);
            console.error("Network error creating group:", error);
            alert(`Network error creating group: ${error.message}`); // Basic error feedback
        } finally {
            setIsCreatingGroupConversation(false);
        }
    };

    // --- Handler to Cancel Group Creation Mode ---
    const handleCancelGroupCreation = () => {
        console.log("Cancelling group creation mode.");
        setIsCreatingGroup(false);
        setSelectedParticipants([]);
        setNewGroupName('');
        setConversationSearchTerm(''); // Clear search term
        setUserSearchResults([]); // Clear search results
        setUserSearchError(null); // Clear user search error
    };


    // --- Handler to Select a User from Search Results and Start a DM (Keep this for DM mode) ---
    // This handler is called when clicking a user in the search results list WHEN NOT in group mode
    const handleSelectUserForDM = async (user) => {
        console.log("Selected user for DM:", user);
        // Hide search results immediately
        // setShowSearchResults(false); // Handled by clearing search term
        setConversationSearchTerm(''); // Clear the search term

        // ... (same handleSelectUserForDM logic as before: API call to create/get DM, add/move to conversations, select conversation) ...

        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations`, { /* ... POST to create/get DM with participant_ids: [user.id] ... */ });
            if (res.ok) {
                const conversation = await res.json();
                console.log("DM conversation created/obtained:", conversation);
                setConversations(prevConversations => { /* ... add/move conversation to top ... */ });
                handleConversationSelect(conversation.id); // Select the DM
            } else { /* ... error handling ... */ alert(`Error starting DM: ...`); }
        } catch (error) { /* ... network error handling ... */ alert(`Network error starting DM: ...`); }

        const handleLeaveConversation = useCallback(async (conversationId) => {
            console.log("Attempting to leave conversation:", conversationId);
            if (!window.confirm("¿Estás seguro de que quieres salir de este chat?")) {
                return; // Cancel if user does not confirm
            }

            // Optional: Set a loading state for leaving conversation
            // setIsLeavingConversation(true);
            // setLeaveConversationError(null);

            try {
                // Call backend API to leave the conversation
                const res = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/leave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (res.ok) {
                    console.log("Successfully left conversation:", conversationId);
                    // Remove the conversation from the conversations list
                    setConversations(prevConversations => prevConversations.filter(conv => conv.id !== conversationId));

                    // If the user left the currently selected conversation, deselect it
                    if (selectedConversationId === conversationId) {
                        setSelectedConversationId(null); // Deselect the chat
                        setMessages([]); // Clear messages
                        setMessagePagination({ // Reset pagination
                            total_items: 0, total_pages: 0, current_page: 0, items_per_page: 20,
                            has_next: false, has_prev: false, next_page: null, prev_page: null,
                        });
                        // Hide the participants modal if it was open
                        setShowParticipantsModal(false);
                    } else {
                        // If user left a conversation that wasn't selected, maybe just show a notification
                        alert(`Has salido del chat.`); // Simple notification
                    }

                } else {
                    const errorData = await res.json();
                    // setLeaveConversationError(errorData.message || `Error leaving conversation: ${res.status}`);
                    console.error("Error leaving conversation:", res.status, errorData);
                    alert(`Error al salir del chat: ${errorData.message || res.status}`); // Basic error feedback
                }
            } catch (error) {
                // setLeaveConversationError(`Network error leaving conversation: ${error.message}`);
                console.error("Network error leaving conversation:", error);
                alert(`Error de red al salir del chat: ${error.message}`); // Basic error feedback
            } finally {
                // setIsLeavingConversation(false);
            }
        }, [selectedConversationId, setConversations, setSelectedConversationId, setMessages, setMessagePagination]);
    };

    const handleToggleParticipantsModal = () => {
        // Only toggle if a conversation is selected
        if (selectedConversationId !== null) {
            setShowParticipantsModal(prev => !prev);
            console.log("Toggling participants modal, new state:", !showParticipantsModal);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the modal content itself
            // You'll need to add a ref to the modal content div
            // For simplicity now, let's just check if it's the document body
            // A more robust solution needs a ref to the modal content.
            // Example (requires modalContentRef):
            // if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
            //    setShowParticipantsModal(false);
            // }
        };
        // Add listener if modal is open
        if (showParticipantsModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showParticipantsModal]);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    const isGroupConversation = selectedConversation?.name !== null && selectedConversation?.name !== undefined; // Check if it's a group


    return (
        <div className="shadow grid grid-cols-[1fr_2fr] grid-template-rows h-100 pl-4 min-h-screen text-gray-900 gap-3 dark:text-gray-100">
            <div className='justify-self-start max-w-[500px] min-w-[300px]  w-full max-w-full overflow-hidden'>
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
                                    {/* Conditional rendering of buttons */}
                                    {!isCreatingGroup ? (
                                        // "New Group" button (shown when NOT creating group)
                                        <button
                                            onClick={handleStartGroupCreation} // New handler
                                            className='flex p-4 gap-2 items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
                                        >
                                            <UserGroupIcon className="-ml-0.5 size-5" aria-hidden="true" />
                                            New project group
                                        </button>
                                    ) : (
                                        <div className="flex gap-2 items-center max-h-[45px]">
                                            {/* Create Group Button */}
                                            <button
                                                onClick={handleCreateGroup} // New handler
                                                disabled={selectedParticipants.length === 0 || !newGroupName.trim() || isCreatingGroupConversation} // Disable if no participants or no name
                                                className={`text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" ${selectedParticipants.length === 0 || !newGroupName.trim() || isCreatingGroupConversation ? 'cursor-not-allowed' : 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600'}`}
                                            >
                                                {isCreatingGroupConversation ? 'Creating project...' : 'Create project group'}
                                            </button>
                                            {/* Cancel Button */}
                                            <button
                                                onClick={handleCancelGroupCreation} // New handler
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
                                    // Optional: onFocus={() => setShowSearchResults(true)} // Show results when input is focused
                                    // Optional: onBlur={() => setTimeout(() => setShowSearchResults(false), 100)} // Hide with delay on blur
                                    />
                                </div>
                                {isCreatingGroup && selectedParticipants.length > 0 && (
                                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                                        <h3 className="text-sm font-medium mb-2">Participantes Seleccionados:</h3>
                                        <ul className="flex flex-wrap gap-2">
                                            {selectedParticipants.map(participant => (
                                                <li key={`selected-participant-${participant.id}`} className="flex items-center bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-blue-100 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    {/* Optional: participant.username or participant.name */}
                                                    {participant.username || participant.name || `Usuario ${participant.id}`}
                                                    {/* Button to remove participant */}
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
                                {/* Search Results Dropdown/Section (NEW) */}
                                {/* Conditional rendering based on showSearchResults and search state */}
                                {(conversationSearchTerm.trim().length > 0 || isCreatingGroup) && ( // Show if searching or in group mode
                                    <div ref={searchResultsRef} className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {isSearchingUsers ? (
                                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Buscando usuarios...</div>
                                        ) : userSearchError ? (
                                            <div className="p-4 text-center text-red-500">{userSearchError}</div>
                                        ) : userSearchResults.length > 0 ? (
                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700 ">
                                                {/* Render User Search Results */}
                                                {userSearchResults.map(user => {
                                                    // Check if the user is already selected
                                                    const isSelected = selectedParticipants.some(p => String(p.id) === String(user.id));
                                                    return (
                                                        <li
                                                            key={`user-search-${user.id}`} // Unique key for user results
                                                            className="flex items-center gap-x-4 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            // Different click handler based on mode
                                                            onClick={() => isCreatingGroup ? handleSelectUserForGroup(user) : handleSelectUserForDM(user)}
                                                        >
                                                            {/* User Photo */}
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
                                                            {/* Checkbox or Indicator (NEW) */}
                                                            {isCreatingGroup && (
                                                                <div className="ml-auto"> {/* Use ml-auto to push to the right */}
                                                                    {isSelected ? (
                                                                        // Checkbox visual when selected in group mode
                                                                        <CheckIcon className="size-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                                                                    ) : (
                                                                        // Empty space or unchecked visual when not selected
                                                                        <div className="size-5  border dark:border-gray-400 rounded-sm"></div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) :
                                            // Message when search term is present but no users found
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
            <div className="flex flex-col h-full">
                {isLoadingMessages && selectedConversationId !== null && <p className="text-end absolute"></p>}
                {isLoadingMore && selectedConversationId !== null && <p className="text-end absolute"></p>}
                {messagesError && <p className="text-red-500">{messagesError}</p>}
                {selectedConversationId !== null && (
                    <div
                        ref={messagesContainerRef}
                        className="flex flex-col msg-container overflow-y-auto h-screen shadow custom-scrollbar"
                    >
                        <button
                            className="text-xl font-bold fixed py-2 px-3 msg-container-header"
                            onClick={handleToggleParticipantsModal}
                            disabled={selectedConversation === undefined}
                        >
                            {selectedConversationId === null
                                ? ''
                                : (<div className="flex flex-row-reverse justify-end mt-2 items-center mb-2 gap-2">
                                    {getConversationDisplayName(conversations.find(c => c.id === selectedConversationId))}
                                    <img src={selectedConversation ? (isGroupConversation ? getUserPhotoUrl() : (selectedConversation.participants && selectedConversation.participants.length === 2 ? getUserPhotoUrl(selectedConversation.participants.find(p => String(p.id) !== String(currentUserId)), 'default') : getUserPhotoUrl())) : getUserPhotoUrl()} alt='foo' className='size-12 flex-none rounded-full bg-gray-50'></img>
                                    {/* <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedConversationId(null) }} />; */}
                                </div>)
                            }
                        </button>
                        {showParticipantsModal && selectedConversation && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                                    {/* Close Button */}
                                    <button
                                        onClick={handleToggleParticipantsModal}
                                        className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        aria-label="Cerrar"
                                    >
                                        <XMarkIcon className="size-6" aria-hidden="true" />
                                    </button>

                                    {/* Modal Title */}
                                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                                        {isGroupConversation ? 'Miembros del Grupo' : 'Participantes del Chat'}
                                    </h3>

                                    {/* Participants List */}
                                    {selectedConversation.participants && selectedConversation.participants.length > 0 ? (
                                        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2"> {/* Add padding-right for scrollbar */}
                                            {selectedConversation.participants.map(participant => (
                                                <li key={participant.id} className="flex items-center gap-3">
                                                    <img
                                                        className="size-8 flex-none rounded-full bg-gray-50"
                                                        src={getUserPhotoUrl(participant, 'small')} // Use small photo
                                                        alt={`Foto de perfil de ${participant.username || participant.name}`}
                                                    />
                                                    <div className="min-w-0 flex-auto">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {participant.username || participant.name || `Usuario ${participant.id}`}
                                                            {/* Optional: Indicate if it's the current user */}
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

                                    {/* Leave Group Button (Show only for Group Conversations) */}
                                    {isGroupConversation && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => handleLeaveConversation(selectedConversation.id)} // Call handler
                                                className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                            >
                                                Salir del Grupo
                                            </button>
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
                                {console.log(`Remitente del mensaje ${message.id}:`, message.sender.name)}
                                <div className={`grid grid-cols[auto_auto] grid-rows-[1] max-w-sm lg:max-w-md p-2 mx-2 min-w-[60px] rounded-lg shadow ${String(message.sender_id) === String(currentUserId) ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                                    <div>
                                        {String(message.sender.id) !== String(currentUserId) ?
                                        <p className="text-xs text-left font-semibold mb-1">
                                            {String(message.sender.name)}
                                        </p>:<p></p>}
                                        <p className={`text-base text-lg whitespace-pre-wrap pr-4 break-words${String(message.sender_id) !== String(currentUserId) ? 'text-left' : 'text-right'}`}>
                                            {message.content}
                                        </p>
                                    </div>
                                    <p className="text-xs msg-timestamp text-right opacity-80">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        {!isLoadingMessages && !isLoadingMore && messages.length === 0 && !messagesError && (
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-auto">This chat don't have messages yet.</p>
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
                                        id="chat" rows="1" className="w-full block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                )}
            </div>
        </div >
    )
}
export default MessagesPage
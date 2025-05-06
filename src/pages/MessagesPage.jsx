// src/pages/MessagesPage.jsx
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
// Asumo que puedes necesitar useNavigate si quieres navegar a la conversación después de crear un DM
// import { useNavigate } from 'react-router-dom';

// URL base de tu backend (ajusta si tu backend no corre en 5000 o si está desplegado)
const API_BASE_URL = 'http://localhost:5000';

function MessagesPage({ currentUserId }) {
    // const navigate = useNavigate(); // Si decides navegar después de crear un DM

    // --- Estados para las conversaciones ---
    const [conversations, setConversations] = useState([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [conversationsError, setConversationsError] = useState(null);

    // --- Estados para los mensajes de la conversación seleccionada ---
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false); // Inicia falso, solo carga al seleccionar una conversación
    const [messagesError, setMessagesError] = useState(null);
    const [messagePagination, setMessagePagination] = useState({ // Estado para la paginación de mensajes
        total_items: 0,
        total_pages: 0,
        current_page: 0,
        items_per_page: 20, // Asumir el default del backend
        has_next: false,
        has_prev: false,
        next_page: null,
        prev_page: null,
    });

    // --- Estados para formularios ---
    const [newMessageContent, setNewMessageContent] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [sendMessageError, setSendMessageError] = useState(null);

    const [dmUserIdInput, setDmUserIdInput] = useState('');
    const [isCreatingDm, setIsCreatingDm] = useState(false);
    const [createDmError, setCreateDmError] = useState(null);
    const oldScrollHeightRef = useRef(0); // Ref para guardar la altura vieja

    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupParticipantIdsInput, setNewGroupParticipantIdsInput] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [createGroupError, setCreateGroupError] = useState(null);

    const messagesContainerRef = useRef(null);

    // --- Estado para controlar si se está cargando más mensajes antiguos (para UI) ---
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // --- useEffect para obtener la lista de conversaciones del usuario ---
    // Se ejecuta solo una vez al montar el componente
    useEffect(() => {
        const fetchConversations = async () => {
            setIsLoadingConversations(true);
            setConversationsError(null);
            try {
                // Usa la URL de la ruta que NO tiene paginación en el backend (según tu última instrucción)
                const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
                    credentials: 'include', // Importante para enviar la cookie de sesión
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("Conversations fetched:", data);
                    setConversations(data);
                } else {
                    // Manejar errores como 401 (no autorizado) o otros errores HTTP
                    const errorData = await res.json(); // Intentar leer el cuerpo del error
                    setConversationsError(errorData.message || `Error fetching conversations: ${res.status}`);
                    console.error("Error fetching conversations:", res.status, errorData);
                    setConversations([]); // Limpiar lista en caso de error
                }
            } catch (error) {
                // Manejar errores de red
                setConversationsError(`Network error fetching conversations: ${error.message}`);
                console.error("Network error fetching conversations:", error);
                setConversations([]); // Limpiar lista en caso de error
            } finally {
                setIsLoadingConversations(false);
            }
        };

        if (currentUserId) { // Solo fetchear si el currentUserId está disponible
            fetchConversations();
        }
    }, []); // Array de dependencias vacío: se ejecuta solo una vez al montar


    // --- useEffect para obtener los mensajes de una conversación seleccionada ---
    // Se ejecuta cada vez que selectedConversationId cambia (y no es null)


    const fetchMessages = useCallback(async (conversationId, page = 1, perPage = 20) => { // <-- Removed 'append'

        if (!conversationId) {
            setMessages([]);
            setMessagePagination({
                total_items: 0, total_pages: 0, current_page: 0, items_per_page: perPage,
                has_next: false, has_prev: false, next_page: null, prev_page: null,
            });
            // Limpiar ref al limpiar mensajes
            oldScrollHeightRef.current = 0;
            return;
        }

        // Ajustar indicadores de carga
        if (page === 1) {
            setIsLoadingMessages(true); // Carga inicial
            oldScrollHeightRef.current = 0; // Asegurarse que sea 0 en carga inicial
        } else {
            setIsLoadingMore(true); // Cargando página adicional
            // --- Capturar la altura del scroll ANTES de setear los mensajes ---
            // Esto se usa en useLayoutEffect para mantener la posición
            if (messagesContainerRef.current) {
                oldScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
                console.log("Capturing old scrollHeight for page", page, ":", oldScrollHeightRef.current);
            } else {
                oldScrollHeightRef.current = 0;
            }
        }
        setMessagesError(null);


        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages?page=${page}&per_page=${perPage}`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`Messages for conv ${conversationId}, page ${page}:`, data);

                // --- SIEMPRE añadir mensajes al FINAL si usamos column-reverse ---
                setMessages(prevMessages => {
                    if (page === 1) {
                        // Primera página: simplemente reemplazamos con los mensajes de la página 1
                        return data.messages;
                    } else {
                        // Páginas subsiguientes: añadir los mensajes (más viejos) al FINAL
                        // porque column-reverse los mostrará arriba
                        return [...prevMessages, ...data.messages];
                    }
                });


                setMessagePagination(data.pagination); // Actualizar estado de paginación

            } else {
                const errorData = await res.json();
                setMessagesError(errorData.message || `Error fetching messages: ${res.status}`);
                console.error("Error fetching messages:", res.status, errorData);
                setMessages(prevMessages => page === 1 ? [] : prevMessages); // Limpiar solo si es la primera página
                setMessagePagination({
                    total_items: 0, total_pages: 0, current_page: page, items_per_page: perPage,
                    has_next: false, has_prev: false, next_page: null, prev_page: null,
                });
                oldScrollHeightRef.current = 0; // Reset on error
            }
        } catch (error) {
            setMessagesError(`Network error fetching messages: ${error.message}`);
            console.error("Network error fetching messages:", error);
            setMessages(prevMessages => page === 1 ? [] : prevMessages); // Limpiar solo si es la primera página
            setMessagePagination({
                total_items: 0, total_pages: 0, current_page: page, items_per_page: perPage,
                has_next: false, has_prev: false, next_page: null, prev_page: null,
            });
            oldScrollHeightRef.current = 0; // Reset on error
        } finally {
            if (page === 1) {
                setIsLoadingMessages(false); // Termina carga inicial
            } else {
                setIsLoadingMore(false); // Termina carga adicional
            }
        }
    }, [selectedConversationId, messagePagination.items_per_page]); // Dependencies adjusted: Removed 'messages'


    useEffect(() => {
        if (selectedConversationId !== null) {
            // Al seleccionar, siempre cargar la primera página (más vieja)
            // Removido el argumento 'append'
            fetchMessages(selectedConversationId, 1, messagePagination.items_per_page);
        } else {
            // Limpiar si no hay conversación seleccionada
            setMessages([]);
            setMessagePagination({
                total_items: 0, total_pages: 0, current_page: 0, items_per_page: messagePagination.items_per_page,
                has_next: false, has_prev: false, next_page: null, prev_page: null,
            });
            oldScrollHeightRef.current = 0; // Limpiar ref
        }
    }, [selectedConversationId, fetchMessages, messagePagination.items_per_page]); // Dependencias ajustadas


    useLayoutEffect(() => {
        const messagesContainer = messagesContainerRef.current;

        // Solo ajustar si hay un contenedor, si selectedConversationId está activo (no es la limpieza inicial)
        // y si messages *cambió* (indicando que se cargaron nuevos mensajes)
        // También si no estamos en la primera carga (page === 1)
        if (messagesContainer && selectedConversationId !== null && messages.length > 0 && messagePagination.current_page > 1) {
            // La altura del scroll *antes* de añadir los mensajes fue guardada en fetchMessages (oldScrollHeight)
            // La altura del scroll *ahora* (después de añadir) es messagesContainer.scrollHeight

            // Calcular la diferencia de altura introducida por los nuevos mensajes
            // Necesitamos acceso a oldScrollHeight capturado en fetchMessages
            // Esto es tricky sin Redux/Context o pasar oldScrollHeight.
            // Una alternativa más simple es guardar solo la altura ANTES y calcular la diferencia AHORA.

            // Vamos a re-capturar la altura del scroll justo antes de la actualización en fetchMessages
            // y pasarla como argumento a fetchMessages.

            // --- Revisar fetchMessages y pasar oldScrollHeight ---
            // Ya modifiqué fetchMessages para capturar oldScrollHeight
            // Necesitamos que fetchMessages retorne oldScrollHeight o que lo guarde en un ref temporal.
            // Guardarlo en un ref temporal es más limpio.

            // --- Ref temporal para oldScrollHeight ---

            // --- Modificar fetchMessages para usar oldScrollHeightRef ---
            // (Ya lo hicimos arriba en la definición de fetchMessages)

            // --- Lógica de ajuste en useLayoutEffect ---
            const newScrollHeight = messagesContainer.scrollHeight;
            const heightDifference = newScrollHeight - oldScrollHeightRef.current;

            console.log("Adjusting scroll...", { oldScrollHeight: oldScrollHeightRef.current, newScrollHeight, heightDifference }); // Log

            // Ajustar el scrollTop
            messagesContainer.scrollTop += heightDifference;
            console.log("Scroll adjusted to:", messagesContainer.scrollTop); // Log

            // Limpiar el ref después de usarlo si es necesario, o dejarlo para la siguiente carga
            // oldScrollHeightRef.current = 0; // Limpiar
        }

    }, [messages, selectedConversationId, messagePagination.current_page]);

    // --- Handler para seleccionar una conversación de la lista ---
    const handleConversationSelect = useCallback((conversationId) => {
        console.log("Conversation selected:", conversationId);
        setSelectedConversationId(conversationId); // Esto disparará el useEffect para cargar mensajes
        setNewMessageContent(''); // Limpiar el input de nuevo mensaje al cambiar de conversación
        setSendMessageError(null); // Limpiar errores de envío
    }, []); // No depende de nada, puede usar useCallback



    // --- Handler para cargar la siguiente/anterior página de mensajes ---
    const handleLoadMoreMessages = useCallback(() => {
        if (messagePagination.has_next && messagePagination.next_page !== null) {
            console.log("Loading next page of messages:", messagePagination.next_page);
            // Llama a fetchMessages con la siguiente página.
            // fetchMessages ahora maneja internamente añadir al final si page > 1
            fetchMessages(selectedConversationId, messagePagination.next_page, messagePagination.items_per_page); // <-- Removed 'append'
        }
    }, [messagePagination, selectedConversationId, fetchMessages]); // Dependencias

    const handleScroll = () => {
        // --- Detectar scroll hacia arriba en un contenedor con column-reverse ---
        // Con column-reverse, scrollTop es 0 cuando estás ABAJO.
        // Necesitas detectar cuando scrollTop es igual a (scrollHeight - clientHeight)
        // cuando scrolleas hacia arriba (hacia el inicio visual / el final del array).
        // O más simplemente, detectar cuando estás cerca del final visual del scroll.

        const scrollThreshold = 50; // Cargar cuando queden 50px o menos para llegar arriba (fin visual)
        const isNearTopVisual = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - scrollThreshold;

        // console.log("Scrolling...", { scrollTop: messagesContainer.scrollTop, clientHeight: messagesContainer.clientHeight, scrollHeight: messagesContainer.scrollHeight, isNearTopVisual }); // Log detallado de scroll

        // Cargar si estás cerca del inicio VISUAL (fin del array con column-reverse), no está cargando, y hay siguiente página.
        if (isNearTopVisual && !isLoadingMessages && !isLoadingMore && messagePagination.has_next) {
            console.log("Scrolled near visual top, attempting to load more..."); // Log
            // Llama a la función para cargar la siguiente página (la más antigua)
            handleLoadMoreMessages();
        }
    };

    // --- useEffect y Handler para detectar scroll y cargar más mensajes ---
    useEffect(() => {
        const messagesContainer = messagesContainerRef.current;

        // Attach listener only if container exists, conv selected, not loading, and there are more pages
        if (!messagesContainer || selectedConversationId === null || isLoadingMessages || isLoadingMore || !messagePagination.has_next) {
            // ... (cleanup logic - same) ...
            if (messagesContainer) { // Ensure cleanup runs if listener was attached
                messagesContainer.removeEventListener('scroll', handleScroll);
                console.log("Scroll listener cleanup."); // Log
            }
            return;
        }


        // Adjuntar el event listener
        messagesContainer.addEventListener('scroll', handleScroll);
        console.log("Scroll listener attached for conv:", selectedConversationId); // Log

        // Limpieza: remover el event listener
        return () => {
            messagesContainer.removeEventListener('scroll', handleScroll);
            console.log("Scroll listener removed for conv:", selectedConversationId); // Log
        };

    }, [selectedConversationId, isLoadingMessages, isLoadingMore, messagePagination.has_next, handleLoadMoreMessages]); // Dependencias del listener

    useLayoutEffect(() => {
        const messagesContainer = messagesContainerRef.current;

        // Ajustar solo si hay contenedor, si selectedConversationId está activo (no es la limpieza inicial)
        // y si messages *cambió* debido a una carga *adicional* (page > 1).
        // current_page se actualiza DESPUES de que el fetch termina.
        // Si current_page > 1, significa que la carga anterior fue una página > 1
        // y messages fue añadido al final.
        if (messagesContainer && selectedConversationId !== null && messagePagination.current_page > 1 && !isLoadingMessages && !isLoadingMore) {

            // oldScrollHeight fue capturado y guardado en oldScrollHeightRef.current justo antes de setMessages
            const newScrollHeight = messagesContainer.scrollHeight;
            const heightDifference = newScrollHeight - oldScrollHeightRef.current;

            console.log("Adjusting scroll...", { oldScrollHeight: oldScrollHeightRef.current, newScrollHeight, heightDifference });

            // Ajustar el scrollTop. Sumamos la diferencia.
            messagesContainer.scrollTop += heightDifference; // Ajusta el scroll para compensar la nueva altura añadida
            console.log("Scroll adjusted to:", messagesContainer.scrollTop);

            // El ref se resetea en fetchMessages para la primera página,
            // y se actualiza para páginas > 1 antes de setMessages.
            // No necesitas resetearlo aquí explícitamente a 0 a menos que quieras.

        } else if (messagesContainer && selectedConversationId !== null && messagePagination.current_page === 1 && messages.length > 0 && !isLoadingMessages) {
            // Caso especial: Carga inicial (página 1). Scrollear al fondo VISUAL.
            // Con column-reverse, el fondo visual es scrollHeight - clientHeight.
            messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            console.log("Initial load (page 1), scrolling to visual bottom."); // Log
        }


    }, [messages, selectedConversationId, messagePagination.current_page, isLoadingMessages, isLoadingMore]); // Dependencias


    useEffect(() => {
        const handleScroll = () => {
            // --- Detectar scroll hacia arriba en un contenedor con column-reverse ---
            // Con column-reverse, scrollTop es 0 cuando estás ABAJO.
            // Necesitas detectar cuando scrollTop es igual a (scrollHeight - clientHeight)
            // cuando scrolleas hacia arriba (hacia el inicio visual / el final del array).
            // O más simplemente, detectar cuando estás cerca del final visual del scroll.

            const scrollThreshold = 50; // Cargar cuando queden 50px o menos para llegar arriba (fin visual)
            const isNearTopVisual = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - scrollThreshold;

            // console.log("Scrolling...", { scrollTop: messagesContainer.scrollTop, clientHeight: messagesContainer.clientHeight, scrollHeight: messagesContainer.scrollHeight, isNearTopVisual }); // Log detallado de scroll

            // Cargar si estás cerca del inicio VISUAL (fin del array con column-reverse), no está cargando, y hay siguiente página.
            if (isNearTopVisual && !isLoadingMessages && !isLoadingMore && messagePagination.has_next) {
                console.log("Scrolled near visual top, attempting to load more..."); // Log
                // Llama a la función para cargar la siguiente página (la más antigua)
                handleLoadMoreMessages();
            }
        };

        const messagesContainer = messagesContainerRef.current;

        // Attach listener only if container exists, conv selected, not loading, and there are more pages
        if (!messagesContainer || selectedConversationId === null || isLoadingMessages || isLoadingMore || !messagePagination.has_next) {
            // ... (cleanup logic - same) ...
            if (messagesContainer) { // Ensure cleanup runs if listener was attached
                messagesContainer.removeEventListener('scroll', handleScroll);
                console.log("Scroll listener cleanup."); // Log
            }
            return;
        }


        // Adjuntar el event listener
        messagesContainer.addEventListener('scroll', handleScroll);
        console.log("Scroll listener attached for conv:", selectedConversationId); // Log

        // Limpieza: remover el event listener
        return () => {
            messagesContainer.removeEventListener('scroll', handleScroll);
            console.log("Scroll listener removed for conv:", selectedConversationId); // Log
        };

    }, [selectedConversationId, isLoadingMessages, isLoadingMore, messagePagination.has_next, handleLoadMoreMessages]); // Dependencias del listener


    // --- Handler para enviar un nuevo mensaje ---
    const handleSendMessage = async (e) => {
        e.preventDefault(); // Prevenir recarga de página por el formulario
        if (!selectedConversationId || !newMessageContent.trim()) {
            // No enviar si no hay conversación seleccionada o el mensaje está vacío
            console.log("Cannot send empty message or no conversation selected.");
            return;
        }

        setIsSendingMessage(true);
        setSendMessageError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations/${selectedConversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newMessageContent }),
            });

            if (res.ok) {
                const newMessage = await res.json();
                console.log("Message sent:", newMessage);
                setMessages(prevMessages => [...prevMessages, newMessage]); // Add to the end for column-reverse
                setNewMessageContent(''); setSendMessageError(null);
                setTimeout(() => { // Scroll to bottom
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight;
                    }
                }, 0);
                // Nota: En una aplicación real, es posible que necesites manejar la sincronización
                // con otros usuarios (WebSockets) para ver los mensajes enviados/recibidos en tiempo real.

            } else {
                const errorData = await res.json();
                setSendMessageError(errorData.message || `Error sending message: ${res.status}`);
                console.error("Error sending message:", res.status, errorData);
            }
        } catch (error) {
            setSendMessageError(`Network error sending message: ${error.message}`);
            console.error("Network error sending message:", error);
        } finally {
            setIsSendingMessage(false);
        }
    };

    // --- Handler para iniciar un nuevo DM ---
    const handleStartNewDM = async (e) => {
        e.preventDefault();
        const otherUserId = parseInt(dmUserIdInput, 10);
        if (isNaN(otherUserId) || otherUserId <= 0) { setCreateDmError("Por favor, ingresa un ID de usuario válido."); return; }
        if (otherUserId === currentUserId) { setCreateDmError("No puedes enviarte un DM a ti mismo."); return; }
        // ... resto de la lógica handleStartNewDM ...
        setIsCreatingDm(true); setCreateDmError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/messages/users/${otherUserId}/conversation`, { method: 'POST', credentials: 'include', });
            if (res.ok) {
                const conversation = await res.json(); console.log("DM conversation obtained/created:", conversation);
                if (!conversations.some(c => c.id === conversation.id)) {
                    const newConvData = { ...conversation, last_message: null }; // last_message might be populated by backend now
                    // Better: Refetch the conversations list after creating/getting a DM
                    // This ensures the list is up-to-date and includes the new/reactivated conv with last_message
                    fetchConversations(); // <-- Call the fetch function
                } else {
                    // If the conversation was already in the list (but perhaps soft-deleted and now reactivated)
                    // You might need to update its state in the list if fetchConversations doesn't run immediately
                    // Or rely on the fetchConversations call above to update the list.
                    // For now, relying on fetchConversations. If it doesn't work, you'd need to manually update the state.
                }
                handleConversationSelect(conversation.id); setDmUserIdInput(''); setCreateDmError(null);
            } else { const errorData = await res.json(); setCreateDmError(errorData.message || `Error starting DM: ${res.status}`); }
        } catch (error) { setCreateDmError(`Network error starting DM: ${error.message}`); }
        finally { setIsCreatingDm(false); }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        // Validar inputs
        const groupName = newGroupName.trim();
        const participantIdsString = newGroupParticipantIdsInput.trim();

        if (!participantIdsString) {
            setCreateGroupError("La lista de IDs de participantes es obligatoria.");
            return;
        }

        // Parsear IDs de participantes (separados por coma, por ejemplo)
        const participantIds = participantIdsString
            .split(',')
            .map(id => parseInt(id.trim(), 10))
            .filter(id => !isNaN(id) && id > 0); // Filtrar IDs válidos y positivos

        if (participantIds.length === 0) {
            setCreateGroupError("Ingresa al menos un ID de participante válido.");
            return;
        }

        // Asegurarse de que el usuario actual está en la lista de participantes
        if (!participantIds.includes(currentUserId)) {
            participantIds.push(currentUserId);
        }

        // Opcional: Validar si solo hay 2 participantes para sugerir usar la función de DM
        if (participantIds.length === 2) {
            // Podrías dar un aviso o redirigir al handler de DM
            console.warn("Only 2 participants, consider using 'Start New DM' instead.");
            // setCreateGroupError("Para chats de 2 personas, usa la opción 'Iniciar nuevo DM'.");
            // return; // Bloquear la creación de grupo para 2
        }

        setIsCreatingGroup(true);
        setCreateGroupError(null);

        try {
            // Llama a la ruta POST /messages/conversations para crear grupo
            const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: groupName || null, // Enviar nombre o null si está vacío
                    participant_ids: participantIds,
                }),
            });

            if (res.ok) {
                const newConversation = await res.json();
                console.log("Group conversation created:", newConversation);

                // Opcional: Añadir la nueva conversación a la lista y seleccionarla
                // La respuesta del backend ya debería incluir participantes y creador
                setConversations(prevConversations => [newConversation, ...prevConversations]); // Añadir al inicio
                handleConversationSelect(newConversation.id); // Seleccionar la nueva conversación

                // Limpiar formulario después de crear
                setNewGroupName('');
                setNewGroupParticipantIdsInput('');
                setCreateGroupError(null);

                // Opcional: Mostrar mensaje de éxito
                // alert(`Grupo "${newConversation.name || 'Sin Nombre'}" creado.`);

            } else {
                const errorData = await res.json();
                setCreateGroupError(errorData.message || `Error creating group: ${res.status}`);
                console.error("Error creating group:", res.status, errorData);
            }

        } catch (error) {
            setCreateGroupError(`Network error creating group: ${error.message}`);
            console.error("Network error creating group:", error);
        } finally {
            setIsCreatingGroup(false);
        }
    };

    const getConversationDisplayName = useCallback((conv) => {
        if (conv.name) {
            return conv.name; // Si tiene nombre, es un grupo (o un DM con nombre)
        } else {
            // Es un DM (nombre es null). Mostrar los nombres de los otros participantes.
            // conv.participants debe estar cargado y contener objetos User serializados
            if (conv.participants && conv.participants.length > 0) {
                 const otherParticipants = conv.participants.filter(p => p.id !== currentUserId);
                 if (otherParticipants.length > 0) {
                      return otherParticipants.map(p => p.username || `Usuario ${p.id}`).join(', '); // Unir nombres de otros participantes
                 } else {
                      return `Chat contigo mismo (ID: ${conv.id})`; // Caso raro si solo hay 1 participante (tú)
                 }
            } else {
                 return `Conversación (ID: ${conv.id})`; // Fallback si no hay participantes cargados
            }
        }
    }, [currentUserId]);
    // --- Handler para salirse de una conversación ---
    const handleLeaveConversation = async (conversationId) => {
        if (!window.confirm(`¿Estás seguro de que quieres salir de esta conversación (ID: ${conversationId})?`)) {
            return; // Cancelar si el usuario no confirma
        }

        setIsLoadingConversations(true); // Podría mostrar un indicador global o específico
        setConversationsError(null);

        try {
            // Llama a la ruta DELETE para salirse
            const res = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/participants/me`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                console.log(`Left conversation ${conversationId}`);

                // Eliminar la conversación de la lista local
                setConversations(conversations.filter(conv => conv.id !== conversationId));

                // Si la conversación eliminada era la seleccionada, limpiar la vista de mensajes
                if (selectedConversationId === conversationId) {
                    setSelectedConversationId(null);
                    setMessages([]);
                    setMessagePagination({ // Resetear paginación
                        total_items: 0, total_pages: 0, current_page: 0, items_per_page: messagePagination.items_per_page,
                        has_next: false, has_prev: false, next_page: null, prev_page: null,
                    });
                }
                // Opcional: Mostrar un mensaje de éxito al usuario
                // alert(`Saliste de la conversación ${conversationId}.`);

            } else {
                const errorData = await res.json();
                setConversationsError(errorData.message || `Error leaving conversation ${conversationId}: ${res.status}`);
                console.error(`Error leaving conversation ${conversationId}:`, res.status, errorData);
            }

        } catch (error) {
            setConversationsError(`Network error leaving conversation ${conversationId}: ${error.message}`);
            console.error(`Network error leaving conversation ${conversationId}:`, error);
        } finally {
            // Puede que no necesites setear isLoadingConversations a false aquí si la lista
            // de conversaciones se vuelve a cargar después de salir, pero si no, sí.
            // set...(false);
            // Alternativa: Refetch la lista completa después de salir
            // fetchConversations(); // Necesitarías mover fetchConversations fuera del useEffect para llamarla aquí
        }
    };


    // --- Renderizado Básico (Sin Estilos) ---
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100"> {/* Añadir padding, fondo y colores de texto */}

            <h1 className="text-2xl font-bold mb-4">Mensajes</h1> {/* Estilo para el título principal */}

            {/* --- Sección para iniciar un nuevo DM --- */}
            <div className="mb-6 p-4 border border-gray-300 dark:border-gray-700 rounded-lg"> {/* Margen abajo, padding, borde, esquinas redondeadas */}
                <h2 className="text-xl font-semibold mb-3">Iniciar nuevo DM</h2> {/* Estilo para subtítulo */}
                <form onSubmit={handleStartNewDM} className="flex gap-4"> {/* Usar flexbox para los elementos del formulario */}
                    <input
                        type="number"
                        placeholder="ID de usuario para DM"
                        value={dmUserIdInput}
                        onChange={(e) => setDmUserIdInput(e.target.value)}
                        disabled={isCreatingDm}
                        className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50" // Estilo de input con dark mode y focus
                    />
                    <button
                        type="submit"
                        disabled={isCreatingDm}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" // Estilo de botón con dark mode y disabled
                    >
                        {isCreatingDm ? 'Iniciando DM...' : 'Iniciar DM'}
                    </button>
                </form>
                {createDmError && <p className="text-red-500 text-sm mt-2">{createDmError}</p>} {/* Estilo de error */}
            </div>


            {/* --- NUEVA Sección para Crear Grupo --- */}
            <div className="mb-6 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                 <h2 className="text-xl font-semibold mb-3">Crear nuevo Grupo</h2>
                 <form onSubmit={handleCreateGroup} className="flex flex-col gap-4"> {/* Formulario en columna */}
                     <div>
                         <label htmlFor="groupName" className="block text-sm font-medium mb-1">Nombre del Grupo (Opcional):</label>
                         <input
                             type="text" id="groupName" placeholder="Nombre del Grupo"
                             value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                             disabled={isCreatingGroup}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                         />
                     </div>
                     <div>
                         <label htmlFor="participantIds" className="block text-sm font-medium mb-1">IDs de Participantes (separados por coma):</label>
                         <input
                             type="text" id="participantIds" placeholder="Ej: 3, 5, 8"
                             value={newGroupParticipantIdsInput} onChange={(e) => setNewGroupParticipantIdsInput(e.target.value)}
                             disabled={isCreatingGroup}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                         />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tu ID ({currentUserId}) será añadido automáticamente.</p> {/* Ayuda al usuario */}
                     </div>
                     <button
                         type="submit" disabled={isCreatingGroup}
                         className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed self-start" // Alinear botón a la izquierda
                     >
                         {isCreatingGroup ? 'Creando Grupo...' : 'Crear Grupo'}
                     </button>
                 </form>
                 {createGroupError && <p className="text-red-500 text-sm mt-2">{createGroupError}</p>}
             </div>


            <hr className="my-6 border-gray-300 dark:border-gray-700" /> {/* Estilo para el separador */}

            {/* --- Sección de Lista de Conversaciones --- */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Tus Conversaciones Activas</h2> {/* Título ajustado */}
                {isLoadingConversations && <p>Cargando conversaciones...</p>}
                {conversationsError && <p className="text-red-500">{conversationsError}</p>}
                {!isLoadingConversations && conversations.length === 0 && !conversationsError && (
                    <p>No tienes conversaciones activas aún.</p> 
                )}
                {!isLoadingConversations && conversations.length > 0 && (
                    <ul className="space-y-3">
                        {conversations.map(conv => (
                             // Filtramos por conv.deleted_at === null en el fetch,
                             // así que la lista 'conversations' ya solo debería tener activos.
                             // No necesitamos un filtro aquí a menos que el fetch traiga todos.
                             // Si el fetch trae todos, agregar: {conversations.filter(conv => conv.deleted_at === null).map(conv => (...))}

                            <li
                                key={conv.id}
                                onClick={() => handleConversationSelect(conv.id)}
                                className={`p-4 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer transition duration-200 ${selectedConversationId === conv.id ? 'bg-blue-100 dark:bg-blue-800 border-blue-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'} flex justify-between items-center`} // Flex y alineación para contenido y botón Salir
                            >
                                <div className="flex-grow mr-4"> {/* Contenido de la conversación */}
                                     {/* Mostrar nombre del grupo O nombres de participantes para DM */}
                                    <p className="font-medium">{getConversationDisplayName(conv)}</p>
                                     {/* Mostrar creador (opcional) */}
                                     {conv.creator ? (
                                         <p className="text-xs text-gray-500 dark:text-gray-400">Creador: {conv.creator.username}</p>
                                     ) : (
                                         conv.creator_id && <p className="text-xs text-gray-500 dark:text-gray-400">Creador ID: {conv.creator_id}</p>
                                     )}

                                    {conv.last_message ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                             {/* Mostrar remitente del último mensaje si está disponible */}
                                             {conv.last_message.sender ? conv.last_message.sender.username : `Usuario ${conv.last_message.sender_id}`}: {conv.last_message.content} ({new Date(conv.last_message.timestamp).toLocaleString()})
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sin mensajes aún.</p>
                                    )}
                                </div>
                                 {/* Botón para salirse del grupo */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLeaveConversation(conv.id);
                                    }}
                                     className="flex-shrink-0 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900" // Flex-shrink-0 para que no se encoja
                                >
                                    Salir
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <hr className="my-6 border-gray-300 dark:border-gray-700" /> {/* Estilo para el separador */}

            {/* --- Sección de Mensajes de la Conversación Seleccionada --- */}
            <div className="flex flex-col h-full">
                 <h2 className="text-xl font-semibold mb-3">
                    {selectedConversationId === null
                        ? 'Selecciona una conversación'
                         // Usar el nombre de display para el título si hay una conversación seleccionada
                        : `Mensajes de: ${getConversationDisplayName(conversations.find(c => c.id === selectedConversationId))}` // Buscar la conversación seleccionada para obtener su nombre de display
                    }
                 </h2>

                 {/* Indicadores de carga y errores */}
                 {isLoadingMessages && selectedConversationId !== null && <p className="text-center">Cargando mensajes...</p>}
                 {isLoadingMore && selectedConversationId !== null && <p className="text-center">Cargando más mensajes antiguos...</p>}
                 {messagesError && <p className="text-red-500">{messagesError}</p>}

                 {/* Contenedor de Mensajes Scrollable */}
                {selectedConversationId !== null && (
                    <div
                        ref={messagesContainerRef}
                         className="flex flex-col-reverse overflow-y-auto h-96 border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-100 dark:bg-gray-800 space-y-4"
                    >
                    {/* Nota: space-y-4 aplicado aquí con column-reverse crea espacio en la parte inferior */}


                     {/* Indicador de carga para mensajes *antiguos* (scroll up) */}
                    {/* Mostrarlo dentro del contenedor de scroll si es posible, arriba del todo visualmente */}
                     {isLoadingMore && <p className="text-center text-sm text-gray-600 dark:text-gray-400">Cargando más...</p>}


                     {/* Si hay mensajes, mostrarlos */}
                    {messages.length > 0 && (
                        <ul className="space-y-4 pt-2"> {/* Añadir pt-2 para espacio arriba */}
                            {messages.map(message => (
                                     // Estilo para cada mensaje LI
                                    <li
                                        key={message.id}
                                         // Usar flexbox para alinear a la izquierda o derecha
                                        className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                    >
                                         {/* Contenedor del Contenido del Mensaje (la "burbuja") */}
                                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${message.sender_id === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                                            {/* Mostrar nombre del remitente si está cargado */}
                                            <p className="text-sm font-semibold mb-1">
                                                 {message.sender ? message.sender.username : `Usuario ${message.sender_id}`}
                                            </p>
                                            <p className="text-base whitespace-pre-wrap break-words">{/* whitespace-pre-wrap para saltos de línea, break-words para evitar desbordamiento */}
                                                {message.content}
                                            </p>
                                            <p className="text-xs text-right mt-1 opacity-80">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                         {/* Mensaje si no hay mensajes en la conversación seleccionada (y no está cargando) */}
                        { !isLoadingMessages && !isLoadingMore && messages.length === 0 && !messagesError && (
                            <p className="text-center text-gray-600 dark:text-gray-400">Esta conversación no tiene mensajes aún.</p>
                        )}

                    </div>
                )}

                {/* Sección para enviar un nuevo mensaje */}
                {selectedConversationId !== null && (
                    // Formulario para enviar
                    <form onSubmit={handleSendMessage} className="flex gap-4 mt-2"> {/* Flex para el formulario, espacio entre elementos, margen arriba */}
                        <textarea
                            placeholder="Escribe tu mensaje..."
                            value={newMessageContent}
                            onChange={(e) => setNewMessageContent(e.target.value)}
                            rows="3" // Altura inicial
                            disabled={isSendingMessage}
                            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-none" // Estilo de textarea, sin redimensionar
                        />
                        <button
                            type="submit"
                            disabled={isSendingMessage || !newMessageContent.trim()} // Deshabilitar si está enviando o el mensaje está vacío
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" // Estilo de botón "Enviar"
                        >
                            {isSendingMessage ? 'Enviando...' : 'Enviar'}
                        </button>
                    </form>
                )}

            </div> {/* Cierre del contenedor flex principal del área de mensajes */}

        </div> // Cierre del contenedor principal de la página
    );
}

export default MessagesPage;
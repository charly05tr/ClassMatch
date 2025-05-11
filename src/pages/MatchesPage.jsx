// MatchesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client'; // Importar el cliente de Socket.IO
// Asumimos que tienes un componente UserCard o similar para mostrar información del usuario
// import UserCard from '../components/UserCard'; // Ejemplo
// Asumimos que tienes una URL base para tu API y WebSocket
const API_BASE_URL = 'https://192.168.0.4:5000'; // Ajusta esto a la URL de tu backend Flask
const WEBSOCKET_URL = 'https://192.168.0.4:5000'; // Ajusta esto a la URL de tu backend SocketIO

// Asegúrate de pasar el currentUserId como prop o usar un contexto de autenticación
function MatchesPage({ currentUserId }) {
    // Usamos una sola lista para todas las interacciones de match
    const [allMatchInteractions, setAllMatchInteractions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null); // Estado para la instancia del socket

    // Helper para obtener la URL de la foto de perfil (puede estar duplicado si ya lo tienes)
    const getUserPhotoUrl = useCallback((user) => {
        if (user && user.profile_picture) {
            return user.profile_picture;
        }
        const initials = (user?.name || user?.username || '??').slice(0, 2).toUpperCase();
        return `https://placehold.co/150x150/E0E0E0/000000?text=${initials}`;
    }, []);


    // --- Fetch All Match Interactions ---
    // Función para cargar todas las interacciones de match del usuario actual
    const fetchAllMatchInteractions = useCallback(async () => {
        if (!currentUserId) {
            console.log("fetchAllMatchInteractions: currentUserId is null, skipping fetch.");
            setIsLoading(false);
            setAllMatchInteractions([]); // Limpiar la lista si no hay usuario loggeado
            return;
        }
        console.log(`fetchAllMatchInteractions: Fetching all match interactions for user ${currentUserId}...`);
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/matches/user/${currentUserId}`, {
                method: 'GET',
                credentials: 'include', // Importante para enviar cookies de sesión
            });
            if (res.ok) {
                const data = await res.json(); // Esto es una lista de objetos Match
                console.log("fetchAllMatchInteractions: Match interactions fetched successfully:", data);
                // *** LOG PARA VER SI EL ESTADO SE ACTUALIZA ***
                setAllMatchInteractions(prevInteractions => {
                    console.log("fetchAllMatchInteractions: Updating allMatchInteractions state with data:", data);
                    return data;
                }); // Actualizar estado
            } else {
                const errorData = await res.json();
                setError(errorData.message || `Error fetching match interactions: ${res.status}`);
                console.error("fetchAllMatchInteractions: Error fetching match interactions:", res.status, errorData);
                setAllMatchInteractions([]);
            }
        } catch (error) {
            setError(`Network error fetching match interactions: ${error.message}`);
            console.error("fetchAllMatchInteractions: Network error fetching match interactions:", error);
            setAllMatchInteractions([]);
        } finally {
            setIsLoading(false);
            console.log("fetchAllMatchInteractions: Loading finished.");
        }
    }, [currentUserId]); // Depende de currentUserId // Depende de API_BASE_URL


    // Efecto para cargar las interacciones al montar el componente o cambiar currentUserId
    useEffect(() => {
        console.log("MatchesPage useEffect: Calling fetchAllMatchInteractions.");
        fetchAllMatchInteractions();
    }, [fetchAllMatchInteractions]); // Depende de fetchAllMatchInteractions

    // --- WebSocket Connection and Event Handlers ---
    useEffect(() => {
        // Solo intentar conectar si el usuario actual está disponible
        if (currentUserId !== null) {
            console.log(`MatchesPage useEffect (WS): Intentando conectar WebSocket para matches para user ${currentUserId}...`);
            const newSocket = io(`${WEBSOCKET_URL}?userId=${currentUserId}`, {
                 cors: {
                     origin: "http://192.168.0.4:5173", // Reemplaza con el origen de tu frontend
                     credentials: true
                 }
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
               console.log('MatchesPage WS: WebSocket para matches conectado!', newSocket.id);
               // Unirse a la sala personal del usuario para recibir eventos dirigidos a él
               newSocket.emit('join_room', { room: `user_${currentUserId}` });
               console.log(`MatchesPage WS: Unido a room user_${currentUserId} para matches`);
            });

            newSocket.on('disconnect', (reason) => {
               console.log('MatchesPage WS: WebSocket para matches desconectado:', reason);
            });

            newSocket.on('connect_error', (error) => {
               console.error('MatchesPage WS: WebSocket Connection Error para matches:', error);
            });

            // Listener para nuevo like recibido (alguien te dio like)
            newSocket.on('new_like', (data) => {
                console.log('MatchesPage WS: Evento WS new_like recibido:', data);
                alert(`¡Tienes un nuevo like de Usuario ${data.user_id}!`); // Ejemplo simple
                // Recargar la lista completa para que aparezca en la lista unificada.
                fetchAllMatchInteractions();
            });

            // Listener para mutual match (ambos se dieron like)
            newSocket.on('mutual_match', (data) => {
                console.log('MatchesPage WS: Evento WS mutual_match recibido:', data);
                alert(`¡Es un Match con Usuario ${data.user.name || data.matched_user.name}!`); // Ejemplo simple

                // *** LOG PARA VER SI fetchAllMatchInteractions SE LLAMA ***
                console.log("MatchesPage WS: mutual_match received, calling fetchAllMatchInteractions().");
                fetchAllMatchInteractions(); // Llama a fetchAllMatchInteractions para obtener la lista actualizada

                // Opcional: Puedes usar la conversation_id recibida para redirigir al chat
                // if (data.conversation_id) {
                //     // Redirigir al chat de este match
                //     // Asegúrate de tener acceso a la navegación (ej. useHistory o useNavigate)
                //     // navigate('/messages', { state: { conversationIdToOpen: data.conversation_id } });
                // }
            });

            // Listener para unmatched (alguien te eliminó de sus matches)
            newSocket.on('unmatched', (data) => {
                 console.log('MatchesPage WS: Evento WS unmatched recibido:', data);
                 alert(`Usuario ${data.unmatched_with_user_id} te ha eliminado de sus matches.`); // Ejemplo simple

                 // Un unmatched significa que un match mutuo se ha roto.
                 // Recargamos la lista completa.
                 fetchAllMatchInteractions();
            });

             // Listener para like_removed (alguien que te dio like, ahora lo quitó ANTES de ser mutual)
             newSocket.on('like_removed', (data) => {
                 console.log('MatchesPage WS: Evento WS like_removed recibido:', data);
                 alert(`Usuario ${data.removed_by_user_id} ha retirado su like.`); // Ejemplo simple
                 // Un like removido por el otro usuario significa que un like que yo recibí ha desaparecido.
                 // Recargamos la lista completa.
                 fetchAllMatchInteractions();
             });


            // Limpieza: Desconectar el socket y remover listeners
            return () => {
                 console.log('MatchesPage useEffect (WS): Desconectando WebSocket para matches...');
                 newSocket.off('connect');
                 newSocket.off('disconnect');
                 newSocket.off('connect_error');
                 newSocket.off('new_like');
                 newSocket.off('mutual_match');
                 newSocket.off('unmatched');
                 newSocket.off('like_removed');
                 newSocket.disconnect();
                 setSocket(null);
                 console.log('MatchesPage useEffect (WS): WebSocket cleanup complete.');
            };
        } else {
             // Limpieza si currentUserId se vuelve null (ej. logout)
             if (socket) {
                 console.log('MatchesPage useEffect (WS): Desconectando WebSocket para matches debido a logout...');
                 socket.disconnect();
                 setSocket(null);
             }
        }

    }, [currentUserId, fetchAllMatchInteractions]); // Depende de currentUserId y fetchAllMatchInteractions


    // --- Handle Like ---
    // Función para enviar un like a otro usuario (usada para "Dar Like de Vuelta")
    const handleLike = useCallback(async (userIdToLike) => {
        if (!currentUserId) {
            alert("Debes iniciar sesión para dar like.");
            return;
        }
         if (String(currentUserId) === String(userIdToLike)) {
             alert("No puedes darte like a ti mismo.");
             return;
         }

        console.log(`handleLike: User ${currentUserId} attempting to like user ${userIdToLike}`);

        try {
            const res = await fetch(`${API_BASE_URL}/matches/${userIdToLike}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                // No body needed for this specific POST route
            });

            if (res.ok) {
                const matchData = await res.json();
                console.log("handleLike: Like/Match response:", res.status, matchData);

                if (res.status === 201) { // Created (new like)
                    alert("Like enviado!"); // O mostrar feedback en UI
                    // Recargamos la lista completa para que aparezca en la lista unificada.
                    fetchAllMatchInteractions();
                } else if (res.status === 200) { // OK (mutual match)
                    alert("¡Es un Match!"); // O mostrar feedback en UI
                    // La lista se actualizará vía WS o recarga
                    fetchAllMatchInteractions();
                } else if (res.status === 409) { // Conflict (already liked)
                    alert("Ya le has dado like a este usuario.");
                } else {
                    const errorData = matchData; // Assuming error details are in the body
                    alert(`Error al dar like: ${errorData.message || res.status}`);
                    console.error("handleLike: Error response status:", res.status, errorData);
                }

            } else {
                 const errorData = await res.json();
                 alert(`Error al dar like: ${errorData.message || res.status}`);
                 console.error("handleLike: API error response:", res.status, errorData);
            }
        } catch (error) {
            alert(`Error de red al dar like: ${error.message}`);
            console.error("handleLike: Network error liking user:", error);
        }
    }, [currentUserId, fetchAllMatchInteractions]); // Depende de currentUserId y fetchAllMatchInteractions // Depende de API_BASE_URL

    // --- Handle Unmatch / Cancel Like / Ignore ---
    // Función para eliminar una interacción de match (unmatch, cancelar like, ignorar like recibido)
    const handleCancelInteraction = useCallback(async (userIdToInteractWith) => {
        if (!currentUserId) {
            alert("Debes iniciar sesión para realizar esta acción.");
            return;
        }
         if (String(currentUserId) === String(userIdToInteractWith)) {
             alert("No puedes cancelar una interacción contigo mismo.");
             return;
         }

        console.log(`handleCancelInteraction: User ${currentUserId} attempting to cancel interaction with user ${userIdToInteractWith}`);

        // Opcional: Confirmación del usuario
        if (!window.confirm(`¿Estás seguro de que quieres cancelar esta interacción con este usuario?`)) {
            return;
        }

        try {
            // Llama a la ruta DELETE /matches/<user_id>
            const res = await fetch(`${API_BASE_URL}/matches/${userIdToInteractWith}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                const result = await res.json(); // Backend might return a message
                console.log("handleCancelInteraction: Delete response:", res.status, result);

                alert(result.message || "Interacción eliminada."); // Mostrar mensaje de éxito

                // La lista se actualizará a través de los eventos WS o recarga
                fetchAllMatchInteractions();

            } else if (res.status === 404) {
                 alert("Interacción de match no encontrada para eliminar.");
            }
            else {
                 const errorData = await res.json();
                 alert(`Error al eliminar interacción: ${errorData.message || res.status}`);
                 console.error("handleCancelInteraction: API error response:", res.status, errorData);
            }
        } catch (error) {
            alert(`Error de red al eliminar interacción: ${error.message}`);
            console.error("handleCancelInteraction: Network error cancelling interaction:", error);
        }
    }, [currentUserId, fetchAllMatchInteractions]); // Depende de currentUserId y fetchAllMatchInteractions // Depende de API_BASE_URL


    // --- Determinar el tipo de interacción para cada match ---
    const getInteractionType = useCallback((match) => {
        const isSent = String(match.user_id) === String(currentUserId);
        const isReceived = String(match.matched_user_id) === String(currentUserId);

        // Para determinar si es mutuo, buscamos si existe la entrada inversa en la lista actual
        const otherUserId = isSent ? match.matched_user_id : match.user_id;
        const inverseMatchExists = allMatchInteractions.some(m =>
            String(m.user_id) === String(otherUserId) && String(m.matched_user_id) === String(currentUserId)
        );

        if (isSent && inverseMatchExists) {
            return 'mutual'; // Es un match mutuo (yo envié el like y el otro también)
        } else if (isSent && !inverseMatchExists) {
            return 'sent'; // Es un like que yo envié (pendiente)
        } else if (isReceived && !inverseMatchExists) {
            return 'received'; // Es un like que yo recibí (pendiente de mi aceptación)
        }
        // Si es isReceived y inverseMatchExists, ya está cubierto por el caso 'mutual'
        // (la entrada donde yo recibí el like también estará en la lista si es mutuo)
        // Sin embargo, para evitar procesar la misma relación dos veces (entrada A->B y B->A),
        // podríamos querer filtrar la lista inicial o ser más cuidadosos aquí.
        // Con la lógica actual, si es mutuo, la entrada donde yo envié ('sent' + inverseExists)
        // se marca como 'mutual'. La entrada donde yo recibí ('received' + inverseExists)
        // no caerá en 'received' porque inverseMatchExists es true.
        // Así que esta lógica parece correcta para categorizar cada OBJETO match de la lista.
        return 'unknown'; // En caso de que algo no cuadre
    }, [currentUserId, allMatchInteractions]); // Depende de currentUserId y la lista completa


    // --- Render UI ---
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Mis Interacciones de Match</h1>

            {isLoading && <div className="text-center text-gray-500">Cargando interacciones...</div>}
            {error && <div className="text-center text-red-500">Error al cargar interacciones: {error}</div>}
            {!isLoading && !error && allMatchInteractions.length === 0 && (
                <div className="text-center text-gray-500">No tienes interacciones de match aún.</div>
            )}

            {/* Lista Unificada de Interacciones */}
            {!isLoading && !error && allMatchInteractions.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {allMatchInteractions.map(match => {
                         // Determinar quién es el "otro" usuario en la interacción
                         const otherUser = String(match.user_id) === String(currentUserId) ? match.matched_user : match.user;

                         if (!otherUser) {
                              console.warn("MatchesPage: Interaction object missing user data:", match);
                              return null; // No renderizar si falta info del usuario
                         }

                         // Determinar el tipo de interacción
                         const interactionType = getInteractionType(match);

                         // Si la interacción es 'mutual', solo queremos mostrar una entrada por par de usuarios.
                         // Mostraremos la entrada donde el currentUserId es el user_id (la que yo inicié).
                         // Si el currentUserId es el matched_user_id en un match mutuo, la ignoramos aquí
                         // para evitar duplicados visuales del mismo match mutuo.
                         if (interactionType === 'mutual' && String(match.user_id) !== String(currentUserId)) {
                             return null; // Ignorar la entrada inversa del match mutuo
                         }


                         return (
                             <div key={match.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-4
                                 ${interactionType === 'mutual' ? 'border border-green-500' :
                                  interactionType === 'sent' ? 'border border-yellow-500' :
                                  interactionType === 'received' ? 'border border-purple-500' : ''}` // Colorear borde por tipo
                             }>
                                 {/* Foto de perfil del otro usuario */}
                                 <img
                                     src={getUserPhotoUrl(otherUser)}
                                     alt={otherUser.name || otherUser.username}
                                     className="w-12 h-12 rounded-full object-cover"
                                 />
                                 {/* Información del otro usuario y estado */}
                                 <div className="flex-grow">
                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{otherUser.name || otherUser.username || `Usuario ${otherUser.id}`}</h3>
                                     <p className="text-sm text-gray-600 dark:text-gray-400">Profesión: {otherUser.profesion || 'No especificada'}</p>
                                     {/* Mostrar estado y fecha */}
                                     {interactionType === 'mutual' && (
                                         <p className="text-xs text-green-600 font-bold">¡MATCH! desde: {new Date(match.timestamp).toLocaleDateString()}</p>
                                     )}
                                     {interactionType === 'sent' && (
                                         <p className="text-xs text-yellow-600 font-bold">Like Enviado el: {new Date(match.timestamp).toLocaleDateString()}</p>
                                     )}
                                     {interactionType === 'received' && (
                                         <p className="text-xs text-purple-600 font-bold">Like Recibido el: {new Date(match.timestamp).toLocaleDateString()}</p>
                                     )}
                                      {interactionType === 'unknown' && (
                                         <p className="text-xs text-red-600 font-bold">Estado Desconocido</p>
                                      )}
                                 </div>
                                 {/* Botones de acción */}
                                 <div className="flex flex-col space-y-2">
                                     {/* Botón Chat (solo para Mutual Matches) */}
                                     {interactionType === 'mutual' && (
                                          <button
                                              onClick={() => {
                                                   console.log(`Navigate to chat with user ID: ${otherUser.id}`);
                                                   alert("Funcionalidad de ir al chat no implementada aún."); // Placeholder
                                               }}
                                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded"
                                          >
                                              Chat
                                          </button>
                                     )}

                                     {/* Botón de Cancelación/Acción Principal */}
                                     {interactionType === 'mutual' && (
                                         <button
                                             onClick={() => handleCancelInteraction(otherUser.id)}
                                             className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded"
                                         >
                                             Unmatch
                                         </button>
                                     )}
                                      {interactionType === 'sent' && (
                                         <button
                                             onClick={() => handleCancelInteraction(otherUser.id)}
                                             className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold py-1 px-2 rounded"
                                         >
                                             Cancelar Like
                                         </button>
                                     )}
                                      {interactionType === 'received' && (
                                          <> {/* Usamos fragmento para agrupar botones */}
                                              <button
                                                  onClick={() => handleLike(otherUser.id)} // Usamos handleLike para dar like de vuelta
                                                  className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded"
                                              >
                                                  Dar Like de Vuelta
                                              </button>
                                              {/* Botón Ignorar/Eliminar para Likes Recibidos */}
                                              <button
                                                  onClick={() => handleCancelInteraction(otherUser.id)} // Usamos handleCancelInteraction para ignorar
                                                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded"
                                              >
                                                  Ignorar
                                              </button>
                                          </>
                                     )}
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             )}

            {/* Sección para encontrar y dar like a otros usuarios (Opcional) */}
            {/* Esto requeriría una lógica de búsqueda o listado de usuarios no matcheados */}
            {/* <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Encontrar Nuevos Usuarios</h2>
                {/* Implementar búsqueda de usuarios y botones de "Like" aquí }
            </div> */}

        </div>
    );
}

export default MatchesPage;

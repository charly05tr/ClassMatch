// src/components/ConversationListItem.jsx
import React from 'react';
import clsx from 'clsx'; // Para combinar clases
import '../pages/MessagePage.css'
// Asegúrate de que estas funciones auxiliares estén definidas en un lugar accesible
// Si no están en un archivo de utilidades compartidas, tendrás que pasarlas como props.
// Para este ejemplo, asumiremos que se pasan como props para mantener el componente autocontenido.

// URL de Placeholder (debe ser accesible o pasada como prop si es dinámica)
const PLACEHOLDER_PHOTO_URL = 'https://picsum.photos/200/300'; // Placeholder más grande para la lista principal

// Función para obtener la URL de la foto de un usuario (si no es global, pásala como prop)
const getUserPhotoUrl = (user) => {
    const initials = user && user.username ? user.username.charAt(0).toUpperCase() : 'U';
    return (user && user.profile_picture_url) ? user.profile_picture_url : PLACEHOLDER_PHOTO_URL;
};


// Componente para renderizar un solo elemento de la lista de conversaciones
function ConversationListItem({
    conv, // El objeto conversación completo
    currentUserId, // ID del usuario actual
    selectedConversationId, // ID de la conversación seleccionada actualmente en MessagesPage
    onSelectConversation, // Handler para seleccionar esta conversación
    onLeaveConversation, // Handler para dejar esta conversación
    // Pasar funciones auxiliares como props
    getConversationDisplayName,
    formatTime,
    // getUserPhotoUrl // Si no es global o importable, pásala también
}) {

    // Determinar si esta conversación es la seleccionada actualmente
    const isSelected = selectedConversationId === conv.id;

    // Determinar la URL de la foto para este item de lista
    // Lógica: Foto del otro participante para DM de 2, placeholder para grupo o otros casos
    const photoUrl = !conv.name && conv.participants && conv.participants.length === 2 && conv.participants.find(p => p.id !== currentUserId)
        ? getUserPhotoUrl(conv.participants.find(p => p.id !== currentUserId))
        : PLACEHOLDER_PHOTO_URL; // Usar el placeholder genérico


    // Determinar el contenido del preview del último mensaje (remitente + contenido para grupo, solo contenido para DM)
    const lastMessagePreview = conv.last_message ? (
        conv.name ? ( // Si es un Grupo
            // Mostrar nombre del remitente del último mensaje + contenido
            `${conv.last_message.sender ? conv.last_message.sender.name : `Usuario ${conv.last_message.sender_id}`}: ${conv.last_message.content}`
        ) : ( // Si es un DM
            // Mostrar solo el contenido del último mensaje
            conv.last_message.content
        )
    ) : 'Sin mensajes aún.'; // Mensaje si no hay último mensaje


    // Renderiza un elemento de lista (<li>) con el layout de la plantilla
    return (
        // Aplicar clases de la plantilla LI y tus clases de selección/cursor
        <li
            key={conv.id} // Key se usa en el map del componente padre, pero lo mantenemos aquí también si este componente se reusa en otro map
            onClick={() => onSelectConversation(conv.id)} // Llama al handler del padre
            className={clsx(
                'flex justify-between gap-x-6 py-5 px-4 cursor-pointer transition duration-200 mb-1', // Clases base de LI
                isSelected ? 'item-bg-color-selected' : 'item-bg-color' // Clases de selección/hover (ajustar bg/dark:bg)
                // Puedes añadir un borde azul si está seleccionado: isSelected && 'border-l-4 border-blue-500'
            )}
        >
            {/* --- Parte Izquierda (Foto y Texto Principal) --- */}
            <div className="flex min-w-0 gap-x-4">
                {/* Foto de Perfil */}
                <img
                    className="size-12 flex-none rounded-full bg-gray-50" // Clases de tamaño y forma
                    src={photoUrl} // Usar la URL determinada arriba
                    alt={`Foto de perfil de ${getConversationDisplayName(conv)}`}
                />
                {/* Texto Principal */}
                <div className="min-w-0 flex-auto">
                    {/* Nombre de la conversación (Grupo o Participantes DM) */}
                    <p className="font-semibold leading-6 text-gray-900 dark:text-gray-100">
                        {getConversationDisplayName(conv)} {/* Usar la función auxiliar pasada como prop */}
                    </p>
                    {/* Preview del Último Mensaje */}
                    <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400 truncate">
                        {lastMessagePreview} {/* Usar el preview determinado arriba */}
                    </p>
                </div>
            </div>

            {/* --- Parte Derecha (Timestamp y Botón Salir) --- */}
            {/* Mostrar en pantallas sm y mayores, usar flex-col para apilar */}
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                {/* Timestamp del Último Mensaje (Solo Hora y AM/PM) */}
                {conv.last_message && (
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                        {formatTime(conv.last_message.timestamp)} {/* Usar la función auxiliar pasada como prop */}
                    </p>
                )}
            </div>

        </li>
    );
}

export default ConversationListItem;
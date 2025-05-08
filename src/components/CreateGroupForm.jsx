// src/components/CreateGroupForm.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx'; // Para combinar clases
import { XMarkIcon, UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'; // Iconos
import DmSearchAndStart from './DmSearchAndStart' 
// URL de Placeholder (mantener si no tienes URLs reales en backend)
const PLACEHOLDER_PHOTO_URL = 'https://via.placeholder.com/32/cccccc/ffffff?text=';

// Función para obtener la URL de la foto de un usuario
const getUserPhotoUrl = (user) => {
    const initials = user && user.username ? user.username.charAt(0).toUpperCase() : 'U';
    return (user && user.profile_picture_url) ? user.profile_picture_url : `${PLACEHOLDER_PHOTO_URL}${initials}`;
};


function CreateGroupForm({ currentUserId, API_BASE_URL, onGroupCreated, isFormVisible, setIsFormVisible, handleDmConversationCreated, conversations }) {

    // --- Estados para la creación del grupo ---
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [createGroupError, setCreateGroupError] = useState(null);

    // --- Estados para la búsqueda de usuarios ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [searchUsersError, setSearchUsersError] = useState(null);

    // --- Estado y Ref para el Dropdown ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);


    // --- Handler para buscar usuarios ---
    const handleSearchUsers = useCallback(async (term) => {
        setSearchUsersError(null);
        if (!term.trim()) { setSearchResults([]); return; }
        setIsSearchingUsers(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/search?term=${encodeURIComponent(term)}`, { method: 'GET', credentials: 'include', });
            if (res.ok) {
                const users = await res.json();
                const filteredUsers = users.filter(user => user.id !== currentUserId && !selectedParticipants.some(p => p.id === user.id));
                setSearchResults(filteredUsers);
            } else {
                const errorData = await res.json(); setSearchUsersError(errorData.message || `Error searching users: ${res.status}`); setSearchResults([]);
            }
        } catch (error) { setSearchUsersError(`Network error searching users: ${error.message}`); setSearchResults([]); }
        finally { setIsSearchingUsers(false); }
    }, [API_BASE_URL, currentUserId, selectedParticipants]);


    // --- Debounce y useEffect para la búsqueda ---
    const searchTimerRef = useRef(null);
    const debouncedSearchUsers = useCallback((term) => {
        if (searchTimerRef.current) { clearTimeout(searchTimerRef.current); }
        searchTimerRef.current = setTimeout(() => { handleSearchUsers(term); }, 300);
    }, [handleSearchUsers]);

    useEffect(() => {
        if (currentUserId !== null) {
            if (typeof debouncedSearchUsers === 'function') {
                debouncedSearchUsers(searchTerm);
            }
        }
        return () => { if (searchTimerRef.current) { clearTimeout(searchTimerRef.current); } };
    }, [searchTerm, debouncedSearchUsers, currentUserId]);


    // --- useEffect para cerrar el dropdown al hacer clic fuera ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Asegurarse de que el clic no fue en el botón que abre/cierra el dropdown
            const button = document.getElementById('dropdownSearchButton'); // Usar el ID del botón
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && (!button || !button.contains(event.target))) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);


    // --- Handler para seleccionar/deseleccionar usuario con checkbox ---
    const handleToggleUserSelection = useCallback((user) => {
        const isSelected = selectedParticipants.some(p => p.id === user.id);
        if (isSelected) { setSelectedParticipants(prev => prev.filter(p => p.id !== user.id)); }
        else { setSelectedParticipants(prev => [...prev, user]); setCreateGroupError(null); }
    }, [selectedParticipants]);


    // --- Handler para remover participante de los chips ---
    const handleRemoveParticipant = useCallback((userIdToRemove) => {
        setSelectedParticipants(prev => prev.filter(p => p.id !== userIdToRemove));
        setCreateGroupError(null);
    }, []);


    // --- Handler para crear el Grupo ---
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const groupName = newGroupName.trim();
        const participantIds = selectedParticipants.map(p => p.id);

        if (currentUserId !== null && !participantIds.includes(currentUserId)) { participantIds.push(currentUserId); }
        else if (currentUserId === null) { setCreateGroupError("Tu ID de usuario no está disponible para crear el grupo."); return; }

        if (participantIds.length < 2) { setCreateGroupError("Un grupo debe tener al menos 2 participantes (tú y alguien más)."); return; }
        if (participantIds.length === 2) { setCreateGroupError("Para chats de 2 personas, usa la opción 'Iniciar nuevo DM'."); return; }

        setIsCreatingGroup(true); setCreateGroupError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ name: groupName || null, participant_ids: participantIds }),
            });
            if (res.ok) {
                const newConversation = await res.json();
                console.log("Group conversation created:", newConversation);
                if (onGroupCreated) { onGroupCreated(newConversation); }
                // Limpiar y ocultar formulario después de éxito
                setNewGroupName(''); setSelectedParticipants([]); setSearchTerm(''); setSearchResults([]); setCreateGroupError(null);
                setIsFormVisible(false); // Ocultar formulario
                setIsDropdownOpen(false); // Asegurar que el dropdown esté cerrado
            } else {
                const errorData = await res.json(); setCreateGroupError(errorData.message || `Error creating group: ${res.status}`); console.error("Error creating group:", res.status, errorData);
            }
        } catch (error) {
            setCreateGroupError(`Network error creating group: ${error.message}`); console.error("Network error creating group:", error);
        } finally { setIsCreatingGroup(false); }
    };

    // --- Handler para cancelar la creación del grupo ---
    const handleCancelCreateGroup = useCallback(() => {
        // Limpiar estados y ocultar formulario
        setNewGroupName('');
        setSelectedParticipants([]);
        setSearchTerm('');
        setSearchResults([]);
        setCreateGroupError(null);
        setIsCreatingGroup(false);
        setIsSearchingUsers(false);
        setSearchUsersError(null);
        setIsFormVisible(false); // Ocultar formulario
        setIsDropdownOpen(false); // Asegurar que el dropdown esté cerrado
    }, []);


    // --- Renderizado ---
    return (
        <div>
                <div>
                    {isCreatingGroup && (
                        <p className="text-purple-600 dark:text-purple-400 mb-2">Creando Grupo...</p>
                    )}
                    {createGroupError && <p className="text-red-500 text-sm mb-2">{createGroupError}</p>}

                    <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">

                        <div>
                            <input
                                type="text" id="groupName" placeholder="Nombre del Grupo"
                                value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                                disabled={isCreatingGroup}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            />
                        </div>
                    </form>
                </div>
        </div>
    );
}

export default CreateGroupForm;
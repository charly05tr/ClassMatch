import React from 'react';

function UserCard() {
    return (
        <>
            <main class="flex justify-center pt-10 px-4">
                <div class="bg-black-100 shadow-xl rounded-xl w-full max-w-md">
                    <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-28 rounded-t-xl relative">
                        <div class="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 border-4 border-white"></div>
                        </div>
                    </div>
                    <div class="pt-16 pb-6 px-6 text-center">
                        <h1 class="text-xl font-bold">Nombre de usuario</h1>
                        <p class="text-sm text-pink-600 font-medium mt-1">Rol de usuario</p>
                        <div class="mt-4 text-left">
                            <h2 class="text-sm font-semibold text-gray-700">Resumen</h2>
                            <p class="text-sm text-gray-600">Sin resumen aún.</p>
                            <p class="text-sm text-gray-400">Sin habilidades listadas.</p>
                        </div>

                        <div class="mt-6 grid grid-cols-3 gap-3 text-sm text-gray-600">
                            <div class="bg-gray-50 rounded-lg py-4 shadow">
                                <div class="text-yellow-500 mb-1">⚡</div>
                                <div class="font-bold">0</div>
                                <div>Interesados</div>
                            </div>
                            <div class="bg-gray-50 rounded-lg py-4 shadow">
                                <div class="text-green-500 mb-1">🧑‍🤝‍🧑</div>
                                <div class="font-bold">0</div>
                                <div>Conexiones</div>
                            </div>
                            <div class="bg-gray-50 rounded-lg py-4 shadow">
                                <div class="text-blue-500 mb-1">💬</div>
                                <div class="font-bold">0</div>
                                <div>Mensajes</div>
                            </div>
                        </div>

                        <div class="mt-4 flex items-center justify-center gap-2">
                            <span class="text-sm text-gray-500">🌐 Idioma:</span>
                            <select title="idioma" class="border rounded px-2 py-1 text-sm">
                                <option selected>Español</option>
                                <option>English</option>
                            </select>
                        </div>

                        <div class="mt-6 flex gap-3 justify-center">
                            <button type='button' class="bg-white border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-100">
                                ✏️ Editar Perfil
                            </button>
                            <button type='button' class="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600">
                                🔓 Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default UserCard;
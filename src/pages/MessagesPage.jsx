import React from 'react';

function MessagesPage() {
    return (
        <main className="bg-gray-50 h-screen font-sans">
            <div className="flex h-full">
                <div className="w-80 bg-white border-r flex flex-col">

                    <div className="p-4 flex items-center gap-2 border-b">
                        <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 3h14a2 2 0 012 2v2H1V5a2 2 0 012-2zm16 4v8a2 2 0 01-2 2H3a2 2 0 01-2-2V7h18zM5 9a1 1 0 100 2 1 1 0 000-2zm3 1a1 1 0 112 0 1 1 0 01-2 0zm5-1a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                        <h1 className="text-xl font-semibold">Conexiones</h1>
                    </div>

                    <div className="p-4">
                        <input type="text" placeholder="Buscar conexiones..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex-1 border-r overflow-y-auto">

                        <div className="flex items-start gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b">
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full object-cover" alt="Chloe" />
                            <div>
                                <p className="font-semibold text-sm">Chloe</p>
                                <p className="text-xs text-gray-500">UI/UX Designer</p>
                                <p className="text-sm text-gray-700 mt-1">Love your project idea! Let's chat.</p>
                            </div>
                            <span className="w-3 h-3 bg-green-500 rounded-full mt-1 ml-auto"></span>
                        </div>

                        <div className="flex items-start gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full object-cover" alt="Ben" />
                            <div>
                                <p className="font-semibold text-sm">Ben</p>
                                <p className="text-xs text-gray-500">DevOps Engineer</p>
                                <p className="text-sm text-gray-700 mt-1">Sure, I can help with the deployment pipeline.</p>
                            </div>
                        </div>

                    </div>
                </div>

               
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-14 h-14 text-gray-400">
                        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                            <path d="M20 2H4C2.9 2 2 2.9 2 4v16l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-medium text-gray-700 mt-4">Conexiones</h2>
                    <p className="text-gray-500">Buscar conexiones...</p>
                </div>
            </div>
        </main>
    )
}

export default MessagesPage;
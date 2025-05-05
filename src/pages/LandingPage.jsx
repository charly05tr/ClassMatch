import {React} from 'react';
// Importa iconos de Heroicons (ajusta la ruta si es necesario)
// Usamos la variante 'outline' para un look más limpio en la landing
import { UsersIcon, CodeBracketIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom'
function LandingPage() {
    const navigate = useNavigate()

    const goToRegister = () => {
        navigate('/register')
    }
    const goToLogIn = () => {
        navigate('/login')
    }
    
    
    return (
        // Contenedor principal que ocupa al menos toda la altura de la pantalla
        // Usa un fondo oscuro y texto blanco por defecto
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">

            {/* Encabezado/Barra de Navegación (Placeholder simple) */}
            {/* En una aplicación real, esto sería un componente Navbar separado y más completo */}
            <header className="w-full p-6 flex justify-between items-center bg-gray-800">
                {/* Logo o Nombre de la Aplicación */}
                <div className="text-2xl font-bold text-purple-400">DevConnect</div>
                {/* Enlaces de Navegación (Placeholder) */}
                <nav>
                    {/* Estos serían enlaces reales de tu router (ej. React Router Link) */}
                    <button type="button" onClick={() => goToLogIn()} className="text-gray-300 hover:text-white mr-4">Login</button>
                    <button type='button'onClick={() => goToRegister()} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Regístrate</button>
                </nav>
            </header>

            {/* Sección Hero - La primera sección que ve el usuario */}
            {/* Ocupa el espacio restante, centrado, con padding generoso y un gradiente de fondo llamativo */}
            <section className="relative w-full flex-grow flex items-center justify-center text-center p-8 md:p-12 bg-gradient-to-br from-purple-600 to-blue-500">
                {/* Contenido principal de la sección Hero */}
                {/* Z-index para asegurar que esté por encima de posibles fondos o overlays */}
                <div className="relative z-10 max-w-3xl mx-auto">
                    {/* Titular principal - Mensaje claro y conciso */}
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
                        Conecta, Colabora, Codifica. <br /> La Red Exclusiva para Programadores.
                    </h1>
                    {/* Subtítulo - Complementa el titular y da más detalles */}
                    <p className="text-lg md:text-xl text-purple-100 mb-8">
                        Comparte tu portfolio, encuentra desarrolladores para tus proyectos y construye tu futuro tecnológico.
                    </p>
                    {/* Botón de Llamada a la Acción (CTA) principal */}
                    {/* Lleva al usuario a la página de registro */}
                    <a href="/register" className="text-gray-900 font-bold text-lg py-3 px-8 rounded-full shadow-lg transition duration-300 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-500 shadow-lg shadow-yellow-500/50 dark:shadow-lg dark:shadow-yellow-800/80">
                        Únete a DevConnect Hoy
                    </a>
                </div>
            </section>

            {/* Sección de Características - Explica los beneficios clave */}
            {/* Fondo oscuro, padding vertical, contenido centrado y con ancho limitado */}
            <section className="w-full py-16 px-8 bg-gray-900 text-gray-200">
                <div className="max-w-6xl mx-auto text-center">
                    {/* Título de la sección */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">¿Por qué DevConnect?</h2>

                    {/* Grid para mostrar las características en columnas (1 en móvil, 3 en escritorio) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                        {/* Característica 1: Comunidad Exclusiva */}
                        {/* Añadimos 'group' para poder aplicar estilos a los hijos en el estado hover del padre */}
                        {/* Añadimos transición para suavizar los cambios */}
                        {/* Añadimos clases hover para cambiar fondo, sombra y mover ligeramente hacia arriba */}
                        <div className="group flex flex-col items-center p-6 rounded-lg bg-gray-800 shadow-xl transition duration-300 ease-in-out hover:translate-y-[-4px] hover:bg-gray-700 hover:shadow-2xl">
                            {/* Ícono para la característica */}
                            {/* Añadimos transición y la clase group-hover para cambiar el color del ícono al pasar el cursor sobre el div padre */}
                            <UsersIcon className="h-12 w-12 text-purple-400 mb-4 transition duration-300 ease-in-out group-hover:text-purple-300" />
                            {/* Título de la característica */}
                            {/* Añadimos transición y la clase group-hover para cambiar ligeramente el color del título */}
                            <h3 className="text-xl font-bold mb-3 text-white transition duration-300 ease-in-out group-hover:text-white">Comunidad Exclusiva</h3>
                            {/* Descripción de la característica */}
                            {/* Añadimos transición y la clase group-hover para cambiar el color de la descripción */}
                            <p className="text-gray-400 transition duration-300 ease-in-out group-hover:text-gray-300">
                                Conecta solo con otros programadores. Amplía tu red profesional y encuentra colegas apasionados.
                            </p>
                        </div>

                        {/* Característica 2: Muestra tu Portfolio */}
                        {/* Aplicamos las mismas clases que a la primera característica */}
                        <div className="group flex flex-col items-center p-6 rounded-lg bg-gray-800 shadow-xl transition duration-300 ease-in-out hover:translate-y-[-4px] hover:bg-gray-700 hover:shadow-2xl">
                            {/* Ícono para la característica (cambiamos el color hover según el color base del ícono) */}
                            <CodeBracketIcon className="h-12 w-12 text-blue-400 mb-4 transition duration-300 ease-in-out group-hover:text-blue-300" />
                            {/* Título de la característica */}
                            <h3 className="text-xl font-bold mb-3 text-white transition duration-300 ease-in-out group-hover:text-white">Muestra tu Trabajo</h3>
                            {/* Descripción de la característica */}
                            <p className="text-gray-400 transition duration-300 ease-in-out group-hover:text-gray-300">
                                Crea un portfolio atractivo para destacar tus proyectos, habilidades y experiencia. Tu código habla por ti.
                            </p>
                        </div>

                        {/* Característica 3: Colaboración en Proyectos */}
                        {/* Aplicamos las mismas clases que a la primera característica */}
                        <div className="group flex flex-col items-center p-6 rounded-lg bg-gray-800 shadow-xl transition duration-300 ease-in-out hover:translate-y-[-4px] hover:bg-gray-700 hover:shadow-2xl">
                            {/* Ícono para la característica (cambiamos el color hover según el color base del ícono) */}
                            <HandRaisedIcon className="h-12 w-12 text-pink-400 mb-4 transition duration-300 ease-in-out group-hover:text-pink-300" />
                            {/* Título de la característica */}
                            <h3 className="text-xl font-bold mb-3 text-white transition duration-300 ease-in-out group-hover:text-white">Encuentra Colaboradores</h3>
                            {/* Descripción de la característica */}
                            <p className="text-gray-400 transition duration-300 ease-in-out group-hover:text-gray-300">
                                Publica tus ideas o busca proyectos interesantes. Forma equipos con desarrolladores que complementen tus habilidades.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Sección Secundaria de Llamada a la Acción (CTA) - Refuerza el mensaje */}
            {/* Fondo intermedio oscuro, padding vertical, texto centrado */}
            <section className="w-full py-16 px-8 bg-gray-800 text-center">
                <div className="max-w-3xl mx-auto">
                    {/* Título de la sección */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                        ¿Listo para impulsar tu carrera y proyectos?
                    </h2>
                    {/* Descripción */}
                    <p className="text-lg md:text-xl text-gray-300 mb-8">
                        Únete a los programadores que ya están conectando y creando en DevConnect.
                    </p>
                    {/* Botón de Llamada a la Acción (CTA) secundario */}
                    {/* Lleva al usuario a la página de registro */}
                    <a href="/register" className="text-gray-900 font-bold text-lg py-3 px-8 rounded-full shadow-lg transition duration-300 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-500 shadow-lg shadow-yellow-500/50 dark:shadow-lg dark:shadow-yellow-800/80">
                        ¡Regístrate Gratis!
                    </a>
                </div>
            </section>


            {/* Pie de Página (Placeholder simple) */}
            {/* Fondo oscuro, padding, texto centrado y más pequeño */}
            <footer className="w-full p-6 text-center text-gray-400 bg-gray-900">
                <p>&copy; 2025 DevConnect. Todos los derechos reservados.</p>
                {/* Enlaces placeholder en el pie de página */}
                <div className="mt-2 text-sm">
                    {/* Estos serían enlaces reales si tienes esas páginas */}
                    <a href="#" className="hover:text-white mr-4">Sobre Nosotros</a>
                    <a href="#" className="hover:text-white mr-4">Contacto</a>
                    <a href="#" className="hover:text-white">Política de Privacidad</a>
                </div>
            </footer>

        </div>
    );
}

// Exporta el componente para poder usarlo en tu aplicación principal
export default LandingPage;
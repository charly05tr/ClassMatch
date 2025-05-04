import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'; // Asumiendo que ya tienes heroicons instaladas
import clsx from 'clsx';
import { useState, useEffect } from 'react'; // Necesitamos useEffect para sincronizar con el prop del padre

// Este componente reemplazará a tu <select> nativo
// Recibirá el array de opciones, el valor string seleccionado actualmente,
// y una función para llamar cuando la selección cambie (recibirá el valor string).
const SocialLinkTypeCombobox = ({ socialOptions, selectedValue, onValueChange, className }) => {
  // Estado interno para el texto que el usuario escribe en el input del combobox (para filtrar)
  const [query, setQuery] = useState('');
  // Estado interno para el *objeto* de la opción seleccionada (el combobox de headlessui trabaja con objetos)
  // Inicializamos buscando el objeto que coincide con el selectedValue string que viene del padre
  const [selectedOption, setSelectedOption] = useState(
    socialOptions.find(option => option.value === selectedValue) || // Busca el objeto que coincide con el valor
    socialOptions.find(option => option.value === '') || // O busca la opción vacía por defecto
    socialOptions[0] || // O toma la primera opción si no hay valor ni opción vacía
    { value: '', label: '-- Select Type --' } // O un fallback si socialOptions está vacío
  );

  // Usamos useEffect para actualizar el estado interno 'selectedOption'
  // si el 'selectedValue' que viene del padre cambia externamente.
  // Esto es necesario si el padre actualiza 'link.type' sin que la selección ocurra directamente en el combobox.
  useEffect(() => {
    const matchingOption = socialOptions.find(option => option.value === selectedValue);
    if (matchingOption) {
      setSelectedOption(matchingOption);
    } else {
      // Si el selectedValue del padre no coincide con ninguna opción (ej. string vacío inicial)
      // busca la opción vacía por defecto o usa un fallback
      setSelectedOption(socialOptions.find(option => option.value === '') || socialOptions[0] || { value: '', label: '-- Select Type --' });
    }
  }, [selectedValue, socialOptions]); // Dependencias: se re-ejecuta si el valor seleccionado o las opciones cambian

  // Filtra las opciones basándose en el texto de búsqueda (query)
  // No filtramos si el query está vacío
  const filteredOptions =
    query === ''
      ? socialOptions
      : socialOptions.filter((option) => {
          // Filtra por la etiqueta (label) de la opción, ignorando mayúsculas/minúsculas
          return option.label.toLowerCase().includes(query.toLowerCase());
        });

  // Handler que se llama cuando el usuario selecciona una opción de la lista
  const handleComboboxChange = (option) => {
    setSelectedOption(option); // Actualiza el estado interno con el OBJETO seleccionado
    onValueChange(option.value); // Llama a la función del padre pasando el VALOR STRING de la opción
    setQuery(''); // Limpia el texto de búsqueda después de seleccionar
    // Opcional: Puedes llamar a onClose aquí también, aunque el combobox a menudo lo hace automáticamente
  };

  // Handler para cuando el usuario escribe en el input del combobox
  const handleInputChange = (event) => {
      setQuery(event.target.value); // Actualiza el estado interno del query
      // Nota: El padre SOLO se actualizará cuando se seleccione una opción de la lista, no al escribir
  };

  // Función que determina qué texto se muestra en el input del combobox
  // Recibe el objeto de la opción seleccionada internamente por headlessui
  const displayValue = (option) => {
    return option?.label || '-- Select Type --'; // Muestra la etiqueta, o el texto por defecto si no hay opción seleccionada o el objeto es null/undefined
  };

  // --- Estilos Tailwind (ajusta según tu tema y el estilo de tu select nativo) ---
  // Combinamos las clases que vienen por prop con las clases base del componente
  const comboboxInputClassName = clsx(
    'w-10 rounded-lg shadow py-2 px-3 text-sm leading-tight', // Estilos base (copiados de tu select nativo)
    'focus:outline-none focus:ring-2 focus:ring-offset-2', // Estilos de foco mejorados
    'bg-transparent text-gray-700 border-gray-300 focus:ring-blue-500 focus:border-blue-500', // Estilos modo claro (ajusta colores si es necesario)
    'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:ring-offset-gray-900 dark:focus:ring-blue-600 dark:focus:border-blue-600', // Estilos modo oscuro (ajusta colores)
    className // Clases pasadas desde el padre (como w-1/3)
  );

  const optionsContainerClassName = clsx(
      'absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md shadow-lg', // Posicionamiento, tamaño máximo y scroll
      'bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-600bg-gradient-to-r from-blue-800 via-blue-900 to-blue-900 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500', // Fondo y borde en modo claro
      'dark:bg-gray-800 dark:border-gray-700 opacity-95', // Fondo y borde en modo oscuro
      'py-1 text-base focus:outline-none sm:text-sm options' // Padding y tamaño de fuente
  );

  // Clases para cada opción individual en la lista desplegable
  // Headless UI pasa un objeto { active, selected } para aplicar estilos condicionales
  const optionItemClassName = ({ active, selected }) => clsx(
      'relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 dark:text-gray-200', // Estilos base del item
      active && 'bg-blue-600 text-white', // Estilo cuando el item está activo (hover o teclado)
      selected && 'font-medium bg-blue-100 text-blue-900 dark:bg-blue-700 dark:text-white' // Estilo cuando el item está seleccionado
  );


  return (
    // El div contenedor toma la clase de ancho del padre (ej. w-1/3)
    <div className={clsx('relative', className)}> {/* Necesita 'relative' para que las opciones 'absolute' se posicionen correctamente */}
      <Combobox value={selectedOption} onChange={handleComboboxChange}> {/* Usa el estado interno selectedOption */}
        <div className="relative"> {/* Este div también necesita 'relative' si ComboboxOptions no usa anchor */}
          <ComboboxInput
            className={comboboxInputClassName} // Aplica los estilos definidos arriba
            displayValue={displayValue} // Usa la función displayValue para mostrar el texto seleccionado
            onChange={handleInputChange} // Conecta el input al handler del query
            // No necesitas la prop 'value' aquí, displayValue se encarga de mostrar el seleccionado
          />
          {/* Botón con la flecha para abrir/cerrar */}
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-600">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400 dark:text-gray-300" // Color de la flecha
              aria-hidden="true"
            />
          </ComboboxButton>
        </div>

        {/* Contenedor de la lista de opciones */}
        {/* Por defecto es absolute, se posicionará respecto al padre 'relative' */}
        <ComboboxOptions
           className={optionsContainerClassName} // Aplica los estilos al contenedor de opciones
           // Puedes añadir 'transition' y related classes si quieres animaciones (requiere @headlessui/react/transition)
           // transition
           // className={clsx(optionsContainerClassName, 'transition ease-in duration-100 data-leave:opacity-0')}
           >

          {/* Manejar el caso sin resultados de búsqueda */}
          {filteredOptions.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300 text-sm">
              Nada encontrado.
            </div>
          ) : (
            // Mapea sobre las opciones filtradas para renderizar cada ComboboxOption
            filteredOptions.map((option) => (
              <ComboboxOption
                key={option.value} // Usa el valor como key (asumiendo que es único)
                value={option}    // El valor de la opción en Combobox es el objeto completo
                // Pasa la función que devuelve las clases condicionales (activo/seleccionado)
                className={optionItemClassName}
              >
                {({ active, selected }) => ( // Render prop para acceder al estado de la opción
                  <>
                    {/* El texto visible de la opción */}
                    <span className={clsx('block truncate', selected && 'font-medium')}>
                      {option.label}
                    </span>

                    {/* El icono de checkmark si la opción está seleccionada */}
                    {selected ? (
                      // Posiciona el checkmark a la izquierda
                      <span className={clsx('absolute inset-y-0 left-0 flex items-center pl-3', active ? 'text-white' : 'text-blue-600 dark:text-blue-300')}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
};

export default SocialLinkTypeCombobox; // Exporta el nuevo componente
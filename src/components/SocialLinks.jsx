import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram,faTwitter, faLinkedin, faGithub, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faLink, faGlobe, faTimes,faEnvelope, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import  SocialLinkTypeCombobox from '/src/components/select'
import '/src/pages/ProfilePage.css' 

const SocialLinksEditor = ({ socialLinks, onChange, isEditing }) => {
    const socialOptions = [
        { value: '', label: '-- Select Type --', icon: ''},
        { value: 'email', label: 'Email', icon: faEnvelope },
        { value: 'twitter', label: 'Twitter', icon: faTwitter },
        { value: 'instagram', label: 'Instagram', icon: faInstagram },
        { value: 'linkedin', label: 'LinkedIn', icon: faLinkedin },
        { value: 'github', label: 'GitHub', icon: faGithub },
        { value: 'youtube', label: 'YouTube', icon: faYoutube },
        { value: 'website', label: 'Website', icon: faGlobe },
    ]

    const handleLinkTypeChange = (index, type) => {
        const newLinks = [...socialLinks]
        newLinks[index].type = type
        onChange(newLinks)
    }

    const handleLinkUrlChange = (index, url) => {
        const newLinks = [...socialLinks]
        newLinks[index].url = url
        onChange(newLinks)
    }

    const handleAddLink = () => {
        onChange([...socialLinks, { type: '', url: '' }])
    }

    const handleRemoveLink = (indexToRemove) => {
        onChange(socialLinks.filter((_, index) => index !== indexToRemove))
    }

    const getSocialIcon = (type) => {
        const option = socialOptions.find(opt => opt.value === type)
        return option ? option.icon : faLink
    }

    return (
        <div className="mb-20">
            {isEditing ? (
                <div className="shadow rounded project-content">
                    <label className="block text-white-700 text-sm font-bold mb-2">{isEditing ? ('Social links') : ('')}</label>
                    {socialLinks.map((link, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                             <SocialLinkTypeCombobox
                                socialOptions={socialOptions} // Pasa el array de opciones
                                selectedValue={link.type} // Pasa el valor string seleccionado actualmente (link.type)
                                // Pasa la función handler que actualizará el estado del padre
                                onValueChange={(newValueString) => handleLinkTypeChange(index, newValueString)}
                                className="social-link-select" // Pasa la clase de ancho al componente
                            />
                            <div className='flex justify-between'>
                            <input
                                type="text"
                                value={link.url}
                                onChange={(e) => handleLinkUrlChange(index, e.target.value)}
                                placeholder="URL or Username"
                                className="appearance-none rounded w-2/3 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline text-sm" // Ajustar ancho
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveLink(index)}
                                className="text-red-600 hover:text-red-800 text-lg "
                                title="Remove Link"
                            >
                                 <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddLink}
                        className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add Link
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 ml-4">
                    {socialLinks.length === 0 ? (
                        <p className="text-gray-600 text-sm"></p>
                    ) : (
                        socialLinks.map((link, index) => link.type && link.url && (
                            <a
                                key={index}
                                href={(socialOptions.find(opt => opt.value === link.type)?.label == 'Email')?('mailto:'+link.url):(link.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                text-white-600 
                                flex items-center gap-1 text-sm 
                                bg-gray-100 text-white-100 text-normal me-2 px-3 py-1.5 
                                dark:bg-gray-700 hover:text-gray-900 
                                border border-gray-500 rounded-2xl
                                hover:bg-white"
                                title={socialOptions.find(opt => opt.value === link.type)?.label || link.type}
                            >
                                <FontAwesomeIcon icon={getSocialIcon(link.type)} />
                                    {socialOptions.find(opt => opt.value === link.type)?.label || link.type}
                            </a>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default SocialLinksEditor

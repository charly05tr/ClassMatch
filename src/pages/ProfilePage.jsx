import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin, faGithub, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faLink, faGlobe, faTimes, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const EditableField = ({ label, value, onChange, type = 'text', isTextArea = false, stateKey, isEditing }) => {
   
    const readOnlyInputStyle = "border-none outline-none bg-transparent cursor-pointer text-gray-800 py-2 px-3";
   
    const editableInputStyle = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-text";
    
    const cursorOnlyStyle = "border-none outline-none bg-transparent focus:ring-0 focus:outline-none";

    const fieldContainerStyle = "mb-4";
   
    const textViewHoverStyle = "hover:bg-black-100 rounded";

    return (
        <div className={`${fieldContainerStyle} ${!isEditing ? textViewHoverStyle : ''}`}>
            <label className="block text-white-700 text-sm font-bold mb-2" htmlFor={stateKey}>{label}</label>
            {isTextArea ? (
                <textarea
                    value={value}
                    onChange={isEditing ? onChange : undefined}
                    readOnly={!isEditing} 
                    className={`w-full  ${!isEditing ? readOnlyInputStyle : editableInputStyle + ' ' + cursorOnlyStyle}`} 
                    rows="4"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    id={stateKey}
                    style={{ color: 'white', border:'none',minHeight: '1.5em', resize: isEditing ? 'vertical' : 'none', overflow: 'hidden' }}
                ></textarea>
            ) : (
                <input
                    value={value}
                    onChange={isEditing ? onChange : undefined} 
                    readOnly={!isEditing} 
                    className={`w-full ${!isEditing ? readOnlyInputStyle : editableInputStyle + ' ' + cursorOnlyStyle}`} 
                    placeholder={`Enter ${label.toLowerCase()}`}
                    id={stateKey}
                    style={{ minHeight: '1.5em', color:'white'}}
                />
            )}
        </div>
    );
};

const SocialLinksEditor = ({ socialLinks, onChange, isEditing }) => {
    const socialOptions = [
        { value: 'instagram', label: 'Instagram', icon: faInstagram },
        { value: 'linkedin', label: 'LinkedIn', icon: faLinkedin },
        { value: 'github', label: 'GitHub', icon: faGithub },
        { value: 'youtube', label: 'YouTube', icon: faYoutube },
        { value: 'website', label: 'Website', icon: faGlobe }, 
    ];

    const handleLinkTypeChange = (index, type) => {
        const newLinks = [...socialLinks];
        newLinks[index].type = type;
        onChange(newLinks);
    };

    const handleLinkUrlChange = (index, url) => {
        const newLinks = [...socialLinks];
        newLinks[index].url = url;
        onChange(newLinks);
    };

    const handleAddLink = () => {
        onChange([...socialLinks, { type: '', url: '' }]);
    };

    const handleRemoveLink = (indexToRemove) => {
        onChange(socialLinks.filter((_, index) => index !== indexToRemove));
    };

    const getSocialIcon = (type) => {
        const option = socialOptions.find(opt => opt.value === type);
        return option ? option.icon : faLink; // Icono genérico si no se encuentra
    };

    return (
        <div className="mb-6">
            <label className="block text-white-700 text-sm font-bold mb-2">{isEditing ? ('Social links'):('')}</label>
            {isEditing ? (
                <div className="border rounded p-3">
                    {socialLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-2 mb-3 last:mb-0">
                            {/* Selector de Tipo */}
                            <select
                                value={link.type}
                                onChange={(e) => handleLinkTypeChange(index, e.target.value)}
                                className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm w-1/3" // Ajustar ancho
                            >
                                <option value="">-- Select Type --</option>
                                {socialOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            {/* Input de URL */}
                            <input
                                type="text"
                                value={link.url}
                                onChange={(e) => handleLinkUrlChange(index, e.target.value)}
                                placeholder="URL or Username"
                                className="shadow appearance-none border rounded w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm" // Ajustar ancho
                            />
                            {/* Botón de Eliminar */}
                            <button
                                type="button"
                                onClick={() => handleRemoveLink(index)}
                                className="text-red-600 hover:text-red-800 text-lg p-1"
                                title="Remove Link"
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </div>
                    ))}
                    {/* Botón Agregar Más */}
                    <button
                        type="button"
                        onClick={handleAddLink}
                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center gap-2"
                    >
                         <FontAwesomeIcon icon={faPlus} /> Add Link
                    </button>
                </div>
            ) : (
                // Modo Visualización
                <div className="flex flex-wrap gap-4">
                    {socialLinks.length === 0 ? (
                        <p className="text-gray-600 text-sm">No social links added.</p>
                    ) : (
                        socialLinks.map((link, index) => link.type && link.url && ( // Solo mostrar si tiene tipo y URL
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white-600 hover:underline flex items-center gap-1 text-sm"
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
    );
};


function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 

    const [userId, setUserId] = useState(null); 
    const [name, setName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [profileDescription, setProfileDescription] = useState("");
    const [aboutMe, setAboutMe] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [experience, setExperience] = useState("");
    const [profesion, setprofesion] = useState("");
    const [socialLinks, setSocialLinks] = useState("[]");

    
    const [projects, setProjects] = useState([]);

    const [originalProfileData, setOriginalProfileData] = useState(null);
    const [originalProjects, setOriginalProjects] = useState(null); 
    const firstInputRef = useRef(null);


    // Efecto 1: Cargar datos del perfil al montar
    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true); // Inicia carga
            try {
                const res = await fetch("http://localhost:5000/profile", {
                    method: "GET",
                    credentials: "include"
                });

                if (res.ok) {
                    const data = await res.json();
                    const loadedData = {
                        userId: data.id || null, 
                        name: data.name || "",
                        firstName: data.first_name || "",
                        profileDescription: data.profile_description || "",
                        aboutMe: data.about_me || "",
                        profilePicture: data.profile_picture || "",
                        experience: data.experience || "",
                        profesion: data.profesion || "",
                        socialLinks: data.social_links || "[]",
                    };
                    setUserId(loadedData.userId);
                    setName(loadedData.name);
                    setFirstName(loadedData.firstName);
                    setProfileDescription(loadedData.profileDescription);
                    setAboutMe(loadedData.aboutMe);
                    setProfilePicture(loadedData.profilePicture);
                    setExperience(loadedData.experience);
                    setprofesion(loadedData.profesion);
                    setSocialLinks(loadedData.socialLinks);
                    setOriginalProfileData(loadedData);
                } else {
                    console.error("Error fetching profile data or profile not found", res.status);
                    
                    const emptyData = { userId: null, name: "", firstName: "", profileDescription: "", aboutMe: "", profilePicture: "", experience: "", profesion: "", socialLinks: "" };
                    setUserId(emptyData.userId);
                    setName(emptyData.name);
                    setFirstName(emptyData.firstName);
                    setProfileDescription(emptyData.profileDescription);
                    setAboutMe(emptyData.aboutMe);
                    setProfilePicture(emptyData.profilePicture);
                    setExperience(emptyData.experience);
                    setprofesion(emptyData.profesion);
                    setSocialLinks(emptyData.socialLinks);
                    setOriginalProfileData(emptyData);
                }
            } catch (err) {
                console.error("Network error fetching profile", err);

                const emptyData = { userId: null, name: "", firstName: "", profileDescription: "", aboutMe: "", profilePicture: "", experience: "", profesion: "", socialLinks: "" };
                 setUserId(emptyData.userId);
                 setName(emptyData.name);
                 setFirstName(emptyData.firstName);
                 setProfileDescription(emptyData.profileDescription);
                 setAboutMe(emptyData.aboutMe);
                 setProfilePicture(emptyData.profilePicture);
                 setExperience(emptyData.experience);
                 setprofesion(emptyData.profesion);
                 setSocialLinks(emptyData.socialLinks);
                setOriginalProfileData(emptyData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []); 


    // Efecto 2: Cargar datos de proyectos cuando userId esté disponible o cambie
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('http://localhost:5000/projects', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (res.ok) {
                    const data = await res.json();  
                    console.log(Array.isArray(data));
                    setProjects(data || []); 
                    setOriginalProjects(data || []); 
                } else {
                    console.error("Error fetching projects data or projects not found", res.status);
                    setProjects([]);
                    setOriginalProjects([]);
                }
            } catch (e) {
                console.error("Network error fetching projects", e);
                setProjects([]);
                setOriginalProjects([]);
            } 
            finally {
                setIsLoading(false); 
            }
        };
        fetchProjects(); 
    }, []); 

    const handleProjectChange = (index, field, value) => {
        const newProjects = [...projects]; 
        if (newProjects[index]) {
             newProjects[index][field] = value; 
             setProjects(newProjects); 
        }
    };

    // Manejar la adición de un nuevo proyecto
    const handleAddProject = () => {
        const newProject = {
            tempId: Date.now(),
            name: "",
            description: "",
            image: "",
            url_code: "",
            url_preview: "",
            tecnologies: "",
        };
        setProjects([...projects, newProject]); 
    };

    // Manejar la eliminación de un proyecto por índice
    const handleRemoveProject = (indexToRemove) => {
        const projectsAfterRemoval = projects.filter((_, index) => index !== indexToRemove);
        setProjects(projectsAfterRemoval);
    };


    // Manejador para guardar TODOS los cambios (perfil y proyectos)
    const handleSaveChanges = async () => {
        const isUpdatingProfile = originalProfileData && originalProfileData.userId !== null;
        const profileMethod = isUpdatingProfile ? "PUT" : "POST";

        try {
             const profileRes = await fetch('http://localhost:5000/profile', {
                 method: profileMethod,
                 headers: { "Content-Type": "application/json" },
                 credentials: "include",
                 body: JSON.stringify({
                     'name': name,
                     'first_name': firstName,
                     'profile_description': profileDescription,
                     'about_me': aboutMe,
                     'profile_picture': profilePicture,
                     'experience': experience,
                     'profesion': profesion,
                     'social_links': socialLinks,
                 })
             });

             if (!profileRes.ok) {
                 const errorData = await profileRes.json();
                 console.error("Error saving profile:", errorData.error || "Unknown error");
                 alert("Error saving profile: " + (errorData.error || "Unknown error")); 
                
                 return; 
             }
             const profileSavedData = await profileRes.json();
             console.log("Profile saved successfully", profileSavedData);
            
             setOriginalProfileData({...originalProfileData, ...profileSavedData}); 


             // Guardar Proyectos (enviando el array completo)
             const projectsRes = await fetch('http://localhost:5000/projects', {
                 method: 'PUT', 
                 headers: { "Content-Type": "application/json" },
                 credentials: "include",
                 body: JSON.stringify({ userId: userId, projects: projects })
             });

             if(!projectsRes.ok) {
                 const errorData = await projectsRes.json();
                 console.error("Error saving projects:", errorData.error || "Unknown error");
                 console.log("Error saving projects: " + (errorData.error || "Unknown error")); 
                 
                 return; 
             }
             const projectsSavedData = await projectsRes.json();
             console.log("Projects saved successfully", projectsSavedData);
             let updatedProjectList = []; 

             
             if (projectsSavedData && typeof projectsSavedData === 'object') {
                 const owned = Array.isArray(projectsSavedData.owned_projects) ? projectsSavedData.owned_projects : [];
                 const collaborated = Array.isArray(projectsSavedData.collaborated_projects) ? projectsSavedData.collaborated_projects : [];
                 updatedProjectList = owned.concat(collaborated);   
             } else if (Array.isArray(projectsSavedData)) {
                 updatedProjectList = projectsSavedData;
                 console.warn("Backend /projects PUT returned an array directly, expected user object.");

             } else {
                 
                 console.error("Backend /projects PUT returned unexpected data type:", projectsSavedData);
                 
                 updatedProjectList = projects; 
                 console.log("Projects saved, but received unexpected data format from server.");
             }
             const processedUpdatedProjects = updatedProjectList.map(project => ({
                ...project, 
            }));

             setProjects(processedUpdatedProjects); 
             setOriginalProjects(processedUpdatedProjects); 

           
            setIsEditing(false); 
            console.log("Profile and projects saved successfully!"); 
        } catch(err) {
            console.error("Network error during save:", err);
        }
    };


    // Manejador para cancelar la edición
    const handleCancelEdit = () => {
        if (originalProfileData) {
            setName(originalProfileData.name);
            setFirstName(originalProfileData.firstName);
            setProfileDescription(originalProfileData.profileDescription);
            setAboutMe(originalProfileData.aboutMe);
            setProfilePicture(originalProfileData.profilePicture);
            setExperience(originalProfileData.experience);
            setprofesion(originalProfileData.profesion);
            setSocialLinks(originalProfileData.socialLinks);
        } else {
             
             setName(""); setFirstName(""); setProfileDescription(""); setAboutMe("");
             setProfilePicture(""); setExperience(""); setprofesion(""); setSocialLinks("");
        }

        
        if (originalProjects) {
            setProjects(originalProjects);   
        } else {
            setProjects([]); 
        }

        setIsEditing(false); 
    };

    useEffect(() => {
        if (isEditing && firstInputRef.current) {
             setTimeout(() => {
                firstInputRef.current.focus();
                if (firstInputRef.current.value.length) {
                     firstInputRef.current.setSelectionRange(firstInputRef.current.value.length, firstInputRef.current.value.length);
                 }
             }, 0);
        }
    }, [isEditing]);

     if (originalProfileData === null || originalProjects === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                 <div className="text-center text-gray-600">Loading profile data...</div>
            </div>
        );
    }
    console.log("Profile data loaded:", originalProfileData);
    console.log("Projects data loaded:", originalProjects);

    return (
        <main className="profile-container">
            <div>

                <div className="header">
                    <h2 className="text-2xl font-bold">Profile</h2>
                   
                    {!isEditing ? ( 
                         <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    ) : ( 
                         <div className="flex items-center gap-4">
                             <button
                                 type="button"
                                 className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                 onClick={handleCancelEdit}
                             >
                                 Cancel
                             </button>
                              <button
                                 type="button"
                                 className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                 onClick={handleSaveChanges}
                             >
                                 Save Changes
                             </button>
                         </div>
                    )}
                </div>
                {(isEditing) ? 
                  (<EditableField
                     label="Profile Picture URL"
                     value={profilePicture}
                     onChange={(e) => setProfilePicture(e.target.value)}   
                     isEditing={isEditing}
                     stateKey="profilePicture"
                 />)
                 :(<div>
                        {
                            (profilePicture === "") ?
                            <img src="https://via.placeholder.com/150" alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4" />
                            :<img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4" />
                        }
                 </div>)}
                 <h1>{name} {firstName}</h1>
                 {(isEditing) ?
                 (<EditableField
                     label="Description"
                     value={profileDescription}
                     onChange={(e) => setProfileDescription(e.target.value)}
                     isTextArea={true}
                     isEditing={isEditing}
                     stateKey="profileDescription"
                 />):(<div className="text-white-500">{profileDescription}</div>)}

                    <SocialLinksEditor
                     socialLinks={socialLinks}
                     onChange={setSocialLinks} 
                     isEditing={isEditing}
                  />
                    {(isEditing) ?(<EditableField
                     label="Occupation"
                     value={profesion}
                     onChange={(e) => setprofesion(e.target.value)}
                     isEditing={isEditing}
                     stateKey="profesion"
                 />):''}
                   
                  <EditableField
                     label="Work experience"
                     value={experience}
                     onChange={(e) => setExperience(e.target.value)}
                     isTextArea={true}
                     isEditing={isEditing}
                     stateKey="experience"
                 />
                 <EditableField
                     label="About Me"
                     value={aboutMe}
                     onChange={(e) => setAboutMe(e.target.value)}
                     isTextArea={true}
                     isEditing={isEditing}
                     stateKey="aboutMe"
                 />


                <h3 className="text-xl font-semibold mt-6 mb-4">Projects</h3>

                {isEditing ? (

                    <div className=" p-4"> 
                        {projects.map((project, index) => (
                            <div key={project.id || project.tempId} className=""> 
                                <div className="flex justify-between items-center mb-2">
                                     <h4 className="text-lg font-medium">{`Project ${index + 1}`}</h4>
                                     <button
                                        type="button"
                                        className="text-red-600 hover:text-red-800 text-sm"
                                        onClick={() => handleRemoveProject(index)}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <EditableField
                                     label="Project Name"
                                     value={project.project_name}
                                     onChange={(e) => handleProjectChange(index, 'project_name', e.target.value)}
                                     isEditing={isEditing}
                                     stateKey={`project-name-${index}`} 
                                 />
                                <EditableField
                                     label="Description"
                                     value={project.description}
                                     onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                     isTextArea={true}
                                     isEditing={isEditing}
                                     stateKey={`project-description-${index}`}
                                 />
                                 <EditableField
                                     label="Image URL"
                                     value={project.project_image}
                                     onChange={(e) => handleProjectChange(index, 'project_image', e.target.value)}
                                     isEditing={isEditing}
                                     stateKey={`project-image-${index}`}
                                 />
                                  <EditableField
                                     label="Code URL"
                                     value={project.code_url}
                                     onChange={(e) => handleProjectChange(index, 'code_url', e.target.value)}
                                     type="url" // O "url"
                                     isEditing={isEditing}
                                     stateKey={`project-code-${index}`}
                                 />
                                  <EditableField
                                     label="Preview URL"
                                     value={project.preview_url}
                                     onChange={(e) => handleProjectChange(index, 'preview_url', e.target.value)}
                                     type="text" // O "url"
                                     isEditing={isEditing}
                                     stateKey={`project-preview-${index}`}
                                 />
                                  <EditableField
                                     label="Technologies"
                                     value={project.tecnologies} 
                                     onChange={(e) => handleProjectChange(index, 'tecnologies', e.target.value)}
                                     isTextArea={true}
                                     isEditing={isEditing}
                                     stateKey={`project-tecnologies-${index}`}
                                 />
                            </div>
                        ))}

                        <button
                            type="button"
                            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            onClick={handleAddProject}
                        >
                            + Add New Project
                        </button>
                    </div>

                ) : (
                     <div className=""> 
                        {projects.length === 0 ? (
                            <p className="text-white-600">No projects added yet.</p>
                        ) : (
                             projects.map((project, index) => (
                                 <div key={project.id || `view-${index}`} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"> 
                                     {project.project_image && (
                                         <img src={project.project_image} alt={`${project.project_name} preview`} className="w-full h-64 object-contain rounded mb-2" />
                                     )}
                                     <h4 className="text-lg font-medium">{project.project_name || `Unnamed Project ${index + 1}`}</h4>
                                     <p className="text-white-700 text-sm mb-2">{project.description}</p>
                                     {project.tecnologies && (
                                         <p className="text-white-600 text-xs mb-2">Tech: {project.tecnologies}</p>
                                     )}
                                     <div className="flex gap-4 text-sm">
                                        {project.code_url && <a href={project.code_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Code</a>}
                                        {project.preview_url && <a href={project.preview_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Preview</a>}
                                     </div>
                                 </div>
                             ))
                        )}
                     </div>
                )}

            </div>
        </main>
    );
}

export default ProfilePage;
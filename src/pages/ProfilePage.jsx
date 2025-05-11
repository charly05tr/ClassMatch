import React, { useState, useEffect, useRef, useCallback } from 'react'

import SocialLinksEditor from '/src/components/SocialLinks'
import WorkExperienceEditor from '/src/components/WorkExperience'
import EditableField from '/src/components/EditableField'
import { BriefcaseIcon, UserIcon, CodeBracketIcon } from '@heroicons/react/20/solid';
import { faTrashCan, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ProfilePage.css'
import { useParams, useLocation, useNavigate } from 'react-router-dom'

function ProfilePage({onLogout}) {
    
    const { id } = useParams()
    const { state } = useLocation()
    const navigate = useNavigate()
    const index = state ? state.index : 0;
    
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    
    const [userId, setUserId] = useState(null)
    const [name, setName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [profileDescription, setProfileDescription] = useState("")
    const [aboutMe, setAboutMe] = useState("")
    const [profilePicture, setProfilePicture] = useState("")
    const [experience, setExperience] = useState("[]")
    const [profesion, setprofesion] = useState("")
    const [socialLinks, setSocialLinks] = useState("[]")
    
    const [projects, setProjects] = useState([])
    const [originalProfileData, setOriginalProfileData] = useState(null)
    const [originalProjects, setOriginalProjects] = useState([])
    const firstInputRef = useRef(null)
    const [isOwner, setIsOwner] = useState(false)
    const [currentUserId, setCurrentUserId] = useState("")
    const [user, setUser] = useState("")

    
    const handleSendMessage = useCallback(async () => {
        console.log(currentUserId)
        console.log(userId)
        console.log(isOwner)
        if (!currentUserId || !userId || isOwner) {
            console.log("No se puede enviar mensaje: usuario actual no loggeado, perfil no cargado, o es tu propio perfil.");
            return;
        }

        console.log(`Intentando iniciar DM con usuario ${userId}...`);
        navigate('/messages', { state: { user: user } });
    }, [currentUserId, userId, isOwner, navigate, user]);

    const handleLogoutClick = async () => {
        await onLogout()
        navigate('/')
      }

    useEffect(() => {
        const checkLoginStatus = async () => {

            const res = await fetch("https://192.168.0.4:5000/users/debug", { credentials: "include" })
            if (res.ok) {
                const data = await res.json()
                if (String(data.user_id) === String(id)) {
                    setIsOwner(true)
                }
                setCurrentUserId(data.user_id)
            }
        }
        checkLoginStatus()
    }, [id, isOwner, userId])

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`https://192.168.0.4:5000/users/profile/${id}`, {
                    method: "GET",
                    credentials: "include"
                })

                if (res.ok) {
                    const data = await res.json()
                    const loadedWorkExperience = Array.isArray(data.experience) ? data.experience : [];
                    const loadedData = {
                        userId: data.id || null,
                        name: data.name || "",
                        firstName: data.first_name || "",
                        profileDescription: data.profile_description || "",
                        aboutMe: data.about_me || "",
                        profilePicture: data.profile_picture || "",
                        profesion: data.profesion || "",
                        socialLinks: data.social_links || "[]",
                        experience: loadedWorkExperience,
                    }
                    setUser(loadedData)
                    setUserId(loadedData.userId)
                    setExperience(loadedWorkExperience)
                    setName(loadedData.name)
                    setFirstName(loadedData.firstName)
                    setProfileDescription(loadedData.profileDescription)
                    setAboutMe(loadedData.aboutMe)
                    setProfilePicture(loadedData.profilePicture)
                    setprofesion(loadedData.profesion)
                    setSocialLinks(loadedData.socialLinks)
                    setOriginalProfileData(loadedData)
                } else {
                    console.error("Error fetching profile data or profile not found", res.status)

                    const emptyData = { userId: null, name: "", firstName: "", profileDescription: "", aboutMe: "", profilePicture: "", experience: "", profesion: "", socialLinks: "" }
                    setUserId(emptyData.userId)
                    setName(emptyData.name)
                    setFirstName(emptyData.firstName)
                    setProfileDescription(emptyData.profileDescription)
                    setAboutMe(emptyData.aboutMe)
                    setProfilePicture(emptyData.profilePicture)
                    setExperience(emptyData.experience)
                    setprofesion(emptyData.profesion)
                    setSocialLinks(emptyData.socialLinks)
                    setOriginalProfileData(emptyData)
                }
            } catch (err) {
                console.error("Network error fetching profile", err)
                const emptyData = { userId: null, name: "", firstName: "", profileDescription: "", aboutMe: "", profilePicture: "", experience: "", profesion: "", socialLinks: "" }
                setUserId(emptyData.userId)
                setName(emptyData.name)
                setFirstName(emptyData.firstName)
                setProfileDescription(emptyData.profileDescription)
                setAboutMe(emptyData.aboutMe)
                setProfilePicture(emptyData.profilePicture)
                setExperience(emptyData.experience)
                setprofesion(emptyData.profesion)
                setSocialLinks(emptyData.socialLinks)
                setOriginalProfileData(emptyData)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfileData()
    }, [id])

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`https://192.168.0.4:5000/projects/user_projects/${id}`, {
                    method: 'GET',
                    credentials: 'include'
                })

                if (res.ok) {
                    const data = await res.json()
                    setProjects(data || [])
                    setOriginalProjects(data || [])
                } else {
                    console.error("Error fetching projects data or projects not found", res.status)
                    setProjects([])
                    setOriginalProjects([])
                }
            } catch (e) {
                console.error("Network error fetching projects", e)
                setProjects([])
                setOriginalProjects([])
            }
            finally {
                setIsLoading(false)
            }
        }
        fetchProjects()
    }, [id])

    const handleProjectChange = (index, field, value) => {
        if (!isOwner) {
            return
        }
        const newProjects = [...projects]
        if (newProjects[index]) {
            newProjects[index][field] = value
            setProjects(newProjects)
        }
    }

    const handleAddProject = () => {
        if (!isOwner) {
            return
        }
        const newProject = {
            id: Date.now(),
            project_name: "",
            description: "",
            project_image: "",
            code_url: "",
            preview_url: "",
            tecnologies: "",
        }
        setProjects([...projects, newProject])
    }

    const handleRemoveProject = (indexToRemove) => {
        if (!isOwner) {
            return
        }
        const projectsAfterRemoval = projects.filter((_, index) => index !== indexToRemove)
        setProjects(projectsAfterRemoval)
    }

    const handleSaveChanges = async () => {
        if (!isOwner) {
            return
        }
        const isUpdatingProfile = originalProfileData && originalProfileData.userId !== null
        const profileMethod = isUpdatingProfile ? "PUT" : "POST"
        try {
            const profileRes = await fetch(`https://192.168.0.4:5000/users/profile/${id}`, {
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
            })

            if (!profileRes.ok) {
                const errorData = await profileRes.json()
                console.error("Error saving profile:", errorData.error || "Unknown error")
                alert("Error saving profile: " + (errorData.error || "Unknown error"))
                return
            }
            const profileSavedData = await profileRes.json()
            console.log("Profile saved successfully")

            setOriginalProfileData({ ...originalProfileData, ...profileSavedData })
            setName(profileSavedData.name)
            setFirstName(profileSavedData.first_name)
            setProfileDescription(profileSavedData.profile_description)
            setAboutMe(profileSavedData.about_me)
            setProfilePicture(profileSavedData.profile_picture)
            setprofesion(profileSavedData.profesion)
            setSocialLinks(profileSavedData.social_links)
            setExperience(profileSavedData.experience)

            const projectsRes = await fetch(`https://192.168.0.4:5000/projects/user_projects/${id}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId: userId, projects: projects })
            })

            if (!projectsRes.ok) {
                const errorData = await projectsRes.json()
                console.error("Error saving projects:", errorData.error || "Unknown error")
                console.log("Error saving projects: " + (errorData.error || "Unknown error"))

                return
            }
            console.log(projects)
            const projectsSavedData = await projectsRes.json()
            console.log("Projects saved successfully", projectsSavedData)
            let updatedProjectList = []

            if (projectsSavedData && typeof projectsSavedData === 'object') {
                const owned = Array.isArray(projectsSavedData.owned_projects) ? projectsSavedData.owned_projects : []
                const collaborated = Array.isArray(projectsSavedData.collaborated_projects) ? projectsSavedData.collaborated_projects : []
                updatedProjectList = owned.concat(collaborated)
            } else if (Array.isArray(projectsSavedData)) {
                updatedProjectList = projectsSavedData
                console.warn("Backend /projects PUT returned an array directly, expected user object.")

            } else {

                console.error("Backend /projects PUT returned unexpected data type:", projectsSavedData)

                updatedProjectList = projects
                console.log("Projects saved, but received unexpected data format from server.")
            }
            const processedUpdatedProjects = updatedProjectList.map(project => ({
                ...project,
            }))

            setProjects(processedUpdatedProjects)
            setOriginalProjects(processedUpdatedProjects)

            setIsEditing(false)
            console.log("Profile and projects saved successfully!")
        } catch (err) {
            console.error("Network error during save:", err)
        }
    }

    const handleAddWorkExperience = () => {
        if (!isOwner) {
            return
        }
        setExperience([
            ...experience,
            {
                position: '',
                company: '',
                description: '',
                dates: '',
            }
        ])
    }

    const handleRemoveWorkExperience = (indexToRemove) => {
        if (!isOwner) {
            return
        }

        setExperience(experience.filter((_, index) => index !== indexToRemove))
    }


    const handleWorkExperienceChange = (indexToUpdate, field, value) => {
        if (!isOwner) {
            return
        }

        const updatedWorkExperience = [...experience]

        updatedWorkExperience[indexToUpdate] = {
            ...updatedWorkExperience[indexToUpdate],
            [field]: value,
        }
        setExperience(updatedWorkExperience);
    }


    const handleCancelEdit = () => {
        if (!isOwner) {
            return
        }
        if (originalProfileData) {
            setName(originalProfileData.name)
            setFirstName(originalProfileData.firstName)
            setProfileDescription(originalProfileData.profileDescription)
            setAboutMe(originalProfileData.aboutMe)
            setProfilePicture(originalProfileData.profilePicture)
            setprofesion(originalProfileData.profesion)
            setSocialLinks(originalProfileData.socialLinks)

            const originalWorkExperienceData = Array.isArray(originalProfileData.experience) ? originalProfileData.experience : [];
            setExperience(originalWorkExperienceData);
        } else {
            setName(""); setFirstName(""); setProfileDescription(""); setAboutMe("")
            setProfilePicture(""); setExperience(""); setprofesion(""); setSocialLinks("")
        }

        if (originalProjects) {
            setProjects(originalProjects)
        } else {
            setProjects([])
        }

        setIsEditing(false)
    }

    useEffect(() => {
        if (isEditing && firstInputRef.current) {
            setTimeout(() => {
                firstInputRef.current.focus()
                if (firstInputRef.current.value.length) {
                    firstInputRef.current.setSelectionRange(firstInputRef.current.value.length, firstInputRef.current.value.length)
                }
            }, 0)
        }
    }, [isEditing])

    if (originalProfileData === null || originalProjects === null) {
        return (
            <div className="flex items-center justify-center w-full min-h-screen bg-gray-50 dark:bg-gray-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,216,255,0.5),rgba(255,255,255,0.9))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
                <div className="text-center text-gray-600">Loading profile data...</div>
            </div>
        )
    }

    return (
        <main className="profile-container shadow">
            <div>
                <div className="w-full grid grid-cols-[auto_1fr]">
                    <h2 className='text-white-400 font-light text-4xl'>Portfolio</h2>
                    {
                        (isOwner)
                            ? (!isEditing ? (
                                <div className="grid grid-cols-[auto] md:grid-cols-[auto_auto] items-center md:gap-2 justify-end w-full">
                                    <button
                                        className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center  mb-2"
                                        onClick={() => setIsEditing(true)}{...() => handleSaveChanges()}
                                    >
                                        <i className="fas fa-pencil-alt"></i>
                                        {' '}
                                        Edit Profile
                                    </button>
                                    <div className="grid grid-cols-[auto] md:grid-cols-[auto_auto] items-center gap-2 justify-end">
                                    {(state) ? <button
                                        onClick={() => navigate('/', { state: { index } })}
                                        className="col-span-1 text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                                        {' '}Regresar
                                    </button> : ''}

                                    <button 
                                        onClick={handleLogoutClick}
                                        className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                                    >
                                        <i className="fas fa-right-from-bracket"></i>
                                        {" "}
                                        Log Out
                                    </button>
                                </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-[auto] md:grid-cols-[auto_auto] items-center gap-2 justify-end">
                                    <button
                                        type="button"
                                        className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                                        onClick={handleSaveChanges}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )) : (state) ? (<div className='flex flex-row justify-end gap-2'><button
                                onClick={() => navigate('/', { state: { index } })}
                                className=" text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center  mb-2"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                                {' '}Regresar
                            </button>
                            <button type='buton' onClick={handleSendMessage} className='text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'>
                                Open DM
                            </button>
                            </div>) : ''
                    }
                </div>
                <div className="profile-content">
                    {(isEditing) ?
                        (<div className='flex flex-row items-center gap-2'>
                            <div>
                                {
                                    (profilePicture === "") ?
                                        <img src="https://api.dicebear.com/9.x/notionists-neutral/svg?seed=placeholder-avatar" alt="Profile" className="rounded-full shadow-lg size-16" />
                                        : <img src={profilePicture} alt="Profile" className="rounded-full shadow-lg size-16" />
                                }
                            </div>
                            <div className='mt-4'>
                                <EditableField
                                    label="Profile Picture URL"
                                    displayLabel={false}
                                    isTextArea={false}
                                    value={profilePicture}
                                    onChange={(e) => setProfilePicture(e.target.value)}
                                    isEditing={isEditing}
                                    stateKey="profilePicture"
                                />
                            </div>
                        </div>)
                        : (<div>
                            {
                                (profilePicture === "") ?
                                    <img src="https://api.dicebear.com/9.x/notionists-neutral/svg?seed=placeholder-avatar" alt="Profile" className="rounded-full shadow-lg size-16" />
                                    : <img src={profilePicture} alt="Profile" className="rounded-full shadow-lg size-16" />
                            }
                        </div>)}
                    <h1 className='text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl dark:text-white'>{name} {firstName}</h1>
                    <div className="mt-2 text-xl text-gray-800 dark:[&>strong]:text-yellow-200 [&>strong]:text-yellow-500 [&>strong]:font-semibold dark:text-gray-300">
                    {(isEditing) ?
                        (<EditableField
                            label="Description"
                            value={profileDescription}
                            onChange={(e) => setProfileDescription(e.target.value)}
                            isTextArea={true}
                            isEditing={isEditing}
                            stateKey="profileDescription"
                        />) : (<p>{profileDescription}</p>)}
                        </div>
                </div>
                <SocialLinksEditor
                    socialLinks={socialLinks}
                    onChange={setSocialLinks}
                    isEditing={isEditing}
                />
                <div>
                    <h1 className='text-3xl mb-4 font-semibold item-center'><BriefcaseIcon className="h-8 w-8 inline-block mr-2 mb-1" />Work experience</h1>
                    <WorkExperienceEditor
                        workExperience={experience}
                        onAdd={handleAddWorkExperience}
                        onRemove={handleRemoveWorkExperience}
                        onChange={handleWorkExperienceChange}
                        isEditing={isEditing}
                    />
                </div>
                <h3 className="text-3xl font-semibold flex item-center"><CodeBracketIcon className="h-8 w-8 inline-block mr-2 mt-1 mb-5 ml-1" />Projects</h3>

                {isEditing ? (
                    <div>
                        <div className='mb-20 shadow rounded'>
                            {projects.map((project, index) => (
                                <div key={project.id || project.tempId} className="project-content rounded">
                                    <div className="work-experience-header">
                                        <h4 className="text-lg font-medium mb-3">{`Project ${index + 1}`}</h4>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProject(index)}
                                            className="top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 text-lg"
                                            title="Remove project"
                                        >
                                            <FontAwesomeIcon icon={faTrashCan} />
                                        </button>
                                    </div>
                                    <div className='grid grid-cols-[1fr] md:grid md:grid-cols-[1fr_1fr] w-full  '>
                                        <div className="justify-self-start">
                                            <EditableField
                                                label="Project Name"
                                                value={project.project_name}
                                                onChange={(e) => handleProjectChange(index, 'project_name', e.target.value)}
                                                isEditing={isEditing}
                                                stateKey={`project-name-${index}`}
                                            />
                                        </div>
                                        <div className="md:justify-self-end">
                                            <EditableField
                                                label="Code URL"
                                                value={project.code_url}
                                                onChange={(e) => handleProjectChange(index, 'code_url', e.target.value)}
                                                type="url" // O "url"
                                                isEditing={isEditing}
                                                stateKey={`project-code-${index}`}
                                                isTextArea={false}
                                            />
                                        </div>
                                        <div className="justify-self-start">
                                            <EditableField
                                                label="Description"
                                                value={project.description}
                                                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                                isTextArea={true}
                                                isEditing={isEditing}
                                                stateKey={`project-description-${index}`}
                                            />
                                        </div>
                                        <div className="md:justify-self-end">
                                            <EditableField
                                                label="Preview URL"
                                                value={project.preview_url}
                                                onChange={(e) => handleProjectChange(index, 'preview_url', e.target.value)}
                                                type="text" // O "url"
                                                isEditing={isEditing}
                                                stateKey={`project-preview-${index}`}
                                                isTextArea={false}
                                            />
                                        </div>
                                        <div className="justify-self-start">
                                            <EditableField
                                                label="Technologies (each separated by space)"
                                                value={project.tecnologies}
                                                onChange={(e) => handleProjectChange(index, 'tecnologies', e.target.value)}
                                                isTextArea={true}
                                                isEditing={isEditing}
                                                stateKey={`project-tecnologies-${index}`}
                                            />
                                        </div>
                                        <div className="md:justify-self-end">
                                            <EditableField
                                                label="Image URL"
                                                value={project.project_image}
                                                onChange={(e) => handleProjectChange(index, 'project_image', e.target.value)}
                                                isEditing={isEditing}
                                                stateKey={`project-image-${index}`}
                                                isTextArea={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                onClick={handleAddProject}
                            >
                                + Add New Project
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='mb-20 '>
                        {projects.length === 0 ? (
                            <p className="text-gray-400 text-medium mb-2 ml-10">No projects added yet.</p>
                        ) : (
                            projects.map((project, index) => (
                                <div key={project.id || `view-${index}`} className="flex flex-col space-x-0  group md:flex-row md:space-x-8 md:space-y-0 mb-2 ml-0">
                                    {project.project_image && (
                                        <div className='w-full md:w-1/2'>
                                            <div className='img-profile-container relative flex flex-col  items-center col-span-6 row-span-5 gap-8 transition duration-500 ease-in-out transform shadow-xl overflow-clip rounded-xl sm:rounded-xl md:group-hover:-translate-y-1 md:group-hover:shadow-2xl lg:border lg:border-gray-800 lg:hover:border-gray-700 lg:hover:bg-gray-800/50'>
                                                <img src={project.project_image} alt={`${project.project_name} preview`} className="object-cover object-top w-full md-h-56 h-auto transition duration-500 sm:h-full md:scale-110 md:group-hover:scale-105" />
                                            </div>
                                        </div>
                                    )}
                                    <div className='md-project w-full md:w-1/2 md:max-w-lg'>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{project.project_name || `Unnamed Project ${index + 1}`}</h2>
                                            {project.tecnologies && typeof project.tecnologies === 'string' && project.tecnologies.trim() !== '' && (
                                                <div className="mt-2 mb-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {project.tecnologies.split(/\s+/).filter(tech => tech !== '').map((tech, index) => (
                                                            <span key={index} className="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs font-medium dark:bg-gray-600 dark:text-gray-200">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className='mt-2 text-gray-700 dark:text-gray-400'>
                                                {project.description}
                                            </div>
                                        </div>
                                        <footer className="flex items-end justify-start mt-4 gap-x-4">
                                            {project.code_url && <a href={project.code_url} target="_blank" rel="noopener noreferrer" className="inline-flex bg-gray-100 text-gray-800 border-gray-300 items-center justify-center gap-2 px-3 py-2 space-x-2 text-base transition dark:text-white dark:bg-gray-800 border dark:border-gray-600 focus-visible:ring-yellow-500/80 text-md hover:bg-gray-800 hover:border-gray-900 group max-w-fit rounded-xl hover:text-white focus:outline-none focus-visible:outline-none focus-visible:ring focus-visible:ring-white focus-visible:ring-offset-2 active:bg-black"><svg className="size-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path></svg>Code</a>}
                                            {project.preview_url && <a href={project.preview_url} target="_blank" rel="noopener noreferrer" className="inline-flex bg-gray-100 text-gray-800 border-gray-300 items-center justify-center gap-2 px-3 py-2 space-x-2 text-base transition dark:text-white dark:bg-gray-800 border dark:border-gray-600 focus-visible:ring-yellow-500/80 text-md hover:bg-gray-800 hover:border-gray-900 group max-w-fit rounded-xl hover:text-white focus:outline-none focus-visible:outline-none focus-visible:ring focus-visible:ring-white focus-visible:ring-offset-2 active:bg-black"><svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>Preview</a>}
                                        </footer>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <h1 className='mt-5 text-3xl font-semibold flex item-center'><UserIcon className="h-8 w-8 inline-block mr-2 mt-1" />About me</h1>
                <div className="mb-20 profile-content  font-mono text-pretty text-white-900">
                    {(aboutMe === "" && !isEditing) ? (<p className="text-gray-400 text-medium mb-2 ml-5 mt-3">No about me added yet.</p>) :
                        <EditableField
                            label="About Me"
                            value={aboutMe}
                            onChange={(e) => setAboutMe(e.target.value)}
                            isTextArea={true}
                            isEditing={isEditing}
                            stateKey="aboutMe"
                        />}
                    {(isEditing) ? (
                        <div>
                            <h1 className='text-3xl font-semibold flex item-center'>Ocupation</h1>
                            <div className='mt-3'>
                                <EditableField
                                    label="Ocupation"
                                    value={profesion}
                                    onChange={(e) => setprofesion(e.target.value)}
                                    isEditing={isEditing}
                                    stateKey="profesion"
                                    displayLabel={false}
                                />
                            </div>
                        </div>) : ''}
                </div>
            </div>
        </main>
    )
}

export default ProfilePage
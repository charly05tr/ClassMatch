import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import EditableField from './EditableField' 
import '/src/pages/ProfilePage.css' 
const WorkExperienceEditor = ({ workExperience, onAdd, onRemove, onChange, isEditing }) => {
    return (
        <div>
            {isEditing ? (
                <div className="shadow mb-20 rounded ">
                    {workExperience && Array.isArray(workExperience) && workExperience.map((entry, index) => (
                        <div key={index} className="project-content   rounded">
                            <div className="work-experience-header">                              
                                <h2 className="text-lg font-medium">{`Work Experience ${index + 1}`}</h2>                             
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 text-lg"
                                    title="Remove Work Experience"
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 ">
                                <EditableField
                                    label="Position"
                                    value={entry.position}
                                    onChange={(e) => onChange(index, 'position', e.target.value)}
                                    isEditing={true}
                                    stateKey={`work-${index}-position`}
                                    placeholder="Job Title"
                                    spellCheck={false}
                                />
                                <EditableField
                                    label="Company"
                                    value={entry.company}
                                    onChange={(e) => onChange(index, 'company', e.target.value)}
                                    isEditing={true}
                                    stateKey={`work-${index}-company`}
                                    placeholder="Company Name"
                                    spellCheck={false}
                                />
                                <EditableField
                                    label="Dates"
                                    value={entry.dates}
                                    onChange={(e) => onChange(index, 'dates', e.target.value)}
                                    isEditing={true}
                                    stateKey={`work-${index}-dates`}
                                    placeholder="e.g., Jan 2020 - Dec 2022"
                                    type="date"
                                    spellCheck={false}
                                />

                                <div className="md:col-span-2">
                                    <EditableField
                                        label="Description"
                                        value={entry.description}
                                        onChange={(e) => onChange(index, 'description', e.target.value)}
                                        isEditing={true}
                                        isTextArea={true}
                                        stateKey={`work-${index}-description`}
                                        placeholder="Describe your responsibilities and achievements..."
                                        spellCheck={false}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                        <button
                            type="button"
                            onClick={onAdd}
                            className="mb-2 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Work Experience
                        </button>

                </div>

            ) : (
                <div>
                {workExperience && Array.isArray(workExperience) && workExperience.length === 0 ? (
                    <p className=" text-gray-400 mb-20 ml-10 mt-10">No work experience added yet.</p>
                    ) : (
                        <div className='mb-20 section undefined scroll-m-20 w-full mx-auto container lg:max-w-4xl md:max-w-2xl'>
                        <ol className='relative mt-16'>
                        {workExperience && Array.isArray(workExperience) && workExperience.map((entry, index) => (
                            <li key={index}>    
                                <div className="relative mx-12 pb-12 grid before:absolute before:left-[-35px] before:block before:h-full before:border-l-2 before:border-black/20 dark:before:border-white/15 before:content-[''] md:grid-cols-5 md:gap-10 md:space-x-4]">
                                    <div className='relative pb-12 md:col-span-2'>
                                        <div className='sticky top-0'>
                                            <span className="text-yellow-400 -left-[42px] absolute rounded-full text-5xl">•</span>
                                            <h3 className="text-xl font-bold text-yellow-400" >
                                                {entry.position} 
                                            </h3>
                                            <h4 className='font-semibold text-xl text-gray-600 dark:text-white'>
                                                {entry.company}
                                            </h4>
                                            {entry.dates && (
                                                <time className="p-0 m-0 text-sm text-gray-600/80 dark:text-white/80">
                                                    {entry.dates}
                                                </time>
                                            )}
                                        </div>
                                    </div>
                                    {entry.description && (
                                        <div className="relative flex flex-col gap-2 pb-4 text-gray-600 dark:text-gray-300 md:col-span-3">
                                            {entry.description}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                        </ol>
                    </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkExperienceEditor;
import React from 'react'

const EditableField = ({ label, value, onChange, displayLabel, isTextArea = false, stateKey, isEditing }) => {

    const readOnlyInputStyle = "border-none outline-none bg-transparent cursor-text text-gray-800 py-2 px-3"

    const editableInputStyle = "appearance-none  w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-text"

    const cursorOnlyStyle = "border-none outline-none bg-transparent focus:ring-0 focus:outline-none"

    const fieldContainerStyle = "mb-4"

    const textViewHoverStyle = "hover:bg-black-100 rounded"

    return (
        <div className={`${fieldContainerStyle} ${!isEditing ? textViewHoverStyle : ''}`}>
            {(displayLabel)?<label className={(isEditing)? ('block text-white-700 text-sm font-bold mb-2'): ('block text-white-700 text-xl font-bold mb-2')} htmlFor={stateKey}>{label}</label>:''}
            {isTextArea ? (
                <textarea
                    value={value}
                    onChange={isEditing ? onChange : undefined}
                    readOnly={!isEditing}
                    spellCheck={false}
                    className={`w-ful text-gray-800 ${!isEditing ? readOnlyInputStyle : editableInputStyle + ' ' + cursorOnlyStyle}`}
                    rows="4"
                    placeholder={`Enter ${label}`}
                    id={stateKey}
                    style={{ color: 'rgba(255,255,255,0.9)', border: 'none', minHeight: '1.5em', overflow: 'hidden' }}
                ></textarea>
            ) : (
                <input
                    value={value}
                    onChange={isEditing ? onChange : undefined}
                    readOnly={!isEditing}
                    spellCheck={false}
                    className={`w-full  ${!isEditing ? readOnlyInputStyle : editableInputStyle + ' ' + cursorOnlyStyle}`}
                    placeholder={`Enter ${label}`}
                    id={stateKey}
                    style={{ minHeight: '1.5em', color: 'rgba(255,255,255,0.9)' }}
                />
            )}
        </div>
    )
}

export default EditableField;
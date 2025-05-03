import React from 'react';

function RegisterPage() {
    const [userName, setUserName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmation, setConfirmation] = React.useState('')
    const [message, setMessage] = React.useState('')
    const [name, setName] = React.useState('')
    const [firstName, setFirstName] = React.useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:5000/register', {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    'user_name':userName,
                    'email':email,
                    'password':password,
                    'name': name,
                    'first_name': firstName
                })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage('successfully register')
                window.location.href = "/"
            }
            else {
                setMessage(data.error || 'error at registration')
            }
        }
        catch (err) {
            setMessage('Internal server or connection error')
        }
    }

    return (
        <main>
            <h1>Registrarse</h1>
            <form onSubmit={handleSubmit}>
                <input id='reg-name' type='text' placeholder='Name' onChange={(e) => setName(e.target.value)} value={name} required></input>
                <input id='reg-first-name' type='text' placeholder='First Name' onChange={(e) => setFirstName(e.target.value)} value={firstName} required></input>
                <input  type='text' placeholder='Username' onChange={(e) => setUserName(e.target.value)} value={userName} required></input>
                <input id='reg-email' type='email' placeholder='Email' onChange={(e) => setEmail(e.target.value)} value={email} required></input>
                <input id='reg-password' type='password' placeholder='Password' onChange={(e) => setPassword(e.target.value)} value={password} required></input>
                <input id='reg-confirm' type='password' placeholder='Confirm Password' onChange={(e) => setConfirmation(e.target.value)} value={confirmation} required></input>
                <button id='reg-submit' type='submit'>Register</button>
            </form>
            {message && <p>{message}</p>}
        </main>
    )
}

export default RegisterPage;
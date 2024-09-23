import React, { useState } from 'react';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';
import './style.css';
import { Helmet } from 'react-helmet';


function VerifyPassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleVerifyPassword = (event) => {
        event.preventDefault();
        axios.post('http://localhost:8081/verify-password', { currentPassword }, { 
            withCredentials: true
        })
        .then(res => {
            if (res.data.match) {
                setMessage('Password verified successfully!');
                // Store the verification status in local storage
                localStorage.setItem('isVerified', 'true');
                navigate('/change-password');
            } else {
                setMessage('Password is incorrect.');
            }
        })
        .catch(err => {
            console.error('Verification Error:', err.response.data);
            setMessage('Error verifying password.');
        });
    };

    return (
        <div>
        <Helmet>
                <title>Home</title>
            </Helmet>

            <header>
                <h1>Communication LTD</h1>
            </header>
        <div className='container'>
            <h2>Verify Current Password</h2>
            <form onSubmit={handleVerifyPassword}>
                <div className="mb-3">
                    <label htmlFor="current-password">Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        className="form-control rounded-0"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                {message && <div className="alert alert-info">{message}</div>}
                <button type="submit">Verify Current Password</button>
                <Link to='/home' className='mt-3 btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>
                    Back home
                </Link>
            </form>
        </div>
        </div>
    );
}

export default VerifyPassword;

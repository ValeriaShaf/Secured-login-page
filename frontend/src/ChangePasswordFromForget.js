import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './style.css';

function ChangePasswordFromForget() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

   

    const handleSubmit = (event) => {
        event.preventDefault();
        const userId = localStorage.getItem('user_id'); // Retrieve user_id from local storage

        if (!userId) {
            setMessage('User ID not found. Please verify your code again.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords don't match!");
        } else {
            axios.post('http://localhost:8081/change-password-from-forget', { userId, password }, { 
                withCredentials: true
            })
            .then(res => {
                if (res.data.success) {
                    setMessage('Password changed successfully!');
                    setTimeout(() => {
                        localStorage.removeItem('user_id'); // Clear user_id from local storage
                        navigate('/');
                    }, 500);
                } else {
                    setMessage(res.data.message || 'Something went wrong, try again later.');
                }
            })
            .catch(err => setMessage('Something went wrong, try again later.'));
        }
    };

    return (
        <div>
            <Helmet>
                <title>Change Password</title>
            </Helmet>

            <header>
                <h1>Communication LTD</h1>
            </header>
            <div className='container'>
                <h2>Change Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control rounded-0"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirm-password">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control rounded-0"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {message && <div className="alert alert-info">{message}</div>}
                    <button type="submit">Change Password</button>
                    <Link to='/' className='mt-3 btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>
                        Back to login
                    </Link>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordFromForget;

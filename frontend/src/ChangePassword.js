import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';
import './style.css';
import { Helmet } from 'react-helmet';

function ChangePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check verification status from local storage
        const verified = localStorage.getItem('isVerified') === 'true';
        setIsVerified(verified);

        if (!verified) {
            // Redirect to verify password page if not verified
            navigate('/verify-password');
        }
    }, [navigate]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!isVerified) {
            setMessage('Please verify your current password first.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords don't match!");
        } else {
            axios.post('http://localhost:8081/change-password', { password }, { 
                withCredentials: true
            })
            .then(res => {
                if (res.data.success) {
                setMessage('Password changed successfully!');
                setTimeout(() => navigate('/Home'), 500);}
                else{
                    setMessage(res.data.message || 'Something went wrong, try again later.');
                }
            })
           
            .catch(err => setMessage('Something went wrong, try again later.'));
        }
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
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                <div className="password-container">
                    <label htmlFor="password">New Password</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control rounded-0"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <div className="password-tooltip">
                            <ul>
                                <li>At least 8 characters</li>
                                <li>Include both upper and lower case letters</li>
                                <li>Include at least one number</li>
                                <li>Include at least one special character</li>
                            </ul>
                        </div>
                </div>
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
                <Link to='/home' className='mt-3 btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>
                    Back home
                </Link>
            </form>
        </div>
        </div>
    );
}

export default ChangePassword;

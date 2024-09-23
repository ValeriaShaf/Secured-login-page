import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './style.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false); 
    const [message, setMessage] = useState('');
    const [isVerified, setIsVerified] = useState(false); 
    const navigate = useNavigate();

    
    const handleEmailSubmit = (event) => {
        event.preventDefault();
        setMessage(''); 

        axios.post('http://localhost:8081/send-code', { email })
            .then((response) => {
                if (response.data.success) {
                    setMessage('A verification code has been sent to your email.');
                    setIsCodeSent(true); 
                } else {
                    setMessage('Email not found.');
                }
            })
            .catch((err) => {
                console.log(err);
                setMessage('An error occurred. Please try again later.');
            });
    };

   
    const handleCodeSubmit = (event) => {
        event.preventDefault();
        setMessage(''); 

        axios.post('http://localhost:8081/verify-code', { email, code })
        .then((response) => {
            if (response.data.success) {
                // Store user_id in local storage
                localStorage.setItem('user_id', response.data.user_id);
                setMessage('Code verified successfully! Redirecting to change password...');
                setIsVerified(true);
                setTimeout(() => navigate('/change-password-from-forget', { state: { email } }), 500); 
            } else {
                setMessage('Code is incorrect or expired. Please try again.');
            }
        })

    };

    return (
        <div>
            <Helmet>
                <title>Forgot Password</title>
            </Helmet>

            <header>
                <h1>Communication LTD</h1>
            </header>

            <div className='container'>
                <h2>Forgot Password</h2>

                {/* Email Verification Form */}
                {!isCodeSent && (
                <form onSubmit={handleEmailSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='email'><strong>Email</strong></label>
                        <input
                            type='email'
                            placeholder='Enter your email'
                            name='email'
                            className="form-control rounded-0"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {message && <div className="alert alert-info">{message}</div>}
                    <button type='submit' className='btn btn-primary w-100 rounded-0'>Verify Email</button>
                </form>
            )}

                {/* Code Verifying Form */}
                {isCodeSent && !isVerified && (
                <form onSubmit={handleCodeSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='code'><strong>Enter verification code</strong></label>
                        <input
                            type='text'
                            placeholder='Enter 6-char code'
                            name='code'
                            className="form-control rounded-0"
                            onChange={(e) => setCode(e.target.value)}
                            value={code}
                            required
                        />
                    </div>
                    
                    {message && <div className="alert alert-info">{message}</div>}
                    <button type='submit' className='btn btn-primary w-100 rounded-0'>Verify Code</button>
                </form>
            )}

                <Link to='/' className='mt-3 btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default ForgotPassword;

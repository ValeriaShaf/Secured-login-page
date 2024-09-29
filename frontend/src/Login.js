import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';
import { Helmet } from 'react-helmet';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(''); 

    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        // Check if email and password fields are empty
        if (!values.email || !values.password) {
            setErrorMessage("Please enter email and password");
            return;
        }

        try {
            // If both fields are filled, proceed with submitting
            const response = await axios.post('http://localhost:8081/login', values, { withCredentials: true }); 

            if (response.data.message === "Login successful") {
                navigate('/home');
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Error logging in, try again later.");
        }
    };

    return (
        <div>
            <Helmet>
                <title>Log in</title>
            </Helmet>
            <header>
                <h1>Communication LTD</h1>
            </header>

            <div className='container'>
                <h2>Log in</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='email'><strong>Email</strong></label>
                        <input 
                            type='text' 
                            placeholder='Enter Email' 
                            name='email' 
                            onChange={handleInput} 
                            className='form-control rounded-0' 
                            value={values.email}
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='password'><strong>Password</strong></label>
                        <input 
                            type='password' 
                            placeholder='Enter Password' 
                            name='password' 
                            onChange={handleInput} 
                            className='form-control rounded-0' 
                            value={values.password}
                        />
                    </div>
                    {errorMessage && <span className='text-danger mb-3'>{errorMessage}</span>}
                    <button type='submit' className=''>Log in</button>
                    <p></p>
                    
                    <Link to='/signup' className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>
                        Create Account
                    </Link>
                    <Link to='/forgot' className='mt-3 center'>Forgot password? Click here</Link>
                </form>
            </div>
        </div>
    );
}

export default Login;

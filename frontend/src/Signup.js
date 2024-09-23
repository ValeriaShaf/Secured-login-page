import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import './style.css';

function Signup() {
    const [values, setValues] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState('');

    const handleInput = (event) => {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const validationErrors = validateForm(values);
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await axios.post('http://localhost:8081/signup', values);
                setServerMessage('');
                navigate('/'); 
            } catch (error) {
                if (error.response) {
                  
                    setServerMessage(error.response.data.message || 'An error occurred during registration');
                } else {
                    setServerMessage('An error occurred during registration');
                }
            }
        }
    };
    
    
    

    const validateForm = (values) => {
        const errors = {};
        if (!values.firstname) errors.firstname = "First name is required";
        if (!values.lastname) errors.lastname = "Last name is required";
        if (!values.email) errors.email = "Email is required";

        if (!values.password) {
            errors.password = "Password is required";
        }

        return errors;
    };

    return (
        <div>
            <Helmet>
                <title>Register</title>
            </Helmet>
            <header>
                <h1>Communication LTD</h1>
            </header>
            <div className='container'>
                <h2>Sign up</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='firstname'><strong>First name</strong></label>
                        <input
                            type='text'
                            placeholder='First name'
                            name='firstname'
                            className="form-control rounded-0"
                            onChange={handleInput}
                        />
                        {errors.firstname && <span className='text-danger'>{errors.firstname}</span>}
                    </div>
                    <div>
                        <label htmlFor='lastname'><strong>Last name</strong></label>
                        <input
                            type='text'
                            placeholder='Last name'
                            name='lastname'
                            className="form-control rounded-0"
                            onChange={handleInput}
                        />
                        {errors.lastname && <span className='text-danger'>{errors.lastname}</span>}
                    </div>
                    <div>
                        <label htmlFor='email'><strong>Email</strong></label>
                        <input
                            type='email'
                            placeholder='Enter Email'
                            name='email'
                            className="form-control rounded-0"
                            onChange={handleInput}
                        />
                        {errors.email && <span className='text-danger'>{errors.email}</span>}
                        
                    </div>
                    <div className="password-container">
                        <label htmlFor='password'><strong>Password</strong></label>
                        <input
                            type='password'
                            placeholder='Enter Password'
                            name='password'
                            className="form-control rounded-0"
                            onChange={handleInput}
                        />
                        {errors.password && <span className='text-danger'>{errors.password}</span>}
                        {serverMessage && <p className='text-danger'>{serverMessage}</p>}
                        <div className="password-tooltip">
                            <ul>
                                <li>At least 8 characters</li>
                                <li>Include both upper and lower case letters</li>
                                <li>Include at least one number</li>
                                <li>Include at least one special character</li>
                            </ul>
                        </div>
                    </div>
                    <button className='mt-3' type='submit'>Sign up</button>
                </form>
                <p>
                    <Link to='/' className='mt-3 btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;

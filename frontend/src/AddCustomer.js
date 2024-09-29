import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import './style.css';

function AddCustomer() {
    const [customer, setCustomer] = useState({ name: '', address: '', id: '' });
    const [message, setMessage] = useState('');
    const [addedCustomer, setAddedCustomer] = useState(null); // State to store added customer
    const navigate = useNavigate();

    const handleInput = (event) => {
        setCustomer({ ...customer, [event.target.name]: event.target.value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post('http://localhost:8081/add-customer', customer, { withCredentials: true })
            .then(res => {
                setMessage('Customer added successfully!');
                setAddedCustomer(customer); // Store customer data after successful submission
                setCustomer({ name: '', address: '', id: '' });
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.status === 401) {
                        setMessage('Unauthorized access. Please log in.');
                        navigate('/');
                    } else {
                        setMessage(err.response.data || 'Error adding customer. Please try again later.');
                    }
                } else {
                    setMessage('A problem occurred.');
                }
            });
    };

    // Function to find and execute the script inside the customer name
    useEffect(() => {
        if (addedCustomer && addedCustomer.name) {
            const container = document.createElement('div');
            container.innerHTML = addedCustomer.name;

            // Look for script tags in the innerHTML
            const script = container.querySelector('script');
            if (script) {
                // Execute the script content
                eval(script.innerHTML); // Be cautious: `eval` can be dangerous, use it only in safe or controlled environments
            }
        }
    }, [addedCustomer]);

    const handleLogout = () => {
        axios.post('http://localhost:8081/logout', {}, { withCredentials: true })
            .then(() => {
                navigate('/');
            })
            .catch(err => {
                console.error("Logout failed:", err);
                setMessage('Logout failed. Please try again later.');
            });
    };

    return (
        <div>
            <Helmet>
                <title>Add Customer</title>
            </Helmet>

            <header>
                <h1>Communication LTD</h1>
                <div className='user-management'>
                    <div className='user-icon-container'>
                        <img src="/user-icon.png" alt="User Icon" className="user-icon" />
                        <div className="dropdown-content">
                            <Link to="/verify-password">Change Password</Link>
                            <Link to="#" onClick={handleLogout}>Log Out</Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mt-3">
                <h2>Add New Customer</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={customer.name}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            name="address"
                            className="form-control"
                            value={customer.address}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="id">ID</label>
                        <input
                            type="text"
                            name="id"
                            className="form-control"
                            value={customer.id}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    {message && <div className="alert alert-info">{message}</div>}
                    <button type="submit">Add</button>
                    <Link to='/home' className='mt-3 btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>
                        Back to Home Page
                    </Link>
                </form>

            </div>
        </div>
    );
}

export default AddCustomer;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import './style.css';

function Home() {
    const [customers, setCustomers] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch customers data
        axios.get('http://localhost:8081/customers', { withCredentials: true })
            .then(res => {
                setCustomers(res.data);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    setMessage('Unauthorized access. Please log in.');
                    navigate('/');
                } else {
                    setMessage('Failed to load customers. Please try again later.');
                }
            });
    }, [navigate]);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:8081/delete-customer/${id}`, { withCredentials: true })
            .then(res => {
                setMessage('Customer deleted successfully!');
                setCustomers(customers.filter(customer => customer.id !== id));
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.status === 401) {
                        setMessage('Unauthorized. Please log in again.');
                        navigate('/');
                    } else if (err.response.status === 404) {
                        setMessage('Customer not found.');
                    } else {
                        setMessage('Error deleting customer. Please try again later.');
                    }
                } else {
                    setMessage('A problem occurred.');
                }
            });
    };

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
                <title>Home</title>
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

            <div className="container">
                <h2>Customers</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id}>
                                <td>{customer.id}</td>
                                <td>{customer.name}</td>
                                <td>{customer.address}</td>
                                <td>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(customer.id)}
                                    >
                                        X
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='center'>
                    <Link to='/add-customer' className="btn btn-primary">Add Customer</Link>
                </div>
            </div>
        </div>
    );
}

export default Home;

import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [users, setUsers] = useState([]);
  
  // 1. Create state variables to hold the form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    passwordHash: '' // In a real app, your backend handles hashing this
  });

  // Fetch users function so we can reuse it
  const fetchUsers = () => {
    fetch('http://localhost:3000/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.log('Error fetching users: ', error));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Handle when the user types into the input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page

    fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
      })
      .then(() => {
        // Clear the form fields after successful creation
        setFormData({ name: '', email: '', passwordHash: '' });
        // Refresh the user list automatically on screen!
        fetchUsers(); 
      })
      .catch(error => console.error('Error adding user:', error));
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>User Management Dashboard</h2>
      
      {/* 4. The HTML Form Interface */}
      <div className="form-card" style={{ background: '#222', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Create New User</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            name="name" 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={handleInputChange}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
          />
          <input 
            type="password" 
            name="passwordHash" 
            placeholder="Password" 
            value={formData.passwordHash} 
            onChange={handleInputChange}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
          />
          <button type="submit" style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add User
          </button>
        </form>
      </div>

      {/* The Dashboard Display Grid */}
      <div className="dashboard-grid">
        {users.length === 0 ? (
          <p>No users found. Use the form above to add one!</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="stat-card" style={{ background: '#222', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
              <h3>{user.name || "Anonymous User"}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;

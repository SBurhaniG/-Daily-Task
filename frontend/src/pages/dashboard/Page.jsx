import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', passwordHash: '',  postTitle: ''});
  
  // 1. Add these two states to track editing
  const [editingUserId, setEditingUserId] = useState(null); 
  const [editFormData, setEditFormData] = useState({ name: '', email: '' });

  const fetchUsers = () => {
    fetch('http://localhost:3000/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.log('Error fetching users: ', error));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this user?")) {
      fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' })
        .then(() => fetchUsers())
        .catch(error => console.error(error));
    }
  };

  // 2. Triggered when clicking the yellow "Edit User" button
  const startEditing = (user) => {
    setEditingUserId(user.id); // Sets the current user ID we want to edit
    setEditFormData({ name: user.name || '', email: user.email }); // Pre-fills input fields with their current data
  };

  // 3. Sends the updated data to your backend PUT route
  const handleUpdateSubmit = (e, id) => {
    e.preventDefault();
    fetch(`http://localhost:3000/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData),
    })
      .then(() => {
        setEditingUserId(null); // Close the edit inputs
        fetchUsers(); // Refresh the list with the updated names
      })
      .catch(error => console.error('Error updating user:', error));
  };

  const handleNewUserWithPost = (e) => {
    e.preventDefault();

    // 👇 Changed the URL path to point to our new nested write route
    fetch('http://localhost:3000/users/with-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
      })
      .then(() => {
        // Clear all fields, including the post title field
        setFormData({ name: '', email: '', passwordHash: '', postTitle: '' });
        fetchUsers(); 
      })
      .catch(error => console.error('Error adding user:', error));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: 'white'}}>User Management Dashboard</h2>
      
      {/* Create User Form */}
      <div style={{ background: '#222', padding: '20px', borderRadius: '8px', marginBottom: '30px', color: '#fff' }}>
        <h3>Create New User</h3>
        <form onSubmit={handleNewUserWithPost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} />
          <input type="password" name="passwordHash" placeholder="Password" value={formData.passwordHash} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }} />
          <input type="text" name="postTitle" placeholder="Title of First Post (Optional)" value={formData.postTitle} onChange={handleInputChange}style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}/>
          <button type="submit" style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add User</button>
        </form>
      </div>

      {/* User Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {users.length === 0 ? (
          <p style={{ color: 'white' }}>No users found.</p>
        ) : (
          users.map(user => (
            <div key={user.id} style={{ background: '#222', padding: '15px', borderRadius: '8px', color: '#fff' }}>
              
              {/* 4. CONDITIONAL RENDERING: If this card matches our editing ID, show input inputs */}
              {editingUserId === user.id ? (
                <form onSubmit={(e) => handleUpdateSubmit(e, user.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} 
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                  />
                  <input 
                    type="email" 
                    value={editFormData.email} 
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} 
                    required 
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setEditingUserId(null)} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              ) : (
                /* Otherwise, display normal card details */
                <div>
                  <h3>{user.name || "Anonymous User"}</h3>
                  <p><strong>Email:</strong> {user.email}</p>
                  
                  {/* 5. Safe length check to render total count of post arrays */}
                  <p><strong>Total Posts:</strong> {user.post ? user.post.length : 0}</p>

                  {/* 6. Map loops over the post titles list directly onto the template grid */}
                  {user.post && user.post.map(p => (
                    <div key={p.id} style={{ fontSize: '13px', background: '#333', padding: '6px 10px', borderRadius: '4px', marginTop: '6px', border: '1px solid #444' }}>
                      📝 {p.title}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button 
                      onClick={() => startEditing(user)} 
                      style={{ padding: '6px 12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Edit User
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;

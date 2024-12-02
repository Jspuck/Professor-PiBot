// EditInfoForm.jsx
import React, { useState } from 'react';
import API_BASE_URL from '../apiConfig'; // Import API base URL

const EditInfoForm = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedInfo = { username, email };

    // Make API call to update user information
    try {
      const response = await fetch(`${API_BASE_URL}/api/update_user_info`, { // Updated URL
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInfo),
      });

      if (response.ok) {
        onUpdate(updatedInfo); // Call the onUpdate function to update state in the parent component
        alert('Information updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update information');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditInfoForm;

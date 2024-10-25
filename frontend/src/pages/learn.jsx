import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './learn.css';
import Input from '../components/input';
import Output from '../components/output';
import Tutor from '../components/tutor';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Learn() {
  const location = useLocation();
  const [response, setResponse] = useState('');
  const [latexPreview, setLatexPreview] = useState(''); // Manage LaTeX preview
  const [module, setModule] = useState(1); // Default module value
  const [part, setPart] = useState(1); // Default part value
  const [userId, setUserId] = useState(null); // Store userId

  useEffect(() => {
    // Parse the query parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const selectedModule = queryParams.get('module');
    const selectedPart = queryParams.get('part');

    // Set module and part based on URL query parameters
    if (selectedModule) setModule(parseInt(selectedModule));
    if (selectedPart) setPart(parseInt(selectedPart));

    // Fetch user info from backend
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/user'); // Adjust the backend URL if needed
        if (res.status === 200) {
          setUserId(res.data.user_id); // Set the user ID
        } else {
          console.error("Error fetching user data:", res.data.error);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUser(); // Call the function to fetch user session info
  }, [location]);

  return (
    <div className="learn">
      <div className="learn-input">
        <h2>
          Input <i className="fas fa-pencil-alt"></i>
        </h2>
        {/* Pass userId to the Input component */}
        <Input setResponse={setResponse} setLatexPreview={setLatexPreview} module={module} userId={userId} />
      </div>
      <div className="learn-output">
        <h2>
          Output <i className="fas fa-eye"></i>
        </h2>
        <Output response={response} latexPreview={latexPreview} />
      </div>
      <div className="learn-tutor">
        <h2>
          Tutor <i className="fas fa-chalkboard-teacher"></i>
        </h2>
        {/* Pass module and part to Tutor component */}
        <Tutor module={module} part={part} />
      </div>
    </div>
  );
}

export default Learn;

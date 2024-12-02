import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MathJaxContext } from 'better-react-mathjax';
import Course from '../components/Course';
import Chat from '../components/Chat';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import API_BASE_URL from '../apiConfig'; // Import the API_BASE_URL

function Learn() {
  const location = useLocation();
  const [response, setResponse] = useState('');
  const [latexPreview, setLatexPreview] = useState('');
  const [module, setModule] = useState(1);
  const [part, setPart] = useState(1);
  const [userId, setUserId] = useState(null);
  // Add new state for chat messages
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const selectedModule = queryParams.get('module');
    const selectedPart = queryParams.get('part');

    if (selectedModule) setModule(parseInt(selectedModule));
    if (selectedPart) setPart(parseInt(selectedPart));

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user`);
        if (res.status === 200) {
          setUserId(res.data.user_id);
        } else {
          console.error("Error fetching user data:", res.data.error);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUser();
  }, [location]);

  // Function to send messages from Course to Chat
  const sendToChatTutor = (message, type) => {
    setChatMessages(prev => [...prev, {
      sender: 'user',
      text: message,
      type: type // 'hint' or 'fullAnswer'
    }]);
  };

  return (
    <MathJaxContext>
      <div className="grid grid-cols-2 gap-5 w-screen h-[85vh] p-5 text-white">
        {/* Course Section */}
        <div className="bg-gray-900 p-5 rounded-lg flex flex-col items-center overflow-hidden">
          <div className="w-full overflow-y-auto h-full">
            <Course 
              setResponse={setResponse} 
              setLatexPreview={setLatexPreview} 
              module={module} 
              userId={userId} 
              part={part}
              sendToChatTutor={sendToChatTutor}
            />
          </div>
        </div>
        
        {/* Chat Section */}
        <div className="bg-gray-900 p-5 rounded-lg flex flex-col overflow-hidden">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Learn with PiBot! <i className="fas fa-robot"></i>
          </h2>
          <div className="flex-1 h-[calc(100vh-200px)] overflow-y-auto">
            <Chat 
              response={response}
              latexPreview={latexPreview}
              messages={chatMessages}
              setMessages={setChatMessages}
            />
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}

export default Learn;

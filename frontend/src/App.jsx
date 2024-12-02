import './App.css';
import React, { useEffect, useState } from 'react';
import { useRoutes, Link, useNavigate } from 'react-router-dom';
import Learn from './pages/learn.jsx';
import Dashboard from './pages/dashboard.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import Module from './pages/module.jsx';
import logo from './assets/logo.png';
import Home from './pages/home.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import API_BASE_URL from './apiConfig'; // Import API base URL


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user`, { // Use API_BASE_URL
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const element = useRoutes([
    { 
      path: '/',
      element: <Home />
    },
    { 
      path: '/learn',
      element: <Learn />
    },
    {
      path: '/dashboard',
      element: <Dashboard />
    },
    {
      path: '/login',
      element: <Login onLogin={() => setIsLoggedIn(true)} />
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '/modules',
      element: <Module />
    }
  ]);

  return (
    <div className="App">
      <header className="App-header">
        <Link to="/">
          <img src={logo} alt="DiscreteTutor Logo" className="logo" />
        </Link>
        <div className="nav">
          <Link to="/learn">
            <button className="HeaderButton cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
              <i className="fas fa-book-open"></i> Learn
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="HeaderButton cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </button>
          </Link>
          <Link to="/modules">
            <button className="HeaderButton cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
              <i className="fas fa-th-list"></i> Modules
            </button>
          </Link>
          {!isLoggedIn ? (
            <>  
              <Link to="/login">
                <button className="HeaderButton cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                  <i className="fas fa-sign-in-alt"></i> Log in
                </button>
              </Link>
              <Link to="/register">
                <button className="HeaderButton cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                  <i className="fas fa-user-plus"></i> Register
                </button>
              </Link>
            </>
          ) : (
            <button className="HeaderButton cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Log out
            </button>
          )}
        </div>
      </header>
      {element}
    </div>
  );
}

export default App;

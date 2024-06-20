import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
const DarkModeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
  
    useEffect(() => {
      document.body.classList.toggle('dark-mode', isDarkMode);
    }, [isDarkMode]);
  
    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
    };
  
    return (
      <label className="dark-mode-switch">
        <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
        <span className="dark-mode-toggle">
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </span>
        <span className="toggle-label">
          {isDarkMode ? '' : ''}
        </span>
      </label>
    );
  };
  
export default DarkModeToggle;

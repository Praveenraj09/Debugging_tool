import React, { useState,useEffect } from 'react';
import { AppBar, Toolbar, FormControl, Select, MenuItem, IconButton, Menu, Button } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import DarkModeToggle from './darkmodetoggle';
import '../css/darkmode.css'
import image from '../img/ocient.png'
import { useNavigate } from 'react-router-dom';
import { color } from 'highcharts';

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportOptions,setReportOptions] = useState(['Report'])
  useEffect(() => {
    axios.get('/report')
      .then(response => {
        setReportOptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching report options:', error);
      });
  }, []);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleDropdownChange(event) {
    const selectedValue = event.target.value;
    navigate(`/report/${selectedValue}`);    
  }
  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };
  
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <img variant="h6" src={image} alt="Ocient Logo" width="100" height="20" />
        <Button variant="h6" color="inherit" href="/dashboard" sx={{ marginLeft: '10px' }}>Dashboard</Button>
        <Button variant="h6" color="inherit" href="/filters" sx={{ marginLeft: '10px' }}>Debug</Button>
        { <Button variant="h6" color="inherit" href="/tables" sx={{ marginLeft: '10px' }}>Tables</Button>
       /*<Button variant="h6" color="inherit" href="/charts" sx={{ marginLeft: '10px' }}>Charts</Button>
        <Button variant="h6" color="inherit" href="/mapview" sx={{ marginLeft: '10px' }} >MapView</Button> 
        <FormControl variant="outlined">
          <Select
            value=""
            onChange={handleDropdownChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Select' }}
          >
            <MenuItem value="" disabled>
            <Button variant="h6" color="inherit" sx={{ marginLeft: '10px' }} style={{color:'white'}}>Analytical Reports</Button>
            </MenuItem>
            {reportOptions.map((option, index) => (
              <MenuItem key={index} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>*/}
        <div style={{ marginLeft: 'auto' }}>
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          > 
            <AccountCircle style={{marginRight:'30px'}}/>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
          {/* <DarkModeToggle /> */}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

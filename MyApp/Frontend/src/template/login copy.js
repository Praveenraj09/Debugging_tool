import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import logo from '../img/ocient.png';
import { Grid, TextField, Button } from '@mui/material'; // Import Material-UI components
import { centerImage } from 'highcharts';

function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;
    try {
      const response = await axios.post('/login', `username=${username}&password=${password}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (response.data.redirect) {
        navigate(response.data.redirect); // Use navigate instead of history.push
      } else {
        setError(response.data.error || 'Unknown error');
      }
    } catch (error) {
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <><ThemeProvider theme={defaultTheme}>
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://ocient.com/wp-content/themes/ocient/screenshot.png)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            
            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  </ThemeProvider>

    <Grid container justifyContent="center" className="mt-5" >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <div className="topnav1">
          <a className="sidebar-brand align-items-center justify-content-center" href="/">
          <div style={{ backgroundColor: 'black', display: 'inline-block', alignSelf:centerImage }}>
  <img
    src={logo}
    alt="Ocient Logo"
    width="300"
    height="100"
  />
</div>
          </a>
        </div>
        <div className="card1">
          <div className="card1-header">Ocient Login</div>
          <div className="card1-body">
            <form onSubmit={handleSubmit}>
              <TextField
                id="username"
                name="username"
                label="Username"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                id="password"
                name="password"
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                required
              />
              <Button type="submit" variant="contained" color="primary">
                Login
              </Button>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
        </div>
      </Grid>
    </Grid>
    </>
  );
}

export default Login;

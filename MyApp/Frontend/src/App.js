import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import { Security, LoginCallback,SecureRoute } from '@okta/okta-react';
import { OktaAuth } from '@okta/okta-auth-js';
import oktaconfig from './template/security/oktaconfig';
import Login from './template/login';
import Dashboard from './template/dashboard';
import Debug from './template/filters';
import Tables from './template/Tables';
import ChartAnalysis from './template/charts';
import MapView from './template/Mapview';
import Report from './template/Report/Report';
import RequiredAuth from './template/security/RequiredAuth';


const App = () => {

  const schemacount = 1; // define schemacount
  const counts = 1; // define counts
  const schemas = []; // define schemas
  const tables = []; // define tables
  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    window.location.replace(originalUri || '/dashboard');
  };


  useEffect(() => {
    document.title = "Ocient Debugging App";
  }, []);
  const oktaAuth = new OktaAuth({
    issuer: 'https://dev-92455550.okta.com/oauth2/default',
    clientId: '0oail40iheiq4XGDI5d7',
    redirectUri: window.location.origin + '/callback',
    pkce: true
  });
  
    return (
      <div className="App">
        <Router>
          <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
            <Routes>
              <Route path='/callback' element={<LoginCallback />} />
              <Route path="/" element={<RequiredAuth />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard schemacount={schemacount} counts={counts} schemas={schemas} tables={tables} />} />
                <Route path="/filters" element={<Debug />} />
                <Route path="/tables" element={<Tables />} />
                <Route path="/charts" element={<ChartAnalysis />} />
                <Route path="/mapview" element={<MapView />} />
                <Route path="/report/:reportName" element={<Report />} />
              </Route>
              <Route path="/login" element={<Login />} />
            </Routes>
          </Security>
        </Router>
      </div>
    );
  };
  
  export default App;
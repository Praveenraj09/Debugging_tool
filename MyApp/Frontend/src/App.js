import React,{useEffect} from 'react'; 
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './template/login';
import Dashboard from './template/dashboard';
import Debug from './template/filters';
import Tables from './template/Tables';
import ChartAnalysis from './template/charts'
import MapView from './template/Mapview';
import ReportDropdown from './template/Report/ReportDropDown';
import Navbar from './template/Navbar';
import Report from './template/Report/Report';
function App() {
   const schemacount = /* define schemacount */1;
  const counts = /* define counts */1;
  const schemas = /* define schemas */[];
  const tables = /* define tables */[];
  useEffect(() => {
    document.title ="Ocient Debugging App";
    
  }, []);
  return (
    <div className="App"><script src="http://localhost:8097"></script>
   <Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={<Dashboard schemacount={schemacount} counts={counts} schemas={schemas} tables={tables} />}
    />
    <Route
      path="/filters"
      element={<Debug />}
    />
    <Route
      path="/tables"
      element={<Tables />}
    /> 
    <Route
    path="/charts"
    element={<ChartAnalysis />}
  />
  <Route
    path="/mapview"
    element={<MapView />}
  />
  <Route
    path="/report/:reportName"
    element={<Report />}
  />
  </Routes>
</Router>
</div>
  );
}

export default App;

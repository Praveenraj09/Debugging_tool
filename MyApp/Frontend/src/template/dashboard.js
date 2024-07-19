import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Typography, Card, CardContent, CircularProgress, List, ListItem, ListItemText, CardHeader } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import illustration from '../img/undraw_posting_photo.svg';
import '../css/dashboard.css'
import { DataGrid } from '@mui/x-data-grid';
function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [schemacount, setSchemacount] = useState('');
  const [counts, setCounts] = useState('');
  const [schemas, setSchemas] = useState([]);
  const [tables, setTables] = useState([]);
  const [tablerows, setTablerows] = useState([]);
  const [tablecolumns, setTablecolumns] = useState([]);
  
  useEffect(() => {
   
    fetchData();
    fetchTableInfo();
  }, []);
  const fetchData = async()=>{
    const response = await axios.get('/api/dashboard');
    const data = response.data;
    setSchemacount(data.schemacount);
    setCounts(data.counts);
    setSchemas(data.schemas);
    setTables(data.tables);
    setLoading(false);
  }
  const fetchTableInfo = async () => {
    try {
      const response = await axios.get('/api/fetch_TableInfo');
      console.log(response.data.columnName)
      const data = response.data.data;
      const columns = response.data.columnName;
      console.log(data)

      // Transform columns data to fit DataGrid columns format
      const columnsData = columns.map((col) => ({
        field: col,
        headerName: col.replace('_', ' ').toUpperCase(),
        width: 250, 
      }));

      setTablecolumns(columnsData);

      // Add unique id to each row for DataGrid
      const updatedRows = data.map((table, index) => ({
        id: index + 1,
        ...table,
      }));

      setTablerows(updatedRows);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
    axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }
  return (
    <div className="container-fluid mt-5">
    <Navbar/>
    <div className="container-fluid" style={{ paddingLeft: 0, paddingRight: 0 }}> <b>{/* Use inline styles to remove padding */}
        <Typography variant="h5" gutterBottom style={{ width: '100%',marginLeft:'20px'}}>Dashboard</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
             <Card className="card" style={{ paddingTop: '20px' }}>
              <CardContent>
              <Typography variant="h6" className="card-header">Total Number of Schema</Typography>
                <Typography variant="h6" style={{ paddingTop: '10px' }}>{loading ? <CircularProgress size={20} /> : schemacount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
             <Card className="card" style={{ paddingTop: '20px' }}>
              <CardContent>
              <Typography variant="h6" className="card-header">Total Number of Tables</Typography>
                <Typography variant="h6" style={{ paddingTop: '10px' }}>{loading ? <CircularProgress size={20} /> : counts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
             <Card className="card" style={{ paddingTop: '20px' }}>
              <CardContent>
              <Typography variant="h6" className="card-header">Tasks</Typography>
                <Typography variant="h6" style={{ paddingTop: '10px' }}>50%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
             <Card className="card" style={{ paddingTop: '20px' }}>
              <CardContent>
              <Typography variant="h6" className="card-header">Pending Requests</Typography>
                <Typography variant="h6" style={{ paddingTop: '10px' }}>18</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={3} style={{ paddingTop: '20px' }}>
          <Grid item xs={12} md={8}>
             <Card className="card" style={{ paddingTop: '20px' }}>
              <CardContent>
                <Typography variant="h6" className="card-header">About Company</Typography>
                <Typography variant="h6" style={{ paddingTop: '10px' }}>Overview</Typography>
                <Typography variant="body1" paragraph>
                  Founded in 2016, Ocient delivers hyperscale data solutions for modern enterprises that derive value from analyzing trillions of data records in interactive time. Ocient’s team of industry veterans has built enterprise database solutions for the world’s largest companies with the world’s largest and most complex datasets.
                </Typography>
                <Typography variant="h6" style={{ paddingTop: '10px' }}>Our Vision</Typography>
                <Typography variant="body1" paragraph>
                  A world in which people and enterprises realize significant value analyzing the data around them, without limits on performance, scale or cost efficiency.
                </Typography>
                <Typography variant="h6" style={{ paddingTop: '10px' }}>Our Mission</Typography>
                <Typography variant="body1">
                  To create, advance, sell and support the leading high performance data platform the world uses to analyze its hyperscale data sets.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
          
             <Card className="card" style={{ paddingTop: '20px' }}>
            
              <CardContent>
              <Typography variant="h6" className="card-header">Requests Information</Typography>
             
      {loading ? <CircularProgress size={20} /> : (
           <DataGrid
           rows={tablerows}
           columns={tablecolumns}
           initialState={{
             pagination: {
               paginationModel: { page: 0, pageSize: 4 },
             },
           }}

        pageSizeOptions={[4]}
        pagination
         />
      )}
              </CardContent>

            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={3} style={{ paddingTop: '20px' }}>
          <Grid item xs={12} md={3}>
             <Card className="card" style={{ paddingTop: '20px' }}>
              <CardContent>
              <Typography variant="h6" className="card-header">Schema Name</Typography>
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {loading ? <CircularProgress size={20} /> : (
        <table>
          <tbody>
            {schemas.map((schema, index) => (
              <tr key={index}>
                <td><Typography key={index} variant="body1" paragraph >{schema.schemaname}</Typography></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
          <Card className="card" style={{ paddingTop: '20px' }}>
  <CardContent>
    <Typography variant="h6" className="card-header">Tables Name</Typography>
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {loading ? <CircularProgress size={20} /> : (
        <table>
          <tbody>
            {tables.map((table, index) => (
              <tr key={index}>
                <td><Typography key={index} variant="body1" paragraph >{table.tablename}</Typography></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </CardContent>
</Card>

          </Grid>
          <Grid item xs={12} md={6}>
             <Card className="card" style={{ paddingTop: '20px' }}>
              <CardContent>
              <Typography variant="h6" className="card-header">Illustrations</Typography>
                <div>
                  <img src={illustration} alt="Illustration" style={{ maxWidth: '100%', height: 'auto',marginTop:'20px' }} />
                </div>
                <Typography variant="body2" paragraph>Ocient paragraph</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid></b>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;

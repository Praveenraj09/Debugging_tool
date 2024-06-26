import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { DataGrid } from '@mui/x-data-grid';
import { Grid, Typography, CircularProgress, FormControl, InputLabel,TextField, Select, MenuItem, Button } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
function Tables() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable,setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [columns,setColumns] = useState([]);
  const [results,setResults] = useState([]);
  const [filterSelect, setFilterSelect] = useState(500);
  useEffect(() => {
    async function fetchData() {
      const response = await axios.get('/tables');
      const data = response.data;
      const tableNames = response.data.map(item => item.table_name);
      console.log(tableNames)
      setTables(tableNames);
      setLoading(false);
      
      }
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    const response = await axios.post('/tables', {  filterTable: selectedTable, filterSelect  });
    
    setColumns(response.data.columns);
    const updatedRows = response.data.result.map((table, index) => ({
      ...table,
      id: index + 1,
    }));
console.log(updatedRows)
    setResults(updatedRows);
    setLoading(false);
  }
  const escapeOperandAttributeSelector = (operand) => {
    if (typeof operand !== 'string') {
      return operand;
    }
    return operand.replace(/["\\]/g, '\\$&');
  };
  const escapedColumns = columns.map((column) => ({

    field:  String(escapeOperandAttributeSelector(column)),
    headerName: String(escapeOperandAttributeSelector(column)),
    sortable: true,
    width: 250,
  }));
  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };
  const handleFilterSelectChange = (event) => {
    setFilterSelect(event.target.value);
  };
  return (
    <div>
      <Navbar />
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Typography variant="h6" className="card-header">Add your filters here</Typography>
                <FormControl fullWidth style={{marginTop:'20px'}} required>
                  <InputLabel style={{marginTop:'-5px'}} htmlFor="filterTable">Select a Table Name:</InputLabel>
                  
                  <Select
                    id="filterTable"
                    value={selectedTable}
                    onChange={handleTableChange}
                    
                  >
                    { tables.map((table,index) => (
                      <MenuItem key={index} value={table}>
                        {table}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth style={{marginTop:'20px'}} required>
                  <InputLabel style={{marginTop:'-35px'}} htmlFor="filterSelect">Select a Limit:</InputLabel>
                  
                  <TextField
                    type="number"
                    id="filterSelect"
                    value={filterSelect}
                    onChange={handleFilterSelectChange}
                  />
                </FormControl>
                <FormControl fullWidth style={{marginTop:'20px'}} required>
                <Button variant="contained" style={{ marginTop: '20px', marginLeft: '20px' }} onClick={fetchData}>Fetch Data</Button>
                </FormControl>
              </div>
            </div>
            
          </div>
         
        </Grid>
        <Grid item xs={10}>
        
          <div style={{ height: 400, width: '100%' }}>
          <div style={{ height: 700, width: '100%' }}>
  {loading ? (
    <CircularProgress size={50} />
  ) : (
    <DataGrid rows={results} columns={escapedColumns} pagination pageSize={10} rowCount={results.length}/>
  )}
</div>


          </div>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
}

export default Tables;

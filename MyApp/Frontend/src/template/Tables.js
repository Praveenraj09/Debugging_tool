import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { DataGrid } from '@mui/x-data-grid';
import { Grid, Typography, CircularProgress, FormControl, InputLabel,TextField, Select, MenuItem, Button } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';

function Tables() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable,setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [columns,setColumns] = useState([]);
  const [results,setResults] = useState([]);
  const [filterSelect, setFilterSelect] = useState(500);
  useEffect(() => {
    async function fetchDatas() {
      const response = await axios.get('/api/tables');
      const data = response.data;
      const tableNames = response.data.map(item => item.table_name);
      console.log(tableNames)
      setTables(tableNames);
      setLoading(false);
      
      }
    fetchDatas();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    const payload = {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       filterTable: selectedTable, 
       filterSelect: filterSelect.toString()
    }
    const response = await axios.post('/api/tables', payload);
    
    setColumns(response.data.columns);
    const updatedRows = response.data.result;
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

    field:  String(escapeOperandAttributeSelector(column.column_name)),
    headerName: String(escapeOperandAttributeSelector(column.column_name)),
    sortable: true,
    width: 250,
  }));
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'Sample_data_'+selectedTable+'.xlsx');
  };
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
  <Button variant="contained" color="error" onClick={exportToExcel} startIcon={<DownloadForOfflineIcon />}>Download Sample Data</Button>
</div>
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

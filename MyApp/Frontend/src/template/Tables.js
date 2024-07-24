import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { DataGrid } from '@mui/x-data-grid';
import { Paper,IconButton, Modal, Box, Grid, Typography, CircularProgress, FormControl, InputLabel,TextField, Select, MenuItem, Button } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { Tooltip } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrettyPrintTooltip from './prettyprint'; // Assuming you have a PrettyPrintTooltip component
import VisibilityIcon from '@mui/icons-material/Visibility';
function Tables() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable,setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [columns,setColumns] = useState([]);
  const [results,setResults] = useState([]);
  const [filterSelect, setFilterSelect] = useState(500);
  const [modalOpen, setModalOpen] = useState(false);
const [modalData, setModalData] = useState('');
const [clipboardMessage, setClipboardMessage] = useState(false);

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
  const handleOpenModal = (data) => {
    setModalData(data);
    setModalOpen(true);
  };
  const handleCopy = (value) => {
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      // If parsing fails, fall back to displaying the raw string
      parsedValue = value;
    }
    
    const prettyPrintValue = Array.isArray(parsedValue)
      ? `[${parsedValue.map((item, index) => `\n  ${JSON.stringify(item, null, 2)}`).join(',')}\n]`
      : JSON.stringify(parsedValue, null, 2);
  
    navigator.clipboard.writeText(prettyPrintValue).then(() => {
      console.log('Copied to clipboard successfully!');
      // Show a message or perform any other action
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
    handleCopyToClipboard(prettyPrintValue);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const renderCell = (params) => (
    <Tooltip
      title={
        <Paper
          style={{
            padding: '10px',
            minwidth: '300px',
            minHeight: '100px',
            overflow: 'auto',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <PrettyPrintTooltip value={params.value} />
          </div>
          <CopyToClipboard text={params.value} onCopy={() => handleCopy(params.value)}>
            <IconButton size="small" style={{ position: 'absolute', top: '10px', right: '10px' }}>
              <ContentCopyIcon />
            </IconButton>
          </CopyToClipboard>
          <IconButton size="small" style={{ position: 'absolute', top: '10px', right: '40px' }} onClick={() => handleOpenModal(params.value)}>
            <VisibilityIcon />
          </IconButton>
        </Paper>
      }
      arrow
      interactive
      PopperProps={{
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['right'],
            },
          },
          {
            name: 'offset',
            options: {
              offset: [10, -10],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 8,
            },
          },
        ],
        style: {
          zIndex: 1300,
        },
      }}
      placement="left-start"
    >
      <span>
        {Array.isArray(params.value) ? params.value.join(', ') : params.value}
      </span>
    </Tooltip>
  );
  const handleCopyToClipboard = (text) => {
    setClipboardMessage(true);
    setTimeout(() => {
      setClipboardMessage(false);
    }, 3000);
  };
  
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
    renderCell
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
        <Modal
  open={modalOpen}
  onClose={handleCloseModal}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      overflow: 'auto',
      maxHeight: '80vh'
    }}
  >
    <Typography id="modal-title" variant="h6" component="h2">
      Data
    </Typography>
    <Typography id="modal-description" sx={{ mt: 2 }}>
      <PrettyPrintTooltip value={modalData} />
    </Typography>
    <CopyToClipboard text={modalData} onCopy={() => handleCopy(modalData)}>
      <IconButton size="small" style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <ContentCopyIcon />
      </IconButton>
    </CopyToClipboard>
  </Box>
</Modal>
{clipboardMessage && (
  <div style={{
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: 1500
  }}>
    Copied to clipboard!
  </div>
)}

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

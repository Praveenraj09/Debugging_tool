import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {  Dialog, DialogTitle, DialogContent, DialogActions, Container, Grid, Typography,IconButton, Paper,Popper,Table,TableHead,TableRow,TableCell,TableBody, CardContent, CircularProgress, List, ListItem, ListItemText, CardHeader ,FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, subDays } from 'date-fns';
import * as XLSX from 'xlsx';
function Filters() {
  const [conditions, setConditions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [value, setValue] = useState('');
 
  const [filterColumn, setFilterColumn] = useState('');
  const [columns, setColumns] = useState([]);
  const [xvalues, setXvalues] = useState([]);
  const [avalues, setAvalues] = useState([]);
  const [anames, setAnames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [tables, setTables] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [storedRows, setStoredRows] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const currentDateTime = new Date();
  const twoDaysAgo = subDays(new Date(), 2);

  const [xAxisMin, setXAxisMin] = useState(null);
  const [xAxisMax, setXAxisMax] = useState(null);
  const [showFilterDropDown, setShowFilterDropDown] = useState(false);
  const [showFilterSelected, setShowFilterSelectted] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [showcountPreview,setShowcountPreview] = useState(false);
  const [runCountResult, setRunCountResult] = useState('Fetching...');
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const toggleFilterDropDownDropdown = () => {
    setShowFilterDropDown(!showFilterDropDown);
  };

  const toggleFilterSelecttedDropdown = () => {
    setShowFilterSelectted(!showFilterSelected);
  };

  const toggleshowDataPreviewDropdown = () => {
    setShowDataPreview(!showDataPreview);
  };
  const toggleCountDropdown = () => {
    setShowcountPreview(!showcountPreview);
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tables);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'table_data.xlsx');
  };
  useEffect(() => {
    setRunCountResult('Fetching....'); 
    async function filtersColumn() {
        const response = await axios.get('/columns');
        const data = response.data;
        setColumns(data.columns);
    }

    async function fetchFilters() {
        const response = await axios.get('/filters');
        const data = response.data;
        setLoading(false);
        setXvalues(data.x_values);
        setAvalues(data.a_values);
        setAnames(data.a_names);
    }
   
    async function fetchData() {
      // Construct the conditionString based on selected conditions
      const conditionString = conditions.map(condition => `${condition.field} ${condition.operator} '${condition.value}'`).join(' AND ');
  
      // Send AJAX request to fetch data
      const response = await axios.post('/fetch_data', {
          conditions: conditionString,
          selectedRows: selectedRows,
          page: currentPage,
          itemsPerPage: itemsPerPage,
      });
  
      setStoredRows(response.data.map((table, index) => ({
          ...table,
          id: index + 1,
      })));
      setLoading2(false);
      setSelectedRows(response.data.slice(0, itemsPerPage));
      console.log('currentPage'+currentPage)
      console.log('itemsPerPage'+itemsPerPage)
      console.log('startIdx '+(currentPage - 1) * itemsPerPage)
      console.log('endIdx '+currentPage * itemsPerPage)
      // Calculate displayed rows after data is fetched
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = currentPage * itemsPerPage;
      const displayedRows = response.data.slice(startIdx, endIdx);
      setSelectedRows(displayedRows);
  }
  
  
  async function fetchDataInOrder() {
      await filtersColumn();
      await fetchFilters();
      await fetchRunCount(conditions,null,null);
      await fetchData();
  }
  
  fetchDataInOrder();
  }, []);

  const fetchRunCount = async (conditions,xAxisMin,xAxisMax) => {
    setRunCountResult('Fetching....'); 
    try {
      let conditionString = ''
      if (conditions && conditions.length > 0)
        conditionString = conditions.map(condition => ` Str(${condition.field}) ${condition.operator} '${condition.value}'`).join(' AND ');
  
      const response = await fetch('/run_count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conditions: conditionString,
          minTime: xAxisMin,
          maxTime: xAxisMax,
        }),
      });
      const data = await response.json();
      console.log(data[0]);
      setRunCountResult('Results for selected criteria is: '+data[0]+' rows'); 
      setOpen(true);
    } catch (error) {
      console.log('Error fetching run count:', error);
    }
  };
  function convertToCustomFormat(formattedDate) {
    const months = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    console.log(formattedDate)
    if (!formattedDate){
      console.log("no date")
      return
    }
    const [month, day, year, time] = formattedDate.split(/[ ,]+/);
    const [hour, minute] = time.split(':');
    
    if (!month || !day || !year || !time || !hour || !minute) {
      throw new Error('Invalid formatted date string');
    }
  
    const formattedMonth = months[month];
    const formattedDay = day.padStart(2, '0');
    const formattedHour = hour.padStart(2, '0');
    const formattedMinute = minute.padStart(2, '0');
  
    return `${year}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinute}:00.000`;
  }
const formattedDates = xvalues.map((timestamp) => {
  const date = new Date(timestamp);
  const options = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    year: 'numeric',
    hour12: false,
    timeZone: 'GMT'
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
});
  const options = {
    chart: {
      type: 'area',
      zoomType: 'x',
    },
    title: {
      text: 'Time Chart',
    },
    xAxis: {
      categories: formattedDates,
      type: 'category',
      events: {
        afterSetExtremes: function(e) {
          setXAxisMin(e.min);
          setXAxisMax(e.max);
          const minIndex = Math.round(e.min);
      const maxIndex = Math.round(e.max);
      const maxXValue = convertToCustomFormat(formattedDates[minIndex]);
      const minXValue = convertToCustomFormat(formattedDates[maxIndex]);     
      setXAxisMin(minXValue);
      setXAxisMax(maxXValue);
      fetchData(minXValue,maxXValue);
      fetchRunCount(conditions,minXValue,maxXValue);
        }
      }
    },
    yAxis: {
      title: {
        text: 'Request ID',
      },
    },
    credits: {
      enabled: false
  },
    tooltip: {
      headerFormat: 'time: <b>{point.x}</b><br>',
      pointFormat: '{series.name}: <b>{point.y}</b><br>',
    },
    plotOptions: {
      area: {
        series: {
          stacking: 'normal',
          boostThreshold: 5000,
          softThreshold: true,
        },
        lineColor: '#1146d8d2', // Blue line color
        marker: {
          radius: 2,
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1,
          },
        },
        threshold: null,
      },
    },
    series: [
      {
        name: anames,
        data: avalues,
      }
    ],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
            },
          },
        },
      ],
    },
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleFilterTableChange = async (e) => {
    setFilterColumn(e.target.value);
    const selectedColumnValues = storedRows.map((row) => row[e.target.value]);
    const uniqueValues = Array.from(new Set(selectedColumnValues))
    .filter(value => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          return value.trim() !== '';
        } else if (Array.isArray(value)) {
          return value.length > 0 && value.some(item => item !== null && item !== undefined && typeof item === 'string' && item.trim() !== '');
        }
        return true; // For non-string scalar types like int, long, etc.
      }
      return false;
    });
  
  setSuggestions(uniqueValues);
  

    console.log(uniqueValues);
    
};
const handleValueChange = (e) => {
  const typedText = e.target.value.trim().toLowerCase();

  let filteredSuggestions = suggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(typedText))
     
  setSuggestions(filteredSuggestions);
  setValue(e.target.value);
};

  const fetchData = async () => {
    setLoading2(true);
  
    // Construct the conditionString based on selected conditions
    const conditionString = conditions.map(condition => `CAST(${condition.field} AS VARCHAR) ${condition.operator} '${condition.value}'`).join(' AND ');
  
    // Send AJAX request to fetch data
    const response = await axios.post('/fetch_data', {
      conditions: conditionString,
      selectedRows: selectedRows,
      page: currentPage,
      itemsPerPage: itemsPerPage,
      minTime: xAxisMin,
      maxTime: xAxisMax,

    });
    setTables(response.data);
    setLoading2(false);
    // Save fetched data
    setStoredRows(response.data.map((table, index) => ({
      ...table,
      id: index + 1,
  })));
    // Calculate displayed rows after data is fetched
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = currentPage * itemsPerPage;
    const displayedRows = response.data.slice(startIdx, endIdx);
    setSelectedRows(displayedRows);
  };
  const addCondition = () => {

  if (filterColumn === '') {
    alert('Both Condition, and value are required');
    return;
  }
    if (!validateInput() || filterColumn === '') return;
    const newCondition = {
      field: filterColumn,
      operator: 'like',
      value: `%${value}%`,
    };
    const updatedConditon = [...conditions, newCondition];
    setConditions(updatedConditon);
    console.log(updatedConditon);
    if(xAxisMin==null){
      alert('StartDate is required');
      return;
    }
    if(xAxisMax==null){
      alert('EndDate is required');
      return;
    }
    fetchRunCount(updatedConditon,xAxisMin,xAxisMax);
  };
  const escapeOperandAttributeSelector = (operand) => {
    if (typeof operand !== 'string') {
      return operand;
    }
    return operand.replace(/["\\]/g, '\\$&');
  };

  const validateInput = () => {
    if (value.trim() === '') {
      alert('Value is required');
      return false;
    }
    return true;
  };

  const rows = tables.map((table, index) => ({
    ...table,
    id: (currentPage - 1) * itemsPerPage + index + 1,
  }));
  const escapedColumns = columns.map((column) => ({

    field:  String(escapeOperandAttributeSelector(column)),
    headerName: String(escapeOperandAttributeSelector(column)),
    sortable: true,
    width: 250,
  }));
  return (
    <div>
      
      <Navbar />
      <Grid container spacing={3}>
        <Grid item xs={2} sx={{ overflowY: 'auto', maxHeight: '100vh',marginTop:'25px' }} >
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
      
                <Typography variant="p" className="card-header" style={{marginTop:'15px'}}>Add your filters here<IconButton onClick={toggleFilterDropDownDropdown}>
          <ArrowDropDownIcon />
        </IconButton></Typography>
                {showFilterDropDown && (
                  <>
                <FormControl fullWidth style={{marginTop:'20px'}} required>
                  <InputLabel style={{marginTop:'-5px'}} htmlFor="filterColumn">Select a Column:</InputLabel>
                  <Select
                    id="filterColumn"
                    value={filterColumn}
                    onChange={handleFilterTableChange}
                    required
                  >
                    { columns.map((column) => (
                      <MenuItem key={column} value={column}>
                        {column}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
    id="value"
    label="Value"
    value={value}
    onChange={handleValueChange}
    fullWidth
    required
    style={{ marginTop: '10px' }}
    InputProps={{
        endAdornment: (
            <Popper
                open={!!suggestions.length}
                anchorEl={document.getElementById('suggesstiontable')}
                modifiers={{
                    flip: {
                        enabled: true,
                    },
                    offset: {
                        enabled: true,
                        offset: '0, 10', // adjust the offset as needed
                    },
                    preventOverflow: {
                        enabled: true,
                        boundariesElement: 'viewport',
                    },
                }}
            >
                
            </Popper>
        ),
    }}
/>
<FormControl fullWidth style={{marginTop:'20px'}} required>
<TextField
  label="Select Start Date"
  type="datetime-local"
  value={xAxisMin}
  onChange={(event) => {
    const datetime = event.target.value;
    setXAxisMin(datetime);
    fetchRunCount(null, datetime, xAxisMax);
  }}
  InputLabelProps={{
    shrink: true,
  }}
  required
/>

</FormControl>
<FormControl fullWidth style={{marginTop:'20px'}} required>
<TextField
  label="Select End Date"
  type="datetime-local"
  value={xAxisMax}
  onChange={(event) => {
    const datetime = event.target.value;
    setXAxisMax(datetime);
    fetchRunCount(null, xAxisMin, datetime);
  }}
  InputLabelProps={{
    shrink: true,
  }}
  required
/>

</FormControl>   

                <Button onClick={addCondition} variant="contained" style={{marginTop:'20px'}}>Add</Button>
                <Button onClick={fetchData} variant="contained"style={{marginTop:'20px',marginLeft:'20px'}}>Fetch Data</Button>
                
                </> )
}
              </div>

            </div> 
            
            <Typography variant="p" style={{marginTop:'25px'}} className="card-header">Filters Selected<IconButton onClick={toggleFilterSelecttedDropdown}>
          <ArrowDropDownIcon />
        </IconButton></Typography>
        {showFilterSelected && (
                  <>
            <div className="row" style={{ marginTop: '20px', minHeight: '200px',maxHeight: '200px', overflowY: 'auto' }}>
            
    <div id="scrollable-table" className="col-md-12" style={{ width: '100%' }}>
        
        <table className="table scrollable-table">
            <tbody>
                {conditions.length === 0 ? (
                    <tr style={{ marginTop: '20px' }}>
                        <td colSpan="12" style={{ marginTop: '200px' }}>No filters selected</td>
                    </tr>
                ) : (
                    conditions.map((condition, index) => (
                        <tr key={index}>
                            <td>{condition.field} : {condition.value.replace(/%/g, '')}</td>
                            <td>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
</div>
</>)}
          </div>
          <div>
          <Typography variant="p" style={{marginTop:'25px'}} className="card-header">Count of Records<IconButton onClick={toggleCountDropdown}>
          <ArrowDropDownIcon />
        </IconButton></Typography>
        {showcountPreview && (
          <>
            <h4>{runCountResult}</h4>
          </>
        )}
          </div>
          <div>
          <Typography variant="p" style={{marginTop:'25px'}} className="card-header">Data Preview <IconButton onClick={toggleshowDataPreviewDropdown}>
          <ArrowDropDownIcon />
        </IconButton></Typography>        </div>
        {showDataPreview && (
                  <>
          <div className="row" style={{ marginTop: '20px', minHeight: '200px',maxHeight: '300px', overflowX: 'auto' }}>
         
    <div id="scrollable-table" className="col-md-12" style={{ width: '100%' }}>
        
        <table className="suggesstiontable scrollable-table">
            <tbody>
            {suggestions.map((suggestion, index) => (
                            <tr><td key={index} button onClick={() => setValue(suggestion)}>
                                <ListItemText variant="p" primary={suggestion} />
                            </td></tr>
                        ))}
                    </tbody>
            </table>
        </div>
        
        </div>
        </>)}
        </Grid>
        <Grid item xs={10}>
       
        {loading ? <CircularProgress size={50} />: null}
        <HighchartsReact highcharts={Highcharts} options={options}/>
        <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
  {/* Other buttons */}
  <div style={{ marginLeft: 'auto' }}>
    <Button variant="contained" color="error" onClick={exportToExcel}  startIcon={<DownloadForOfflineIcon />}/>
  </div>
</DialogActions>
        <div style={{ height: 400, width: '100%', overflowX: 'auto' }}>
       
  {loading2 ? <CircularProgress size={50} /> : null}
  <DataGrid
    rows={storedRows}
    columns={escapedColumns}
    pagination
    pageSize={itemsPerPage}
    rowCount={storedRows.length}
    onPageChange={(page) => handlePageChange(page)}
    paginationMode="client"
    sortingMode="client"
    components={{
      Toolbar: GridToolbar,
    }}
  />
  
</div>
          
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
}

export default Filters;

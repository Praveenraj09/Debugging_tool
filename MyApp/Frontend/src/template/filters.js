
import React, { useEffect, useState, useCallback, useMemo,useRef } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Container, Grid, Typography, IconButton, Paper, Popper, Table, TableHead, TableRow, TableCell, TableBody, CardContent, CircularProgress, List, ListItem, ListItemText, CardHeader, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MultiSelectDropdown from './MultiSelectDropDown';
import { format, subDays } from 'date-fns';
import * as XLSX from 'xlsx';
import { styled } from '@mui/material/styles';
import Histogram from 'highcharts/modules/histogram-bellcurve';
function Filters() {
  const [conditions, setConditions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [value, setValue] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [filterselectedColumn, setFilterSelectedColumn] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedcolumns, setSelectedcolumns] = useState([]);
  const [xvalues, setXvalues] = useState([]);
  const [avalues, setAvalues] = useState([]);
  const [anames, setAnames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [storedRows, setStoredRows] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [xAxisMin, setXAxisMin] = useState(null);
  const [xAxisMax, setXAxisMax] = useState(null);
  const [showFilterDropDown, setShowFilterDropDown] = useState(false);
  const [showFilterSelected, setShowFilterSelected] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [showColumnPreview, setShowColumnPreview] = useState(false);
  const [showcountPreview, setShowcountPreview] = useState(false);
  const [runCountResult, setRunCountResult] = useState('Fetching...');
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);
  const [initialColumnsLoaded, setInitialColumnsLoaded] = useState(false); // Track initial columns load
  const [disableButton,setDisableButton] = useState(false);
  const [chartselect,setChartselect] = useState('');
  Histogram(Highcharts);
  function formatDateToUS(dateObject) {
    return dateObject.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Include AM/PM
    });
  }
  const handleClose = () => {
    setOpen(false);
  };

  const toggleFilterDropDownDropdown = () => {
    setShowFilterDropDown(prevState => !prevState);
  };

  const toggleFilterSelecttedDropdown = () => {
    setShowFilterSelected(prevState => !prevState);
  };

  const toggleshowDataPreviewDropdown = () => {
    setShowDataPreview(prevState => !prevState);
  };
  const toggleshowColumnSelectDropdown = () => {
    setShowColumnPreview(prevState => !prevState);
  };
  
  const toggleCountDropdown = () => {
    setShowcountPreview(prevState => !prevState);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(storedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'table_data.xlsx');
  };

  const formattedConditions = useMemo(() => {
    return conditions.map(condition => `${condition.field} ${condition.operator} '${condition.value}'`).join(' AND ');
  }, [conditions]);

  const payload = () => {
    return {
      rowCount: 100,
      conditions: formattedConditions,
      columns: selectedValues,
      minTime: xAxisMin,
      maxTime: xAxisMax,
      currentPage,
      itemsPerPage
    };
  };
  const filtersColumn = async () => {
    setLoading(true);
    setLoading2(true);
    
    try {
      const response = await axios.get('/api/columns');
      setColumns(response.data);
    } catch (error) {
      console.error('Error fetching columns:', error);
      setLoading(false);
      setLoading2(false);
      isInitialMount.current = false;
    }finally{
      setLoading(false);
      setLoading2(false);
      
      isInitialMount.current = false;
    }
  };

  const fetchFilters = async (minTime = xAxisMin, maxTime = xAxisMax) => {
    setLoading(true);
    setRunCountResult('Fetching...');
    setFilterSelectedColumn('');
    setSuggestions([]);
    if (!minTime || !maxTime) {
      alert("Please provide start and end date.");
      setLoading(false);
      return;
    }
if (minTime >= maxTime) {
    alert("Start date must be earlier than end date.");
    setLoading(false);
    return;
  }
  if( selectedValues.length ===0){
    alert("Select atleast one row to display");
    setLoading(false);
    return;
  }
    setLoading(true);
    setDisableButton(true);
    try {
      const conditionString = conditions.map(condition => {

        return `(${condition.field} ${condition.operator} ${condition.value})`;

      }).join(' AND ');
      const fetchPayload = {
        conditions: conditionString,
        columns: selectedValues,
        page: currentPage,
        minTime,
        maxTime,
        itemsPerPage
      };
      const response = await axios.post('/api/filters',fetchPayload);
      const data = response.data;
      setXvalues(data.x_values);
      setAvalues(data.a_values);
      setAnames(data.a_names);
      
      fetchData(minTime, maxTime);
      
      fetchRunCount(conditions, minTime, maxTime);
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData =  async (xAxisMin,xAxisMax) => {
    setDisableButton(true);
    setLoading2(true);
    try {
      const conditionString = conditions.map(condition => {

        return `(${condition.field} ${condition.operator} ${condition.value})`;

      }).join(' AND ');
      //const conditionString = conditions.map(condition => `Str(${condition.field}) ${condition.operator} '${condition.value}'`).join(' AND ');
      const fetchPayload = {
        conditions: conditionString,
        columns: selectedValues,
        page: currentPage,
        minTime: xAxisMin,
        maxTime: xAxisMax,
        itemsPerPage
      };
      const response = await axios.post('/api/fetch_data', fetchPayload);
      const formattedData = response.data.datas;
      setStoredRows(formattedData);
      setSelectedcolumns(response.data.columns);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = currentPage * itemsPerPage;
      setSelectedRows(formattedData.slice(startIdx, endIdx));
      //fetchRunCount(conditions, xAxisMin, xAxisMax);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading2(false);
      setDisableButton(false);
    }
  };
  const renderConditionValue = (condition) => {
    return `${condition.field} ${condition.operator} ${condition.value}`;
  }


  const fetchRunCount =  async (conditions,xAxisMin,xAxisMax) => {
    setRunCountResult('Fetching...');
    try {
      let conditionString = '';
      if (conditions && conditions.length > 0) {
        conditionString = conditions.map(condition => {

          return `(${condition.field} ${condition.operator} ${condition.value})`;

        }).join(' AND ');
        //conditionString = conditions.map(condition => `Str(${condition.field}) ${condition.operator} '${condition.value}'`).join(' AND ');
      } 
      const payload = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        conditions: conditionString,
        minTime: xAxisMin,
        maxTime: xAxisMax
      };
      const response = await axios.post('/api/run_count', payload);
      setRunCountResult(`Results for selected criteria is: ${formatNumber(response.data[0]["counts"])} records`);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching run count:', error);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleFilterTableChange = (e) => {
    setFilterSelectedColumn(e.target.value);
    const selectedColumnValues = storedRows.map((row) => row[e.target.value]);
  
    const processValue = (value) => {
      if (typeof value === 'string') {
        // Remove curly braces, quotes, and square brackets
        value = value.replace(/[{}"\[\]]/g, '');
  
        // If it contains commas, split into individual values
        if (value.includes(',')) {
          return value.split(',').map(val => val.trim()).filter(val => val !== '');
        }
      }
      return value.trim() !== '' ? value : null;
    };
  
    const uniqueValues = Array.from(
      new Set(
        selectedColumnValues.flatMap(value => {
          const processed = processValue(value);
          return Array.isArray(processed) ? processed : [processed];
        })
      )
    ).filter(value => value !== null && value !== undefined);
  
    // Sort the unique values
    uniqueValues.sort();
  
    setSuggestions(uniqueValues);
  };

  const valueToNameMap = {
    1: 'last 1h',
    3: 'last 3h',
    6: 'last 6h',
    12: 'last 12h',
    24: 'last 1d',
  };
  const handleChartChange = (event) => {
    const selectedValue = event.target.value;
    setChartselect(selectedValue);
  
    const currentTime = new Date();
  
    // Initialize endTime to the current time
    const endTime = new Date(currentTime.getTime());
    const startTime = new Date(currentTime.getTime());
  
    // Adjust startTime based on selected range
    switch (selectedValue) {
      case 1:
        startTime.setUTCHours(startTime.getUTCHours() - 1);
        break;
      case 3:
        startTime.setUTCHours(startTime.getUTCHours() - 3);
        break;
      case 6:
        startTime.setUTCHours(startTime.getUTCHours() - 6);
        break;
      case 12:
        startTime.setUTCHours(startTime.getUTCHours() - 12);
        break;
      case 24:
        startTime.setUTCDate(startTime.getUTCDate() - 1);
        break;
      default:
        break;
    }
  
    // Format dates
    const formatDate = (dateObj) => {
      const year = dateObj.getUTCFullYear();
      const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getUTCDate().toString().padStart(2, '0');
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
  
    const startTimeFormatted = formatDateTime(formatDate(startTime));
    const endTimeFormatted = formatDateTime(formatDate(endTime));
    setXAxisMin(startTimeFormatted);
    setXAxisMax(endTimeFormatted);
    setTimeout(() => {
      fetchFilters(startTimeFormatted, endTimeFormatted);
    }, 1);
  };
  
  
  const handleValueChange = (e) => {
    const typedText = e.target.value.trim().toLowerCase();
    setValue(e.target.value);
  };
  const getColumnType = (columnName) => {
   

    const column = columns.find(col => col.column_name === columnName);
    return column ? column.data_type : null;
  };
  // const addCondition = () => {
  //   if (filterColumn === '' || !validateInput()) {
  //     alert('Both Condition and value are required');
  //     return;
  //   }
  //   const isInOperator = value.includes(',');

  // // Create new condition based on whether to use IN or LIKE operator
  // const newCondition = isInOperator 
  //   ? { field: filterColumn, operator: 'in', value: value.split(',').map(v => v.trim()) } 
  //   : { field: filterColumn, operator: 'like', value: `%${value}%` };

  //   //const newCondition = { field: filterColumn, operator: 'like', value: `%${value}%` };
  //   const updatedCondition = [...conditions, newCondition];
  //   setConditions(updatedCondition);
  //   setFilterColumn('');
  //   setValue('');
  //   fetchRunCount(updatedCondition,xAxisMin,xAxisMax)
  //   setSuggestions([]);
  // };


  const addCondition = () => {
    if (filterColumn === '' || !validateInput()) {
      alert('Both Condition and value are required');
      return;
    }
    const charVarcharTypes = ['char', 'varchar','ipv'];
    const tinyintTypes = ['tinyint', 'smallint'];
    const columnType = getColumnType(filterColumn).toLowerCase();
    const isCharVarcharType = charVarcharTypes.some(type => columnType.includes(type));
    const isTinySmallBigIntType = tinyintTypes.some(type => columnType.includes(type));

    //temperory fix starts
    const tempValues = filterColumn.split(".");
    const tempTableGDCColumn = [
      "deals_dealid",
      "geo_isosecondarysubdivision",
      "geo_countrycode_postalcode",
      "geo_countrycode_regioncode_city",
      "geo_city",
      "allowedcreativetypes",
      "geo_countrycode_regioncode",
      "traffictype",
      "device_type",
      "pageposition",
      "hasifa_internaluserid",
      "geo_countrycode_dmacode",
      "geo_countrycode",
      "geo_countrycode_isoprimarysubdivision",
      "nobidreason",
      "adstxtstatus",
      "appid_storename",
      "auctionresponse_dealid",
      "unifiedbannerdimensions",
      "auctiontype",
      "finaldecisionentitytype",
      "deals_auctiontype",
      "bidder_datacentername",
      "nobidreason",
      "language",
      "geo_countryname",
      "geo_regioncode",
      "geo_isoprimarysubdivision",
      "geo_fipsregioncode",
      "geo_regionname",
      "geo_postalcode",
      "geo_sourcetype",
      "os",
      "browser",
      "connectiontype",
      "carrier_name",
      "model",
      "internaluseridspecialindicator",
      "campaignfrequencies_granularitykey",
      "rawos",
      "rawbrowser",
      "sourceblockedattributeids",
      "video_startdelay",
      "video_videoplaybackmode",
      "video_videoquality",
      "video_skippability",
      "video_dimensionsmatchingstrategy",
      "video_videoplacementtype",
      "video_outstreamplacementtype",
      "audio_startdelay",
      "serversideadinsertionstatus",
      "appid_platform",
      "sitecontextualprofile_appplatform",
      "sitecontextualprofile_appstorename",
      "sitecontextualprofile_countrycode",
      "contextualdataset_providername",
      "auctionresponse_dealid",
      "traffictype",
      "device_type",
      "pageposition",
      "hasifa_internaluserid",
      "inventoryaccessplannobidreason",
      "trafficsource_content_language"
    ];
    const tempTableGDCArrayColumn = ["deals_dealid","allowedcreativetypes","unifiedbannerdimensions","deals_auctiontype","campaignfrequencies_granularitykey","sourceblockedattributeids","contextualdataset_providername"];

    const isTempColumnPresent = tempTableGDCColumn.includes(tempValues[1]);

    const isArrayColumn = columnType.includes('[]') || tempTableGDCArrayColumn.includes(tempValues[1]);

   
    //temperory fix ends
    const isInOperator = value.includes(',');
    let newCondition;
    const values = value.split(',').map(v => v.trim());
    if (value.toLowerCase().includes('null')) {
      newCondition = { field: filterColumn, operator: 'is', value: value };
    }
    else if (isInOperator) {// multi value
      if (!isArrayColumn) {  //non array type for multi value

        //temperory fix 
         if(isTempColumnPresent){
          newCondition = { field: filterColumn, operator: 'in', value: `(${values.map(v => `'${v}'`).join(', ')})` };
         }
        //temperory fix 
        else if (isCharVarcharType) {
          // Non-array type and varchar/char
          newCondition = { field: filterColumn, operator: 'in', value: `(${values.map(v => `'${v}'`).join(', ')})` };
        }
        else if (isTinySmallBigIntType) {
          // Non-array type and bigint/tinyint/smallint
          newCondition = { field: `${filterColumn}`, operator: 'in', value: `(${values.map(v => `${v}`).join(', ')})` };
        } else {
          // Non-array type and not varchar/char
          newCondition = { field: filterColumn, operator: 'in', value: `(${values.join(', ')})` };
        }
      } else { // array type for multi value
        //temperory fix 
        if(isTempColumnPresent){
          newCondition = { field: filterColumn, operator: '&&', value: `ARRAY[${values.map(v => `'${v}'`).join(', ')}]` };
         }
        //temperory fix 
        else if (isCharVarcharType) {
          // Array type and varchar/char
          newCondition = { field: filterColumn, operator: '&&', value: `ARRAY[${values.map(v => `'${v}'`).join(', ')}]` };
        } else if (isTinySmallBigIntType) {
          // array type and bigint/tinyint/smallint
          newCondition = { field: `${filterColumn}`, operator: '&&', value: `ARRAY[${values.map(v => `${v}`).join(', ')}]` };
        }
        else {
          // Array type and not varchar/char
          newCondition = { field: filterColumn, operator: '&&', value: `ARRAY[${values.join(', ')}]` };
        }
      }
    } else { // Single value
      if (!isArrayColumn) { //single value non arraytype
        //temperory fix 
        if(isTempColumnPresent){
          newCondition = { field: filterColumn, operator: '=', value: `'${value}'`  };
         }
        //temperory fix 
        else if (isCharVarcharType) {
          //normal varchar/char
          newCondition = { field: filterColumn, operator: '=', value: `'${value}'` };
        } else if (isTinySmallBigIntType) {
          //normal shortint/tinyint/bigint
          newCondition = { field: `${filterColumn}`, operator: '=', value: `${value}` };
        } else {
          //int,float,boolean etc
          newCondition = { field: filterColumn, operator: '=', value: value };
        }
      } else {  //single value arraytype scalar
         //temperory fix 
         if(isTempColumnPresent){
          newCondition = { field: filterColumn, operator: '@>', value: `'${value}'`  };
         }
        //temperory fix 
        else if (isCharVarcharType) {
          //normal varchar/char
          newCondition = { field: filterColumn, operator: '@>', value: `'${value}'` };
        } else if (isTinySmallBigIntType) {
          //normal shortint/tinyint/bigint
          newCondition = { field: `${filterColumn}`, operator: '@>', value: `'${value}'` };
        } else {
          newCondition = { field: filterColumn, operator: '@>', value: value };
        }
      }
    }
    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
    setFilterColumn('');
    setValue('');
    //fetchRunCount(updatedConditions, xAxisMin, xAxisMax);
    //setSuggestions([]);
  };

  const validateInput = () => {
    return filterColumn !== '' && value.trim() !== '';
  };

  const handleDelete = (index) => {
    const updatedCondition = [...conditions];
    updatedCondition.splice(index, 1);
    setConditions(updatedCondition);
  };

 
  function formatNumber(value) {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + 'Billion';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + 'Million';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    } else {
      return value.toString();
    }
  }

  const handleDeleteCondition = (index) => {
    const updatedCondition = [...conditions];
    updatedCondition.splice(index, 1);
    setConditions(updatedCondition);
  };

  const escapedColumns = selectedcolumns.map((column) => ({
    field: column.column_name,
    headerName: column.column_name,
    sortable: true,
    width: 250,
  }));

  const formatDateTime = (datetime) => {
    const [date, time] = datetime.split('T');
    // Ensure the time includes seconds set to 00
    const timeWithSeconds = `${time}:00`;
    return `${date} ${timeWithSeconds}`;
  };


  function convertToCustomFormat(formattedDate) {
    const months = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

    if (!formattedDate) {

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

    return `${year}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinute}:00`;
  }
  const formattedDates = xvalues.map((timestamp) => {
    const date = new Date(timestamp);
    const options = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      year: 'numeric',
      hour12: false
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  });

   const options = {
      chart: {
        type: 'histogram',
        zoomType: 'xy', // Enable zoom on the x-axis
        panning: true, // Enable panning
        panKey: 'shift' // Pan with the shift key
      },
      title: {
        text: 'Request vs Time\n Hits'+runCountResult,
      },
      xAxis: {
        categories: formattedDates,
        type: 'category',
        title: {
          text: 'Time',
        },
        minRange: 2,
        events: {
          afterSetExtremes: function (e) {
            // Capture drag and select time, not the chart's min & max points
            const minIndex = Math.floor(e.max);
            const maxIndex = Math.ceil(e.min);
            const maxXValue = convertToCustomFormat(formattedDates[minIndex]);
            const minXValue = convertToCustomFormat(formattedDates[maxIndex]);
            setXAxisMin(minXValue);
            setXAxisMax(maxXValue);
            if (!isInitialMount.current) {
              fetchData(minXValue, maxXValue);
              fetchRunCount(conditions, minXValue, maxXValue);
            }
          }
        }
      },
      yAxis: {
        title: {
          text: 'Record Count',
        },
      },
      rangeSelector: {
        buttons: [{
            type: 'hour',
            count: 1,
            text: '1h'
        }, {
            type: 'day',
            count: 1,
            text: '1D'
        }, {
            type: 'all',
            count: 1,
            text: 'All'
        }],
        selected: 1,
        inputEnabled: false,
        enabled:true
    },
      credits: {
        enabled: false
      },
      tooltip: {
        headerFormat: 'time: <b>{point.x}</b><br>',
        pointFormat: 'Count: <b>{point.y}</b><br>',
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointPlacement: 'left' // Align bars correctly with x-axis values
        },
        histogram: {
          binWidth: 0.1, // Adjust the bin width as needed
          boostThreshold: 1,
          softThreshold: true,
          lineColor: '#1146d8d2', // Blue line color
          marker: {
            radius: 1,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
          title: {
            text: 'Time',
          }
        },
      },
      series: [
        {
          name: "Count",
          data: avalues, // Ensure this data is appropriate for histogram
        }
      ],
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 0,
        y: 0,
        backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
      },
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
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      filtersColumn();
    }
  }, []);

  const handleOnChangeDropDown = (values) => {
    setSelectedValues(values);
  };

  const escapeOperandAttributeSelector = (operand) => {
    if (typeof operand !== 'string') {
      return operand;
    }
    return operand.replace(/["\\]/g, '\\$&');
  };

  const WhiteIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.common.white,
  }));


  return (
    <div>

      <Navbar />
      <Grid container >
        <Grid item xs={2} sx={{ overflowY: 'auto', maxHeight: '100vh', marginTop: '25px' }} >
          <div className="container-fluid">
            <div className="row">
            
              <div className="col-md-12">
              
                <Typography variant="p" className="card-header" style={{ marginTop: '15px' }}>Apply your Filters<WhiteIconButton onClick={toggleFilterDropDownDropdown}>
                  <ArrowDropDownIcon />
                </WhiteIconButton></Typography>
                {showFilterDropDown && (
                  <>
                  <div className="col-md-12">
                    <FormControl fullWidth style={{ marginTop: '20px' }} required>
                      <TextField
                        label="Select Start Date (UTC)"
                        type="datetime-local"
                        value={xAxisMin}
                        timezone="America/New_York"
                        onChange={(event) => {
                          const datetime = formatDateTime(event.target.value);
                          setXAxisMin(datetime);                         
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        required
                      />

                    </FormControl></div><div className="col-md-12">
                    <FormControl fullWidth style={{ marginTop: '20px' }} required>
                      <TextField
                        label="Select End Date (UTC)"
                        type="datetime-local"
                        value={xAxisMax}
                        timezone="America/New_York"
                        onChange={(event) => {
                          const datetime = formatDateTime(event.target.value);
                          setXAxisMax(datetime);
                          //fetchRunCount(conditions, xAxisMin, datetime);
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        required
                      />

                    </FormControl>
                    </div>
<div className="col-md-12">
                    <FormControl fullWidth style={{ marginTop: '20px' }} required>

                      <InputLabel style={{ marginTop: '-5px' }} htmlFor="filterColumn">Select a Column:</InputLabel>
                      <Select
                        id="filterColumn"
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                        required
                      >
                        {columns.map((column) => (
                          <MenuItem key={column.id} value={column.column_name} style={{ whiteSpace: 'normal', wordBreak: 'break-word', width: '300px' }}>
                            {column.column_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl></div><div className="col-md-12">
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
                    /></div>
                    <div className="col-md-12" style={{ display: 'flex', marginTop: '20px' }}>
  <div style={{ flex: 1, paddingRight: '10px' }}>
    <Button onClick={addCondition} variant="contained" fullWidth>Add</Button>
  </div>
  <div style={{ flex: 1, paddingLeft: '10px' }}>
    <Button onClick={fetchFilters} variant="contained" fullWidth disabled={disableButton}>Run</Button>
  </div>
</div>

                  </>)
                }
              </div>

            </div>

            <Typography variant="p" style={{ marginTop: '25px' }} className="card-header">Active Filters<WhiteIconButton onClick={toggleFilterSelecttedDropdown}>
              <ArrowDropDownIcon />
            </WhiteIconButton></Typography>
            {showFilterSelected && (
              <>
                <div className="row" style={{ marginTop: '20px', minHeight: '200px', maxHeight: '200px', overflowY: 'auto' }}>

                  <div id="scrollable-table" className="col-md-12" style={{ width: '100%' }}>

                    <table className="table scrollable-table">
                      <tbody>
                        {conditions.length === 0 ? (
                          <tr style={{ marginTop: '20px' }}>
                            <td colSpan="12" style={{ marginTop: '200px' }}>No Active Filters</td>
                          </tr>
                        ) : (
                          conditions.map((condition, index) => (
                            <tr key={index}>
                              <td>{condition.field} {condition.operator} {condition.value}</td>
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
          
          <Typography variant="p" style={{ marginTop: '25px' }} className="card-header">Choose Column to display<WhiteIconButton onClick={toggleshowColumnSelectDropdown} >
              <ArrowDropDownIcon />
            </WhiteIconButton></Typography>
            <div className="row" style={{ marginTop: '15px', minHeight: '100px', maxHeight: '200px', overflowX: 'auto' }}>
            
              <FormControl fullWidth style={{ marginTop: '20px' }} required>
              <MultiSelectDropdown columns={columns} onChange={handleOnChangeDropDown} />
            </FormControl>
            
            
          </div>
          
            <Typography variant="p" style={{ marginTop: '1px' }} className="card-header">Distinct Values Check<WhiteIconButton onClick={toggleshowDataPreviewDropdown}>
              <ArrowDropDownIcon />
            </WhiteIconButton></Typography>   <div className="row" style={{ marginTop: '20px', minHeight: '400px', maxHeight: '500px', overflowX: 'auto' }}>    
          {showDataPreview && (
            <>
              <div >
              <FormControl fullWidth style={{ marginTop: '20px' }} required>

                      <InputLabel style={{ marginTop: '-5px' }} htmlFor="filterselectedColumn">Select a Column to check distinct value:</InputLabel>
                      <Select
                        id="filterselectedColumn"
                        value={filterselectedColumn}
                        onChange={handleFilterTableChange}

                        required
                      >{selectedcolumns.map((column) => (
                        <MenuItem key={column.id} value={column.column_name} style={{ whiteSpace: 'normal', wordBreak: 'break-word', width: '300px' }}>
                          {column.column_name}
                        </MenuItem>
                      ))}
                      </Select>
                </FormControl>
                </div><div>
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
            </div>
            </div>
        </Grid>
        <Grid item xs={10}>
        <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Other buttons */}
            <div style={{ marginLeft: 'auto' }}>
            <Select
              sx={{ width: 200, height: 30 }}
        value={chartselect}
        onChange={handleChartChange}
        disabled={disableButton}
        displayEmpty // Make sure the placeholder is displayed when no value is selected
        renderValue={(selected) => {
          if (selected === '') {
            return <em>Select chart time</em>; // Placeholder text
          }
          return valueToNameMap[selected];
        }}
      >
             <MenuItem  value={1}>last 1h</MenuItem>
             <MenuItem  value={3}>last 3h</MenuItem>
             <MenuItem  value={6}>last 6h</MenuItem>
             <MenuItem  value={12}>last 12h</MenuItem>
             <MenuItem  value={24}>last 1d</MenuItem>
             </Select>
            </div>
          </DialogActions>
          {loading ? <CircularProgress size={50} /> : null}
          {/* <HighchartsReact highcharts={Highcharts} options={options} /> */}
          <HighchartsReact
      highcharts={Highcharts}
      options={options}
    />
          <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Other buttons */}
            <div style={{ marginLeft: 'auto' }}>
              <Button variant="contained" color="error" onClick={exportToExcel} startIcon={<DownloadForOfflineIcon />} />
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

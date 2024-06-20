import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select,Button, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginLeft: '10px',
  minWidth: 120,
  color: theme.palette.primary.contrastText,
  '& .MuiInputLabel-root': {
    color: theme.palette.primary.contrastText,
  },
  '& .MuiSelect-select': {
    color: theme.palette.primary.contrastText,
    padding: '8px 16px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.contrastText,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.contrastText,
  }
}));

const ReportDropdown = ({ onSelect }) => {
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');

  useEffect(() => {
    axios.get('/report')
      .then(response => {
        setReports(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the reports!", error);
      });
  }, []);

  const handleReportChange = (event) => {
    const reportName = event.target.value;
    setSelectedReport(reportName);
    if (onSelect) {
      onSelect(reportName);
    }
  };

  return (
    <StyledFormControl variant="outlined">
    <Button id="report-select-label">Report</Button>
    <Select
      labelId="report-select-label"
      id="report-select"
      value={selectedReport}
      onChange={handleReportChange}
      label="Report"
    >
      {reports.map((report, index) => (
        <MenuItem key={index} value={report}>{report}</MenuItem>
      ))}
    </Select>
  </StyledFormControl>
  
  );
};

export default ReportDropdown;

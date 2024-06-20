import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, CircularProgress,RadioGroup, FormControlLabel, Radio } from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Navbar from './Navbar';
import Footer from './Footer';

function ChartAnalysis() {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [chartType, setChartType] = useState('line');
  const [linechartOptions, setLineChartOptions] = useState({});
  const [barchartOptions, setBarChartOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result , setResult] =  useState({});
  const [showChart, setShowChart] = useState(false);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/charts');
        const data = response.data.tablecolumn;
        setSelectedTable(data.tables[0]); // Assuming data.tables is an array of table names
        setSelectedColumn(data.columns[data.tables[0]][0]); // Assuming data.columns is an object mapping table names to column names arrays
        setLoading(false);
        console.log(data);
        setResult(data);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChangeTable = (event) => {
    setSelectedTable(event.target.value);
    setSelectedColumn('');
  };

  const handleChangeColumn = (event) => {
    setSelectedColumn(event.target.value);

    setShowChart(true);
  };const handleChangeChartType = (event) => {
    setChartType(event.target.value);
    console.log(event.target.value);
    if (result && result.values) {
      let linechartOptions;
      let barchartOptions;
      let areachartOptions;
      if (result.columnType === 'numeric') {
        linechartOptions = {
          chart: { type: event.target.value },
          title: { text: `${event.target.value === 'line' ? 'Line' : 'Bar'} Chart for ${selectedColumn}` },
          xAxis: { categories: result.labels },
          series: [{ name: selectedColumn, data: result.values.map(value => parseFloat(value)) }]
        };
      } else {
        const categoryCounts = {};
        result.values.forEach(value => {
          categoryCounts[value] = (categoryCounts[value] || 0) + 1;
        });
        const seriesData = Object.keys(categoryCounts).map(category => ({
          name: category,
          y: categoryCounts[category]
        }));
        linechartOptions = {
          chart: { type: 'line' },
          title: { text: `Line Graph for ${selectedColumn}` },
          xAxis: { categories: result.labels },
          tooltip: {
            headerFormat: '<b>{point.x}</b><br>',
            pointFormat: 'Value: {point.y}',
            shared: true,
            crosshairs: true,
            useHTML: true,
            style: {
              padding: 10,
            },
            positioner: function (labelWidth, labelHeight, point) {
              return {
                x: Math.max(
                  // display at least 20px from right edge of plot area
                  this.chart.plotWidth - labelWidth - 20,
                  // display at least 20px from left edge of plot area
                  Math.min(point.plotX + 10, this.chart.plotWidth - labelWidth - 20)
                ),
                y: 0,
              };
            },
          },
          series: [{ name: selectedColumn, data: seriesData }]
        };
        barchartOptions = {
          chart: { type: 'bar' },
          title: { text: `Bar Graph for ${selectedColumn}` },
          xAxis: { categories: result.labels },
          tooltip: {
            headerFormat: '<b>{point.x}</b><br>',
            pointFormat: 'Value: {point.y}',
            shared: true,
            crosshairs: true,
            useHTML: true,
            style: {
              padding: 10,
            },
            positioner: function (labelWidth, labelHeight, point) {
              return {
                x: Math.max(
                  // display at least 20px from right edge of plot area
                  this.chart.plotWidth - labelWidth - 20,
                  // display at least 20px from left edge of plot area
                  Math.min(point.plotX + 10, this.chart.plotWidth - labelWidth - 20)
                ),
                y: 0,
              };
            },
          },
          series: [{ name: selectedColumn, data: seriesData }]
        };
        
      }
      setLineChartOptions(linechartOptions);
      setBarChartOptions(barchartOptions);
    }
  };
  
  
  
  const handleGenerateChart = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/analyze', { table: selectedTable, column: selectedColumn });
      const data = response.data;

      // Prepare series data based on column type
      let seriesData;
      if (data.columnType === 'numeric') {
        seriesData = data.values.map(value => parseFloat(value));
      } else {
        const categoryCounts = {};
        data.values.forEach(value => {
          categoryCounts[value] = (categoryCounts[value] || 0) + 1;
        });
        seriesData = Object.keys(categoryCounts).map(category => ({
          name: category,
          y: categoryCounts[category]
        }));
      }

      // Create chart options based on selected chart type
      let linechartOptions;
      let barchartOptions;
        linechartOptions = {
          chart: { type: 'line' },
          title: { text: `Line Chart for ${selectedColumn}` },
          xAxis: { categories: data.labels },
          tooltip: {
            headerFormat: '<b>{point.x}</b><br>',
            pointFormat: 'Value: {point.y}',
            shared: true,
            crosshairs: true,
            useHTML: true,
            style: {
              padding: 10,
            },
            positioner: function (labelWidth, labelHeight, point) {
              return {
                x: Math.max(
                  // display at least 20px from right edge of plot area
                  this.chart.plotWidth - labelWidth - 20,
                  // display at least 20px from left edge of plot area
                  Math.min(point.plotX + 10, this.chart.plotWidth - labelWidth - 20)
                ),
                y: 0,
              };
            },
          },
          series: [{ name: selectedColumn, data: seriesData }]
        }
          barchartOptions = {
          chart: { type: 'bar' },
          title: { text: `Bar Graph for ${selectedColumn}` },
          xAxis: { categories: data.labels },
          tooltip: {
            formatter: function () {
              return `<b>${this.point.name}</b>: ${this.point.y}`;
            },
            shared: true,
            crosshairs: true,
            useHTML: true,
            style: {
              padding: 10,
            },
            positioner: function (labelWidth, labelHeight, point) {
              return {
                x: Math.max(
                  // display at least 20px from right edge of plot area
                  this.chart.plotWidth - labelWidth - 20,
                  // display at least 20px from left edge of plot area
                  Math.min(point.plotX + 10, this.chart.plotWidth - labelWidth - 20)
                ),
                y: 0,
              };
            },
          },
          series: [{ name: selectedColumn, data: seriesData }]
        };
        
      console.log(chartType)
      setLineChartOptions(linechartOptions);
      setBarChartOptions(barchartOptions);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-5">
    <Navbar/>
    <Grid container spacing={5}>
      <Grid item xs={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Chart Analysis</Typography>
            {error && <Typography color="error">{error}</Typography>}
            
                <FormControl style={{ paddingTop: '20px' }} fullWidth>
                  <InputLabel style={{ paddingTop: '20px' }} >Select Table</InputLabel>
                  <Select value={selectedTable} onChange={handleChangeTable}>
                    {result.tables && result.tables.map((table, index) => (
                      <MenuItem key={index} value={table}>{table}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl style={{ paddingTop: '20px' }} fullWidth>
                  <InputLabel style={{ paddingTop: '20px' }} >Select Column</InputLabel>
                  <Select value={selectedColumn} onChange={handleChangeColumn}>
                    {selectedTable && result.columns[selectedTable].map((column, index) => (
                      <MenuItem key={index} value={column}>{column}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl style={{ paddingTop: '20px' }} fullWidth>
                  <InputLabel style={{ paddingTop: '20px' }} >Select Chart Type</InputLabel>
                  <Select value={chartType} onChange={handleChangeChartType}>
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="bar">Bar Graph</MenuItem>
                  </Select>
                </FormControl>
                <FormControl style={{ paddingTop: '20px' }}>
                <Button variant="contained" onClick={handleGenerateChart}>Generate Chart</Button>
                </FormControl>

          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={9}>
  {loading ? (
  <CircularProgress />
) : <p/>}
  <>
    {chartType === 'line' && (
      <HighchartsReact key="line" type='line' highcharts={Highcharts} options={linechartOptions} />
    )}
    {chartType === 'bar' && (
      <HighchartsReact key="bar" type='bar' highcharts={Highcharts} options={barchartOptions} />
    )}
     
    </>


    </Grid>
    </Grid>
    <Footer />
    </div>
  );
}

export default ChartAnalysis;

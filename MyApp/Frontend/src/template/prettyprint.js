import React from 'react';
import { Paper } from '@mui/material';

const PrettyPrintTooltip = ({ value }) => {
  // Helper function to pretty-print JSON values
  console.log(value)
  const prettyPrint = (val) => {
    if (Array.isArray(val)) {
      return `[\n${val.map(item => `  ${prettyPrint(item)}`).join(',\n')}\n]`;
    } else if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val, null, 2)
      .replaceAll('\{\\\"', '{\n\t"')
      .replaceAll('\\\\n"', '\n\t')
      .replaceAll('\\\"','"')
      .replaceAll('\\\\\"','"')
      .replaceAll('\}','\n}')
      .replaceAll('\[\"','[\n"')
      .replaceAll('\]',']')
      .replaceAll(',\"',',\n\t"');// Replace escaped quotes with actual quotes
    } else {
      return JSON.stringify(val,null,2)
      .replaceAll('\\n"', '\n')
      .replaceAll('\{', '{\n')
      .replaceAll('\\\"','"')
      .replaceAll('\\\\\"','"')
      .replaceAll('\}','\n}')
      .replaceAll('\[\"','[\n"')
      .replaceAll('\]',']')
      .replaceAll(',\"',',\n\t"');
    }
  };

  // Parse the value if it's a JSON string
  let parsedValue;
  try {
    parsedValue = JSON.parse(value);
    console.log("prettyprint"+parsedValue)
  } catch (error) {
    // If parsing fails, fall back to displaying the raw string
    console.log("prettyprint error"+value)
    parsedValue = value;
  }

  // Pretty print the parsed value
  const prettyPrintValue = prettyPrint(parsedValue);
  console.log(value['rawrequest'])
  return (
    <Paper
      style={{
        padding: '10px',
        minWidth: '300px',  // Adjust width as needed
        minHeight: '100px',  // Minimum height for larger content
        overflow: 'auto',  // Allow scrolling if content overflows
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',  // Card-like shadow
        position: 'relative',
      }}
    >
      <pre style={{ paddingTop: '10px', whiteSpace: 'pre-wrap' }}>{prettyPrintValue}</pre>
    </Paper>
  );
};

export default PrettyPrintTooltip;

import React, { useState } from 'react';
import { Autocomplete, Checkbox, TextField } from '@mui/material';

const MultiSelectDropdown = ({ columns, onChange }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOnChange = (event, values) => {
    setSelectedOptions(values);
    onChange(values.map((option) => ({ column_name: option }))); // Use only the value
  };

  const options = columns.map((column) => column.column_name);

  return (
    <Autocomplete
      multiple
      id="multi-select-dropdown"
      options={options}
      value={selectedOptions} // Ensure Autocomplete remains controlled
      onChange={handleOnChange}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Select Columns needed"
          placeholder="Select multiple options"
        />
      )}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ whiteSpace: 'normal', wordBreak: 'break-word', width: '300px' }}>
          <Checkbox
            sx={{ marginRight: 2 }}
            checked={selected}
            
          />
          {option}
        </li>
      )}
      
    />
  );
};

export default MultiSelectDropdown;

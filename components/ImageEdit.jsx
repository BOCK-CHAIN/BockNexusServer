import React from 'react';
import { Box, Label, TextInput } from '@adminjs/design-system';

const ImageEdit = (props) => {
  const { property, onChange, record } = props;
  const value = record.params[property.path] || '';

  return (
    <Box>
      <Label>{property.label}</Label>
      <TextInput
        value={value}
        onChange={(e) => onChange(property.path, e.target.value)}
        placeholder="Enter image URL"
      />
    </Box>
  );
};

export default ImageEdit; 
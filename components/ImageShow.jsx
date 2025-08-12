import React from 'react';
import { Box, Image } from '@adminjs/design-system';

const ImageShow = (props) => {
  const { record } = props;
  const imageUrl = record.params.image_uri;

  if (!imageUrl) {
    return <span>No image</span>;
  }

  return (
    <Box>
      <Image src={imageUrl} alt="Product" style={{ maxWidth: '200px', maxHeight: '200px' }} />
    </Box>
  );
};

export default ImageShow; 
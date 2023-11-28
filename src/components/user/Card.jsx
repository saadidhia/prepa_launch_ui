import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const CustomCard = ({ content }) => {
  return (
    <Card variant="outlined" className="card">
      <CardContent>
        <Typography variant="h5" component="h2">
          {content.title}
        </Typography>
        <Typography variant="body2" component="p">
          {content.note}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CustomCard;

import React from 'react';
import { Grid, Link, Typography } from '@material-ui/core';

export const RoomNav = ({ roomId }) => {

  return (
    <Grid container item>
      <Grid item>
        <Link href='/'>Leave room</Link>
      </Grid>
      <Grid container item justifyContent="center">
        <Grid item>
          <Typography variant="h3">{roomId}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};
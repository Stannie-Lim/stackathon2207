import React from 'react';
import { Grid, Link, Typography } from '@material-ui/core';

export const RoomNav = ({ roomId, leaveRoom, history }) => {
  const onClick = () => {
    history.push('/');
    leaveRoom();
  };

  return (
    <Grid container item>
      <Grid item>
        <Typography onClick={onClick} style={{ cursor: 'pointer', color: 'dodgerBlue', }}>Leave room</Typography>
      </Grid>
      <Grid container item justifyContent="center">
        <Grid item>
          <Typography variant="h3">{roomId}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};
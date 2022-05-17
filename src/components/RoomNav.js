import React, { useState } from 'react';
import { Grid, Typography, Tooltip } from '@material-ui/core';

export const RoomNav = ({ roomId, leaveRoom, history }) => {
  const [isClicked, setIsClicked] = useState(false);

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
        <Grid item onMouseLeave={() => setTimeout(() => setIsClicked(false), 1000)}>
          <Tooltip title={isClicked ? "Copied!" : "Click to copy"}>
            <Typography
              variant="h3"
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                setIsClicked(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              {roomId}
            </Typography>
          </Tooltip>

        </Grid>
      </Grid>
    </Grid>
  );
};
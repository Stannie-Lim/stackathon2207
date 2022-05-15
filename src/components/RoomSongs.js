import React from 'react';
import { Grid, Card, Typography, Avatar } from '@material-ui/core';

export const RoomSongs = ({ users }) => {
  return (
    <Grid item xs={6}>
      {users.map(user => (
        <Card variant="outlined" key={user.id} style={{ padding: '0.5rem' }}>
          <Grid container alignItems="center">
            <Grid item>
              <Avatar src={user.imageUrl} />
            </Grid>
            <Grid item>
              <Typography>{user.name}</Typography>
            </Grid>
          </Grid>
        </Card>
      ))}
    </Grid>
  );
};
import React from 'react';
import { Grid, Card, Typography, Avatar } from '@material-ui/core';

export const RoomUsers = ({ users, user: me }) => {
  return (
    <Grid item xs={4} style={{ overflow: 'auto', maxHeight: '65vh', }}>
      {users.map(user => (
        <Card variant="outlined" key={user.spotifyId} style={{ padding: '0.5rem' }}>
          <Grid container alignItems="center">
            <Grid item>
              <Avatar src={user.imageUrl} />
            </Grid>
            <Grid item>
              <Typography style={{ fontWeight: user.spotifyId === me.id ? 'bold' : 400 }}>{user.name}</Typography>
            </Grid>
          </Grid>
        </Card>
      ))}
    </Grid>
  );
};
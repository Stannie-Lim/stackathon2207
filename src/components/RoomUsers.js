import React from 'react';
import { Grid, Card, Typography, Avatar } from '@material-ui/core';

export const RoomUsers = ({ users }) => {
  return (
    <Grid item xs={6} style={{ overflow: 'auto', maxHeight: '80vh', }}>
      {users.map(user => (
        <Card variant="outlined" key={user.id} style={{ padding: '0.5rem' }} key={user.id}>
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
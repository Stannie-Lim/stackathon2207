import React from 'react';

import { Avatar, CircularProgress, Grid, ListItem, Typography } from '@material-ui/core';

export const Songs = ({ loading, songs, offset, setOffset }) => {
  if (loading) return <CircularProgress />
  
  return (
    <Grid container item xs={6} style={{ maxHeight: '80vh', overflow: 'auto', }}>
      {songs.map(({ track }, index) => (
        <ListItem button key={track.id} onClick={() => {
          setOffset(index);

      }} style={{ border: index === offset ? '2px solid lightseagreen' : null }}>
          <Grid item xs={12}>
            <Avatar src={track?.album.images[0].url} />
            <Typography variant="h6">{track?.name}</Typography>
          </Grid>
        </ListItem>
      ))}
    </Grid>
  );
};
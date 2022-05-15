import React from 'react';

import { Avatar, CircularProgress, Grid, Typography } from '@material-ui/core';

export const Songs = ({ loading, songs, currentlyPlaying }) => {
  if (loading) return <CircularProgress />
  
  return (
    <Grid container item xs={6} style={{ maxHeight: '80vh', overflow: 'auto', }}>
      {songs.map(({ track }) => (
        <Grid item xs={12} key={track.id} style={{ border: track.uri === currentlyPlaying ? '2px solid lightseagreen' : null }}>
          <Avatar src={track?.album.images[0].url} />
          <Typography variant="h6">{track?.name}</Typography>
        </Grid>
      ))}
    </Grid>
  );
};
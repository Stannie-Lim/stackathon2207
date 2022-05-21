import React from 'react';

import { Avatar, CircularProgress, Grid, ListItem, Typography, Grow, Paper } from '@material-ui/core';

export const Songs = ({ loading, songs, offset, setOffset, onHover, onUnhover, hovers, user }) => {
  if (loading) return <CircularProgress />

  return (
    <Grid container item xs={4} style={{ maxHeight: '65vh', overflow: 'auto', }}>
      <Paper variant="outlined">
        {songs.map(({ track }, index) => (
          <ListItem onMouseEnter={() => onHover(index)} onMouseLeave={() => onUnhover(index)} button key={track.id} onClick={() => {
            setOffset(index);
        }} style={{ border: index === offset ? '2px solid lightseagreen' : null }}>
            <Grid container item>
              <Grid item xs={6}>
                <Avatar src={track?.album.images[0].url} />
                <Typography variant="h6">{track?.name}</Typography>
                <Typography variant="caption">{track?.artists[0]?.name}</Typography>
              </Grid>
              {hovers.get(index) !== undefined && hovers.get(index).spotifyId !== user.id && (
                <Grid item xs={6}>
                  <Grow
                    in={true}
                    style={{ transformOrigin: '0 0 0' }}
                    timeout={500}
                  >
                    <Avatar src={hovers.get(index)?.imageUrl} />
                  </Grow>
                </Grid>
              )}
            </Grid>
          </ListItem>
        ))}
      </Paper>
    </Grid>
  );
};
import React, { useContext, useEffect, useState } from 'react';

import { Avatar, Grid, Typography } from '@material-ui/core';

import { UserContext, RoomContext } from '../context';
import { AxiosHttpRequest } from '../helpers/axios';

export const Songs = () => {
  const user = useContext(UserContext);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const getPlaylists = async () => {
      const url = `https://api.spotify.com/v1/users/${user.id}/playlists`;
      const { data } = await AxiosHttpRequest('GET', url);
      const tracks = data.items.map(({ tracks }) => tracks);

      const songs = (await Promise.all(
        tracks.map(track => (
          AxiosHttpRequest('GET', track.href)
        ))
      )).map(({ data }) => data.items).flat();

      const idToSong = new Map();
      const removingDuplicates = new Set();

      for (const song of songs) {
        const { id } = song.track;
        idToSong.set(id, song);

        removingDuplicates.add(id);
      }

      const removed = [...removingDuplicates].map(id => idToSong.get(id));

      setSongs(removed);
    };

    getPlaylists();
  }, []);
  console.log(songs);
  return (
    <Grid container item xs={6} style={{ overflow: 'auto', maxHeight: '80vh' }}>
      {songs.map(({ track }) => (
        <Grid item xs={12}>
          <Avatar src={track?.album.images[0].url} />
          <Typography variant="h6">{track?.name}</Typography>
        </Grid>
      ))}
    </Grid>
  );
};
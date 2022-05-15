import React, { useContext, useEffect, useState } from 'react';
import io from "socket.io-client";
import SpotifyPlayer from 'react-spotify-web-playback';

import { Grid } from '@material-ui/core';

import { AxiosHttpRequest, getAccessToken } from '../helpers/axios';

import { UserContext, RoomContext } from '../context';

import { Songs } from './Songs';
import { RoomNav } from './RoomNav';
import { RoomUsers } from './RoomUsers';

export const Room = ({ match }) => {
  const { id: roomId } = match.params;
  const [roomData, setRoomData] = useState(null);
  const user = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    const getPlaylists = async () => {
      setLoading(true);
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
      setLoading(false);
    };

    getPlaylists();
  }, []);

  useEffect(() => {
    const socket = io('https://formarcibae.herokuapp.com', {
      transports: ["websocket"],
    });

    // TODO remove the id when i get another spotify account
    socket.emit('join_room', { user: { ...user, id: String(Math.floor(Math.random() * 9999) + 10000) }, roomcode: roomId });

    socket.on('join', (room) => {
      setUsers(room.users);
    });

    const getRoomData = async() => {
      const { data } = await AxiosHttpRequest('GET', `/api/room/${roomId}`);
      setRoomData(data);
    };

    getRoomData();

    return function() {
      socket.emit('disconnect_room', { userId: user.id, roomcode: roomId });
    };
  }, []);

  console.log(songs);

  return (
    <RoomContext.Provider value={roomData}>
      <Grid container spacing={3}>
        <RoomNav roomId={roomId} />
        <Grid container item justifyContent="space-between" spacing={5}>
          <RoomUsers users={users} />
          <Songs loading={loading} songs={songs} currentlyPlaying={currentlyPlaying} />
        </Grid>
        <Grid item xs={12}>
          <SpotifyPlayer
            token={getAccessToken()}
            autoPlay
            uris={songs.map(({ track }) => track.uri)}
          />
        </Grid>
      </Grid>
    </RoomContext.Provider>
  );
};
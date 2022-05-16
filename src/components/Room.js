import React, { useContext, useEffect, useState } from 'react';
import io from "socket.io-client";
import SpotifyPlayer from 'react-spotify-web-playback';

import { Grid } from '@material-ui/core';

import { AxiosHttpRequest, getAccessToken } from '../helpers/axios';

import { UserContext, RoomContext } from '../context';

import { Songs } from './Songs';
import { RoomNav } from './RoomNav';
import { RoomUsers } from './RoomUsers';

const removeDuplicates = (songs) => {
  const idToSong = new Map();
  const removingDuplicates = new Set();

  for (const song of songs) {
    const { uri } = song.track;
    idToSong.set(uri, song);

    removingDuplicates.add(uri);
  }

  const removed = [...removingDuplicates].map(uri => idToSong.get(uri));

  return removed;
};

export const Room = ({ match, history }) => {
  const { id: roomId } = match.params;
  const [roomData, setRoomData] = useState(null);
  const [socket, setSocket] = useState(null);

  const user = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);

  const leaveRoom = () => {
    socket.emit('disconnect_room', { userId: user.id, roomcode: roomId });
  };

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

      const removed = removeDuplicates(songs);

      // https://formarcibae.herokuapp.com
      const socket = io('http://localhost:3000', {
        transports: ["websocket"],
      });

      socket.emit('join_room', { 
        user,
        roomcode: roomId,
        songs,
      });

      socket.on('join', (room) => {
        setUsers(room.users);
        socket.emit('sync_songs', { roomId, songs });
      });

      socket.on('sync_songs', (roomSongs) => {
        setSongs(removeDuplicates([...songs, ...roomSongs]));
      });

      const getRoomData = async() => {
        const { data } = await AxiosHttpRequest('GET', `/api/room/${roomId}`);
        setRoomData(data);
      };

      getRoomData();
        
      setSongs(removed);
      setLoading(false);
      setSocket(socket);
    };

    getPlaylists();
  }, []);

  const changeTrack = (status) => {
    setCurrentStatus(status);
  };

  return (
    <RoomContext.Provider value={roomData}>
      <Grid container spacing={3}>
        <RoomNav roomId={roomId} leaveRoom={leaveRoom} history={history} />
        <Grid container item justifyContent="space-between" spacing={5}>
          <RoomUsers users={users} />
          <Songs loading={loading} songs={songs} currentlyPlaying={currentlyPlaying} />
        </Grid>
        <Grid item xs={12}>
          <SpotifyPlayer
            token={getAccessToken()}
            autoPlay
            uris={songs.map(({ track }) => track.uri)}
            callback={changeTrack}
          />
        </Grid>
      </Grid>
    </RoomContext.Provider>
  );
};
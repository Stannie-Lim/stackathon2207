import React, { useContext, useEffect, useState } from 'react';
import io from "socket.io-client";
import SpotifyPlayer from 'react-spotify-web-playback';

import { Grid, Typography } from '@material-ui/core';

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
  return removed.sort((a, b) => a.track.name.localeCompare(b.track.name));
};

export const Room = ({ match, history }) => {
  const { id: roomId } = match.params;
  const [roomData, setRoomData] = useState(null);

  const user = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [socketState, setSocketState] = useState(null);
  const [play, setPlay] = useState(true);

  const leaveRoom = () => {
    socketState.emit('disconnect_room', { userId: user.id, roomcode: roomId });
  };

  useEffect(() => {
    // https://formarcibae.herokuapp.com
    const socket = io('https://formarcibae.herokuapp.com', {
      transports: ["websocket"],
    });

    setSocketState(socket);
  }, []);
  console.log(songs.length);

  useEffect(() => {
    const getPlaylists = async () => {
      setLoading(true);
      const url = `https://api.spotify.com/v1/me/playlists`;
      const { data } = await AxiosHttpRequest('GET', url);
      const tracks = data.items.map(({ tracks }) => tracks);

      const songs = (await Promise.all(
        tracks.map(track => (
          AxiosHttpRequest('GET', track.href)
        ))
      )).map(({ data }) => data.items).flat();
      const removed = removeDuplicates(songs);
      socketState.emit('join_room', { 
        user,
        roomcode: roomId,
        songs,
      });

      socketState.on('join', (room) => {
        setUsers(room.users);
        socketState.emit('sync_songs', { roomId, songs });
      });

      socketState.on('sync_songs', (roomSongs) => {
        setSongs(removeDuplicates([...songs, ...roomSongs]));
      });

      socketState.on('change_song', (index) => {
        setOffset(index);
      });

      socketState.on('pauseunpause', (play) => {
        setPlay(play);
      });

      const getRoomData = async() => {
        const { data } = await AxiosHttpRequest('GET', `/api/room/${roomId}`);
        setRoomData(data);
      };

      getRoomData();
        
      setSongs(removed);
      setLoading(false);
    };

    if (socketState) getPlaylists();
  }, [socketState]);

  const changeTrack = (status) => {
    if (status.type === 'player_update') {
      socketState.emit('pauseunpause', ({ roomId, play: status.isPlaying }));
      return;
    }

    let index = 0;
    for (let i = 0; i < songs.length; i++) {
      if (songs[i].track.name === status.track.name) {
        index = i;
        break;
      };
    }

    socketState.emit('change_song', { roomId, index });
  };

  if (!socketState) {
    return <Typography>Socket failed to connect idk why very sorry</Typography>
  };

  return (
    <RoomContext.Provider value={roomData}>
      <Grid container spacing={3}>
        <RoomNav roomId={roomId} leaveRoom={leaveRoom} history={history} />
        <Grid container item justifyContent="space-between" spacing={5}>
          <RoomUsers users={users} />
          <Songs loading={loading} songs={songs} />
        </Grid>
        <Grid item xs={12}>
          <SpotifyPlayer
            offset={offset}
            token={getAccessToken()}
            play={play}
            uris={songs.map(({ track }) => track.uri)}
            callback={changeTrack}
          />
        </Grid>
      </Grid>
    </RoomContext.Provider>
  );
};
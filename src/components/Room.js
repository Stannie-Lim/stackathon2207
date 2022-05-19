import React, { useContext, useEffect, useState } from 'react';
import io from "socket.io-client";
import SpotifyPlayer from 'react-spotify-web-playback';

import { Grid, Typography } from '@material-ui/core';

import { AxiosHttpRequest, getAccessToken } from '../helpers/axios';

import { UserContext, RoomContext } from '../context';

import { Songs } from './Songs';
import { RoomNav } from './RoomNav';
import { RoomUsers } from './RoomUsers';
import { SpotifyWebPlayer } from './SpotifyWebPlayer';

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
  const [play, setPlay] = useState(false);
  const [position, setPosition] = useState(0);
  
  const leaveRoom = () => {
    socketState.emit('disconnect_room', { userId: user.id, roomcode: roomId });
  };

  useEffect(() => {
    const location = window.location.origin.replace('http', 'ws');
    const socket = io(location, {
      transports: ["websocket"],
    });
    
    const getPlaylists = async () => {
      setLoading(true);

      try {
        socket.emit('join_room', { roomcode: roomId, user });

        const removed = removeDuplicates(songs);

        const getRoomData = async() => {
          const { data } = await AxiosHttpRequest('GET', `/api/room/${roomId}`);
          setRoomData(data);
        };

        const setUpSocket = () => {
          socket.on('join', (room) => {
            setUsers(room.users);
            socket.emit('sync_songs', { roomId, userId: user.id });
          });

          socket.on('sync_songs', async (userId) => {
            const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
            const { data } = await AxiosHttpRequest('GET', url);
            const tracks = data.items.map(({ tracks }) => tracks);

            const currentSongs = (await Promise.all(
              tracks.map(track => (
                AxiosHttpRequest('GET', track.href)
              ))
            )).map(({ data }) => data.items).flat();

            setSongs(removeDuplicates([...songs, ...currentSongs]));
          });

          socket.on('change_song', (index) => {
            setOffset(index);
          });

          socket.on('pauseunpause', (play) => {
            setPlay(play);
          });

          getRoomData();
          setSongs(removed);
          setLoading(false);
          setSocketState(socket);
        };

        setUpSocket();
      } catch (error) {

      }
    };

    getPlaylists();
  }, []);

  useEffect(() => {
    if (socketState) {
      socketState.emit('pauseunpause', { roomId, play });
      socketState.emit('change_song', { roomId, index: offset });
      socketState.emit('change_position', { roomId, position });
    }
  }, [position, play, offset, position]);

  const togglePlay = () => {
    setPlay(!play);
  };

  return (
    <RoomContext.Provider value={roomData}>
      <Grid container spacing={3}>
        <RoomNav roomId={roomId} leaveRoom={leaveRoom} history={history} />
        <Grid container item justifyContent="space-between" spacing={5}>
          <RoomUsers users={users} />
          <Songs loading={loading} songs={songs} offset={offset} />
        </Grid>
        <Grid item xs={12}>
          <SpotifyWebPlayer songs={songs} offset={offset} isPlaying={play} isPlay={play} togglePlay={togglePlay} setOffset={setOffset} setPosition={setPosition} position={position} />
        </Grid>
      </Grid>
    </RoomContext.Provider>
  );
};
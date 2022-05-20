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
import { Chat } from './Chat';

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
  const [hovers, setHovers] = useState(new Map());
  const [roomHistory, setRoomHistory] = useState([]);
  
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
          socket.on('join', async ({ room, user }) => {
            setUsers(room.users);
            setRoomHistory([...roomHistory, { id: roomHistory.length, type: 'notification', message: `${user.name} has joined!`, time: new Date(), user }]);

            const songs = (await Promise.all(
              room.users.map(async user => {
                const userId = user.spotifyId;
                const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
                const { data } = await AxiosHttpRequest('GET', url);
                const tracks = data.items.map(({ tracks }) => tracks);
                const sortedByLength = tracks.sort((a, b) => a.total - b.total);
  
                const currentSongs = (await AxiosHttpRequest('GET', sortedByLength[sortedByLength.length - 1].href)).data.items.flat();
  
                return currentSongs;
              })
            )).flat();

            socket.emit('sync_songs', { roomId, songs });
          });

          socket.on('sync_songs', async (songs) => {
            setSongs(removeDuplicates(songs));
          });

          socket.on('change_song', (index) => {
            setOffset(index);
          });

          socket.on('pauseunpause', (play) => {
            setPlay(play);
          });

          socket.on('hover', ({ user, index }) => {
            const copy = new Map(hovers);
            copy.set(index, user);
            setHovers(copy);
          });

          socket.on('unhover', ({ user, index }) => {
            const copy = new Map(hovers);
            copy.delete(index, user);
            setHovers(copy);
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

    return leaveRoom;
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

  const onHover = (index) => {
    const found = users.find(({ spotifyId }) => spotifyId === user.id);
    socketState.emit('hover', { roomId, user: found, index });
  };

  const onUnhover = (index) => {
    const found = users.find(({ spotifyId }) => spotifyId === user.id);
    socketState.emit('unhover', { roomId, user: found, index });
  };

  const sendMessage = (message) => {
    const found = users.find(({ spotifyId }) => spotifyId === user.id);
    socketState.emit('message', { roomId, user: found, history: [...roomHistory, { id: roomHistory.length, type: 'message', message, time: new Date(), user: found }]});

    socketState.on('message', ({ history }) => {
      setRoomHistory(history);
    });
  };

  return (
    <RoomContext.Provider value={roomData}>
      <Grid container spacing={3}>
        <RoomNav roomId={roomId} leaveRoom={leaveRoom} history={history} />
        <Grid container item justifyContent="space-between" spacing={5}>
          <RoomUsers users={users} user={user} />
          <Songs user={user} loading={loading} songs={songs} offset={offset} setOffset={setOffset} onHover={onHover} onUnhover={onUnhover} hovers={hovers} />
          <Chat user={user} roomHistory={roomHistory} sendMessage={sendMessage} />
        </Grid>
        <Grid item xs={12}>
          <SpotifyWebPlayer songs={songs} offset={offset} isPlaying={play} isPlay={play} togglePlay={togglePlay} setOffset={setOffset} setPosition={setPosition} position={position} />
        </Grid>
      </Grid>
    </RoomContext.Provider>
  );
};
import React, { useContext, useEffect, useState } from 'react';
import io from "socket.io-client";
import { Grid, Link, Typography, Avatar, Card } from '@material-ui/core';

import { AxiosHttpRequest } from '../helpers/axios';

import { UserContext, RoomContext } from '../context';

import { Songs } from './Songs';
import { RoomNav } from './RoomNav';
import { RoomSongs } from './RoomSongs';

export const Room = ({ match }) => {
  const { id: roomId } = match.params;
  const [roomData, setRoomData] = useState(null);
  const user = useContext(UserContext);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3000', {
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

  return (
    <RoomContext.Provider value={roomData}>
      <Grid container spacing={3}>
        <RoomNav roomId={roomId} />
        <Grid container item justifyContent="space-between" spacing={5}>
          <RoomSongs users={users} />
          <Songs />
        </Grid>
      </Grid>
    </RoomContext.Provider>
  );
};
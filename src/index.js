import React, { useContext, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { HashRouter, Route, Switch, Redirect, Link } from 'react-router-dom';
import io from "socket.io-client";

import { Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField } from '@material-ui/core';

import { setAccessToken, AxiosHttpRequest } from './helpers/axios';

const UserContext = React.createContext();

const LoginButton = () => {
  return (
    <a href={`/api/auth`}>Login to Spotify</a>
  );
};

const Auth = ({ match }) => {
  useEffect(() => {
    const { access_token, refresh_token } = match.params;
    if (access_token && refresh_token) setAccessToken(access_token);
  }, []);

  return (
    <Redirect to='/' />
  );
};

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(null);

  const user = useContext(UserContext);

  const handleClose = () => setModalOpen(false);

  const onSubmit = () => {
    if (roomCode === '') return;

    // TODO check if room exists
    setIsInRoom({ id: roomCode });

    setRoomCode('');
    handleClose();
  };

  const createRoom = async () => {
    try {
      const { data } = await AxiosHttpRequest('POST', '/api/room', user);
      setIsInRoom(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!!isInRoom) {
    return <Redirect to={`/room/${isInRoom.id}`} />;
  }

  return (
    <>
      <Button variant="outlined" color="primary" onClick={createRoom}>Create Room</Button>
      <Button variant="outlined" color="primary" onClick={() => setModalOpen(true)}>Join Room</Button>
      {modalOpen && (
        <Dialog open={true} onClose={handleClose}>
          <DialogTitle>Join Room</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Room code"
              fullWidth
              value={roomCode}
              onChange={({ target }) => setRoomCode(target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={onSubmit} color="primary">
              Join
            </Button>
          </DialogActions>
        </Dialog> 
      )}
    </>
  );
};

const RoomContext = React.createContext();
const Room = ({ match }) => {
  const { id: roomId } = match.params;
  const [roomData, setRoomData] = useState(null);
  const user = useContext(UserContext);

  const [users, setUsers] = useState([]);

  useEffect(() => {

    const socket = io('http://localhost:3000', {
      transports: ["websocket"],
    });

    const user = String(Math.floor(Math.random() * 9999) + 10000);
    socket.emit('join_room', { userId: user, roomcode: roomId });

    socket.on('join', (room) => {
      console.log(room, 'hello');
      setUsers(room.users);
    });

    const getRoomData = async() => {
      const { data } = await AxiosHttpRequest('GET', `/api/room/${roomId}`);
      setRoomData(data);
    };

    getRoomData();

    return function() {
      console.log('helko');
      socket.emit('disconnect_room', { userId: user, roomcode: roomId });
    };
  }, []);

  return (
    <RoomContext.Provider value={roomData}>
      <Link to='/'>Back</Link>
      {roomId}
      {JSON.stringify(users)}
    </RoomContext.Provider>
  );
};

const App = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const tryLoggingIn = async () => {
      try {
        const { data } = await AxiosHttpRequest('GET', `https://api.spotify.com/v1/me`);
        setUserData(data);
      } catch (error) {
        setUserData(null);
      }
    };

    tryLoggingIn();
  }, []);

  return (
    <HashRouter>
      <UserContext.Provider value={userData}>
        {!!userData ? (
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/room/:id' component={Room} />
          </Switch>
        ) : (
          <Switch>
            <Route exact path='/' component={LoginButton} />
            <Route exact path='/:access_token/:refresh_token' component={Auth} />
            <Redirect to='/' />
          </Switch>
        )}
      </UserContext.Provider>
    </HashRouter>
  );
};

render(<App />, document.querySelector('#root'));
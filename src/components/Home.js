import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';

import { Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField, Grid, Card, Avatar, Typography } from '@material-ui/core';

import { AxiosHttpRequest } from '../helpers/axios';

import { UserContext } from '../context';

export const Home = () => {
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
      <Grid container justifyContent="center" style={{ height: '100%' }} alignItems="center">
        <Grid item xs={2}>
          <Card variant="outlined" style={{ padding: '2rem' }}>
            <Grid container item justifyContent="center" alignItems="center">
              <Avatar src={user?.images[0]?.url} />
              <Typography variant="h5">{user.display_name}</Typography>
            </Grid>
          </Card>
        </Grid>
        <Grid container item justifyContent="center" spacing={3}>
          <Grid item xs={3}>
            <Button fullWidth variant="outlined" color="primary" onClick={createRoom}>Create Room</Button>
          </Grid>
          <Grid item xs={3}>
            <Button fullWidth variant="outlined" color="primary" onClick={() => setModalOpen(true)}>Join Room</Button>
          </Grid>
        </Grid>
      </Grid>
      {modalOpen && (
        <Dialog open={true} onClose={handleClose} fullWidth>
          <DialogTitle>Join Room</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Room code"
              fullWidth
              value={roomCode}
              onChange={({ target }) => setRoomCode(target.value.toUpperCase())}
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
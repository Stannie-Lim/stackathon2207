import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { Grid, TextField, IconButton, Typography, Avatar } from '@material-ui/core';

import SendIcon from '@material-ui/icons/Send';

dayjs.extend(localizedFormat)

export const Chat = ({ user, roomHistory, sendMessage }) => {
  const [input, setInput] = useState('');

  const bottomOfChat = useRef(null);

  useEffect(() => {
    bottomOfChat.current?.scrollIntoView({ block: "end" })
  }, [roomHistory]);

  const onSubmit = (event) => {
    event.preventDefault();
    setInput('');
    sendMessage(input);
  };

  return (
    <Grid container item xs={4} style={{ maxHeight: '65vh' }}>
      <Grid container item style={{ height: '60vh', overflow: 'scroll' }}>
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', flexWrap: 'wrap' }}>
          {roomHistory.map((history) => {
            console.log(history);
            if (history.type === 'notification') {
              return (
                <div id={history.id} style={{ height: 'min-content', marginTop: '16px', }}>
                  <Avatar src={history.user.imageUrl} />
                  <Typography variant="caption">{dayjs(history.time).format('L')} at {dayjs(history.time).format('LTS')}</Typography>
                  <Typography>{history.message}</Typography>
                </div>
              );
            }

            if (history.type === 'message') {
              return (
                <div style={{ height: 'min-content', marginTop: '16px', backgroundColor: history.user.spotifyId === user.id ? 'beige' : 'white' }}>
                  <Avatar src={history.user.imageUrl} />
                  <Typography variant="h6" style={{ fontWeight: history.user.spotifyId === user.id ? 600 : 400 }}>{history.user.name}</Typography>
                  <Typography variant="caption">{dayjs(history.time).format('L')} at {dayjs(history.time).format('LTS')}</Typography>
                  <Typography>{history.message}</Typography>
                </div>
              );
            }
          })}
          <div ref={bottomOfChat} />
        </div>
      </Grid>
      <Grid container item alignItems="center" style={{ width: '100%' }}>
        <form onSubmit={onSubmit}>
          <Grid item>
            <TextField
              value={input}
              onChange={({ target }) => setInput(target.value)}
              placeholder="Message your friends!"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={() => null} type="submit">
              <SendIcon />
            </IconButton>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};
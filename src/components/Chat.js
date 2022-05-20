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
        {roomHistory.map((history) => {
          if (history.type === 'notification') {
            return (
              <Grid container item id={history.id} xs={12}>
                <Grid item xs={12}>
                  <Avatar src={history.user.imageUrl} />
                  <Typography variant="caption">{dayjs(history.time).format('L')} at {dayjs(history.time).format('LTS')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>{history.message}</Typography>
                </Grid>
              </Grid>
            );
          }

          if (history.type === 'message') {
            return (
              <Grid container item id={history.id} justifyContent={history.user.spotifyId === user.id ? "flex-end" : "flex-start"} xs={12}>
                <Grid item>
                  <Avatar src={history.user.imageUrl} />
                  <Typography variant="h6">{history.user.name}</Typography>
                  <Typography variant="caption">{dayjs(history.time).format('L')} at {dayjs(history.time).format('LTS')}</Typography>
                </Grid>
                <Grid item>
                  <Typography>{history.message}</Typography>
                </Grid>
              </Grid>
            );
          }
        })}
        <div ref={bottomOfChat} />
      </Grid>
      <Grid container item alignItems="center">
        <form onSubmit={onSubmit}>
          <Grid item xs={11}>
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
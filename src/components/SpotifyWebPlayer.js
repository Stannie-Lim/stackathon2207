import React, { useEffect, useState } from 'react';

import { Card, CircularProgress, Grid, IconButton, Typography } from '@material-ui/core';

// icons
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

import { getAccessToken, AxiosHttpRequest } from '../helpers/axios';

export const SpotifyWebPlayer = ({ songs, offset, setOffset, togglePlay, setPosition, isPlaying, position }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState(null);

  const play = async (songs, offset, isPlaying, position) => {
    try {
      if (!isPlaying && playerState) {
        await AxiosHttpRequest('PUT', `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, JSON.stringify({ uris: songs.map(({ track }) => track.uri), position_ms: position, offset: { position: offset } }));
      } else {
        await AxiosHttpRequest('PUT', `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`);
      }
    } catch (error) {
      
    }
  };

  useEffect(() => {
    if (window.Spotify !== null) {
      const token = getAccessToken();

      const player = new window.Spotify.Player({
        name: 'hehe',
        getOAuthToken: cb => { cb(token); },
      });

      const createEventHandlers = () => {
        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
        });

        player.addListener('player_state_changed', (state) => {
          setPosition(state.position);
          setPlayerState(state);
        });
      };

      createEventHandlers();
  
      player.connect();
    }

  }, [window.Spotify]);

  useEffect(() => {
    play(songs, offset, isPlaying, position);
  }, [isPlaying, offset, songs, position]);

  if (!deviceId) return <CircularProgress />;

  const onPlay = async () => {
    if (!playerState) {
      await AxiosHttpRequest('PUT', `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, JSON.stringify({ uris: songs.map(({ track }) => track.uri), position_ms: position, offset: { position: offset } }));
    }

    togglePlay();
  };

  const currentTrack = songs[offset]?.track;
  return (
    <Grid container style={{ height: '25vh' }}>
      <Grid container item xs={12} justifyContent="center">
        <Grid item>
          {currentTrack?.album?.images[0]?.url && <img src={`${currentTrack?.album?.images[0]?.url}`} style={{ height: '10vh' }} />}
        </Grid>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Grid item>
          <Typography variant="h4">{currentTrack?.name}</Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Grid item>
            <Typography variant="h6">{currentTrack?.artists[0]?.name}</Typography>
          </Grid>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Grid item>
          <IconButton onClick={() => {
            setOffset(Math.max(0, offset - 1));
            setPosition(0);
          }}>
            <SkipPreviousIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton onClick={onPlay}>
            {!playerState || playerState.paused ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton onClick={() => {
            setOffset(Math.min(songs.length - 1, offset + 1));
            setPosition(0);
          }}>
            <SkipNextIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
};
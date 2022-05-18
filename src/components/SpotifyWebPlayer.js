import React, { useEffect, useState } from 'react';

import { CircularProgress, Grid, IconButton } from '@material-ui/core';

// icons
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

import { getAccessToken, AxiosHttpRequest } from '../helpers/axios';

export const SpotifyWebPlayer = ({ songs, offset, setOffset, togglePlay, setPosition, isPlaying }) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState(null);

  const play = async () => {
    try {
      if (!isPlaying) {
        await AxiosHttpRequest('PUT', `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, JSON.stringify({ uris: songs.map(({ track }) => track.uri), position_ms: playerState?.position || 0, offset: { position: offset } }));
      } else {
        await AxiosHttpRequest('PUT', `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`);
      }
    } catch (error) {
      console.log(error);
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
          // setPlay(!state.paused);
          setPosition(state.position);
          setPlayerState(state);
        });
      };

      createEventHandlers();
  
      player.connect();
      setPlayer(player);
    }

  }, [window.Spotify]);

  useEffect(() => {
    play();
  }, [isPlaying, offset]);

  if (!deviceId) return <CircularProgress />;

  const onPlay = () => {
    togglePlay();
  };

  return (
    <>
      <IconButton onClick={() => setOffset(Math.max(0, offset - 1))}>
        <SkipPreviousIcon />
      </IconButton>
      <IconButton onClick={onPlay}>
        {!playerState || playerState.paused ? <PlayArrowIcon /> : <PauseIcon />}
      </IconButton>
      <IconButton onClick={() => setOffset(Math.min(songs.length - 1, offset + 1))}>
        <SkipNextIcon />
      </IconButton>
    </>
  );
};
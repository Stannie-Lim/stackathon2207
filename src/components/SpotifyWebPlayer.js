import React, { useEffect, useState } from 'react';

import { CircularProgress, Grid, IconButton } from '@material-ui/core';

// icons
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

import { getAccessToken, AxiosHttpRequest } from '../helpers/axios';

export const SpotifyWebPlayer = ({ songs, offset, setOffset, togglePlay, setPosition, isPlaying, position }) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [loading, setLoading] = useState(true);

  const play = async (songs, offset, isPlaying, position) => {
    try {
      if (!isPlaying) {
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
    play(songs, offset, isPlaying, position);
  }, [isPlaying, offset, songs, position]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000);
  }, []);

  if (!deviceId || loading) return <CircularProgress />;

  const onPlay = () => {
    togglePlay();
  };

  return (
    <>
      <IconButton onClick={() => {
        setOffset(Math.max(0, offset - 1));
        setPosition(0);
      }}>
        <SkipPreviousIcon />
      </IconButton>
      <IconButton onClick={onPlay}>
        {!playerState || playerState.paused ? <PlayArrowIcon /> : <PauseIcon />}
      </IconButton>
      <IconButton onClick={() => {
        setOffset(Math.min(songs.length - 1, offset + 1));
        setPosition(0);
      }}>
        <SkipNextIcon />
      </IconButton>
    </>
  );
};
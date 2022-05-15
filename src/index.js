import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';

import { Link, Grid } from '@material-ui/core';

import { AxiosHttpRequest, getAccessToken } from './helpers/axios';

import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { Room } from './components/Room';

import { UserContext } from './context';

const LoginButton = () => {
  return (
    <Grid container justifyContent="center">
      <Grid item>
        <Link href={`/api/auth`}>Login to Spotify</Link>
      </Grid>
    </Grid>
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

    if (getAccessToken()) {
      tryLoggingIn();
    }
  }, []);

  return (
    <UserContext.Provider value={userData}>
      <HashRouter>
        {!!userData ? (
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/room/:id' component={Room} />
          </Switch>
        ) : (
          <Switch>
            <Route exact path='/' component={LoginButton} />
            <Route exact path='/:tokens' component={Auth} />
            <Redirect to='/' />
          </Switch>
        )}
      </HashRouter>
    </UserContext.Provider>
  );
};

render(<App />, document.querySelector('#root'));
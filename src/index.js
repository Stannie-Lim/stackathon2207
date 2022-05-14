import React, { useContext, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';

import { Button } from '@material-ui/core';

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
    setAccessToken(access_token);
  }, []);

  return (
    <Redirect to='/' />
  );
};

const Home = () => {
  const user = useContext(UserContext);
  console.log(user);
  return (
    <>
      <Button variant="outlined" color="primary">Create Room</Button>
      <Button variant="outlined" color="primary">Join Room</Button>
    </>
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
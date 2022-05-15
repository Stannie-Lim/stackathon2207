import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import { setAccessToken } from '../helpers/axios';

export const Auth = ({ match }) => {
  useEffect(() => {
    const { tokens } = match.params;
    const url = new URLSearchParams(tokens);
    setAccessToken(url.get('access_token'));
  }, []);

  return (
    <Redirect to='/' />
  );
};
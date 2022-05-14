import axios from 'axios';

export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

export const setAccessToken = (token) => {
 localStorage.setItem('access_token', token);
};

export const AxiosHttpRequest = async (method, url, data) => {
  switch (method) {
    case 'GET':
      return axios.get(url, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      })
    case 'POST':
      return axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        }
      })
    case 'DELETE':
      return axios.delete(url,
        {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          },
          data
        })
    case 'PUT':
      return axios.put(url, data,
        {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          }
        })
    default:
      alert('Not a valid method');
      break;
  }
}
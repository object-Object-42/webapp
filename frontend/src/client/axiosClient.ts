import axios from 'axios';
const token = localStorage.getItem('access_token')
axios.defaults.headers.common = {'Authorization': `bearer ${token}`}
export default axios;

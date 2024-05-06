import axios from 'axios'
import { defineStore } from 'pinia'
import { useUserInfoStore } from './userInfo';

export const useTokenStore = defineStore({
  id :'tokenStore',
  state: () => ({
    token: localStorage.getItem('token') || null
  }),
  actions: {
      async login(credentials: { username: string, password: string }) {

          try {
	  
	  const response = await axios.post('/login', credentials);
            
	  const token = response.data.token
	  localStorage.setItem('token', token);

	  return response;

          }
          catch (error) {
	  return (error.response);
          }
          
      },
    async loadSession() {
      const token = localStorage.getItem('token');

      if (token) {
        this.token = token;
      }

      try {
        const response = await axios.post('/loadSession');
        const userInfoStore = useUserInfoStore();
  
        userInfoStore.update(response.data);
      } catch (e) {
        this.logout();
      }
    },
    isLoggedIn(): boolean {
      return this.token !== null;
    },
      async register(infos: { name: string, surname: string, username: string, mail: string, password: string }) {  //TODO: Should be moved out from tokenStore ?

          try {
	  
	  const response = await axios.post('/signup', infos);
	  return response;

          } catch(error) {
	  return error.response;
          }
          
      },
    logout() {
      this.token = null
      localStorage.removeItem('token');

      useUserInfoStore().logout();
    }
  },
  getters : {
    getToken: (state) => { return state.token }
  }
});

<script setup>
import { useUserInfoStore } from '@/stores/userInfo';
import { useTokenStore } from '../stores/auth.ts'
import { ref } from 'vue';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const username = ref('');
 const password = ref('');

 const error = ref('');

async function login() {

     const res = await tokenStore.login({username : username.value, password : password.value});

     if (res.data.user) {
         userInfoStore.update(res.data.user);
         window.location.href = '/homepage';
     }
     else {
         error.value = res.data.message;
     }
}

function redirectToRegister() {
    window.location.href = '/register';
}
</script>

<template>

    <div class="container">

        <div v-if="error != ''" id="error-message" class="alert alert-danger" role="alert" >
	{{ error }}
        </div>
        
        <form class="login-form" @submit.prevent="login">
            <input type="username" class="input-field" placeholder="Username" v-model="username">
            <input type="password" class="input-field" placeholder="Password" v-model="password">
            <button type="submit" class="login-button">Login</button>
            <div class="line-container">
                <div class="line"></div>
                <div class="or">OR</div>
                <div class="line"></div>
            </div>

            
            <button type="button" class="login-button" @click="redirectToRegister">Create an account</button>
        </form>
    </div>


</template>


<style scoped>

 #error-message {
     text-align: center;
     margin-top: 10px;
     margin-bottom: 0px;
 }

</style>

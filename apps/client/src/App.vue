<script setup lang="ts">
import { useTokenStore } from './stores/auth';
import noise from '@/assets/noise.svg';

const tokenStore = useTokenStore();

if(tokenStore.getToken){
  tokenStore.loadSession();
}
</script>

<template>
  <head>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Laila:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="./assets/main.css" rel="stylesheet">
  </head>

  <body>
    <RouterView />

    <div class="background" :style="{'background': 'linear-gradient(rgb(240 240 240 / 72%), rgb(240 240 240 / 32%)), url(' + noise + ')'}"></div>
  </body>
</template>


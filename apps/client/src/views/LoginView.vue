<script setup lang="ts">
import slogan from '../components/slogan.vue';
import connexionForm from '../components/connexionForm.vue';
import '../assets/HomeView.css'

</script>

<template>

  <div class="main">
    <slogan/>
    <connexionForm/>
  </div>
</template>

<style scoped>

.main {
  display: flex;
  height: 100vh;
  width: 100%;
  gap: 24px;
  padding: 24px;
  justify-content: center;
  align-items: center;
}

</style>
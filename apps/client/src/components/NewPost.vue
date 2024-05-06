<template>
    <div class="post-form">
      <div class="post-text">
        <textarea v-model="message"  placeholder="Write your post here..."></textarea>
      </div>
      <button @click="postMessage" class="button">Post</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>
  
<script>
import axios from 'axios';

export default {
  data() {
    return {
      message: '',
      errorMessage: ''
    }
  },
  methods: {
    async postMessage() {
      try {
        // Handle the post message action here
        console.log(this.message);
        await axios.post('/posts', {text: this.message});
        this.message = '';
        this.errorMessage = '';
        this.$emit('postStatus', 'success');
      } catch (error) {
        this.errorMessage = 'An error occurred while posting.';
      }
    }
  }
}
</script>
  
<style scoped>
.post-form{
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 5vh;
}


.post-text{
  height: 50%;
  width:100%;
  margin-bottom: 5vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  color: red;
}
</style>
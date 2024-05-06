<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { onMounted, ref } from 'vue';
import FactCheck from './FactCheck.vue'
import axios from 'axios';

const props = defineProps([
    "parentPostId",
    "userIsFactChecker"
]);

const emits = defineEmits(['postStatus']);

const factChecks = ref();
const message = ref('');
const errorMessage = ref('');
const grade = ref(2);

const loadFactChecks = ref(false);

const postMessage = async () => {
    console.log("printed");
    try {
        console.log(message.value, grade.value, props.parentPostId);
        await axios.post('/factCheck/create', {comment: message.value, grade: grade.value, postId: props.parentPostId});
        message.value = '';
        errorMessage.value = '';
        emits('postStatus', 'success');
    } catch (error) {
        console.log(error);
        errorMessage.value = 'An error occurred while creating your fact check.';
    }
}

onMounted( async () => {
    factChecks.value = (await axios.get(`/posts/${props.parentPostId}/factChecks`)).data;
    loadFactChecks.value = true;
    console.log(factChecks.value);
})

</script>

<template>
    <div class="comments">
        <div v-if="loadFactChecks" class="comments-content">
            <div v-for="factCheck in factChecks" :key="factCheck._id" class="comment">
                <FactCheck :factCheck="factCheck"></FactCheck>
            </div>
        </div>
        <div class="comment-form" v-if="props.userIsFactChecker">
            <div>
                <input v-model="grade" type="range" id="grade" name="grade" min="0" max="2" step="1" />
                <label for="grade">Grade</label>
            </div>
            <textarea v-model="message" class="comment-input" placeholder="Write your fact check message here..."></textarea>
            <button @click="postMessage" class="comment-button">Create Fact Check</button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<style scoped>
.comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    
    width: 70%;
}
.comments-content {
    display: flex;
    flex-direction: column;
    overflow:auto;
    height:50vh;
    gap: 1rem;
}

.comment-form{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    width: 100%;
}
.comment-input{
    border: none;
    width: 100%;
    height: 10vh;

    padding : 1em;

    background: #d9d9d9;
    border-radius: 0.5rem;
}

.comment-button{
    background: #242323;
    color: white;

    width: 20%;
    height: 10%;
    padding: 1rem;
    border-radius: 1rem;
    cursor: pointer;
}
</style>

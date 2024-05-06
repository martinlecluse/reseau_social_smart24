<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { onMounted, ref } from 'vue';
import Comment from './Comment.vue'
import axios from 'axios';

const props = defineProps([
    "parentPostId"
]);

const comments = ref();
let commentText = defineModel('commentText');

const emits = defineEmits(['comment-sent']);
const loadComments = ref(false);

async function sendComment() {
    const resp = (await axios.post('/posts/comment', { text : commentText.value, parentPostId : props.parentPostId}));
    emits('comment-sent');
    console.log(resp);
}

onMounted( async () => {
    comments.value = (await axios.get(`/posts/${props.parentPostId}/comments`)).data;
    console.log(comments.value)
    loadComments.value = true;
})

</script>

<template>
    <div class="comments">
        <div v-if="loadComments" class="comments-content">
            <div v-for="comment in comments" :key="comment._id" class="comment">
                <Comment :comment="comment"></Comment>
            </div>
        </div>
        <div class="comment-form">
            <div class="comment-input" >
                <textarea v-model="commentText" placeholder="Write a comment"></textarea>
            </div>
            <button class="button comment-button" @click="sendComment">Send</button>
        </div>
    </div>
</template>

<style scoped>
.comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    overflow:auto;
    max-height:50vh;
    width: 70%;
    margin-bottom: 5vh;
}

.comment-form{
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;

}

.comment-input{
    display:flex;
    justify-content: center;
    width: 100%;
}

.comment-button{
    justify-self: flex-end;
}
</style>

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
});

</script>

<template>
    <div class="form-container">
        <div v-if="loadFactChecks" class="comments-content">
            <div v-for="factCheck in factChecks" :key="factCheck._id" class="comment">
                <FactCheck :factCheck="factCheck"></FactCheck>
            </div>
        </div>
        <div class="form" v-if="props.userIsFactChecker">
            <div class="factchecker-container">
                <div class="factchecker">
                    <label for="grade">{{ grade==0? "false": grade==1? "cautious": "accurate"}}</label>
                    <input v-model="grade" type="range" id="grade" name="grade" min="0" max="2" step="1" class= "[(grade==0)? 'false': (grade==1)? 'cautious': 'accurate']"/>
                </div>
            </div>
            <textarea v-model="message" class="input" placeholder="Write your fact check message here..."></textarea>
            <button @click="postMessage" class="button">Create Fact Check</button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<style scoped>
.factchecker-container{
    display: flex;
  justify-content: flex-end;
  align-items: center;
}
.factchecker{
    display: flex;
    justify-content: space-around;
    width: 19vw;
}
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}


</style>
 
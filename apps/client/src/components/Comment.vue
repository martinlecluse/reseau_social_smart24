<script setup>
import { ref } from "vue";

const props = defineProps({
    comment: {
        _id: Object,
        createdBy: Object,
        date: Date,
        direct: Number,
        metrics: Object,
        text: String,
    }
});
const likedBy = ref(false);
const unlikedBy = ref(false);

const dateInstance = new Date(props.comment.date);

async function likePost() {
    likedBy.value = !likedBy.value;
}

async function dislikePost() {
    unlikedBy.value = !unlikedBy.value;
}

</script>

<template>
    <div class="comment-header">
        <h2 class="comment-username">{{ comment.createdBy.username }}</h2>
        <p class="date">{{ dateInstance.toLocaleString('fr-FR') }}</p>
    </div>
    <div class="comment-content">
        <p class="std">{{ comment.text }}</p>
    </div>
    <div class="comment-footer">
        <div class="post-btn-grp comment-btn-grp">
            <button v-if="likedBy" class="post-btn post-btn-active post-btn-green" @click="likePost">
                <span class="post-btn-icon material-symbols-outlined">thumb_up</span>
            </button>
            <button v-else class="post-btn" @click="likePost">
                <span class="post-btn-icon material-symbols-outlined">thumb_up</span>
            </button>

            <button v-if="unlikedBy" class="post-btn post-btn-active post-btn-red" @click="dislikePost">
                <span class="post-btn-icon material-symbols-outlined">thumb_down</span>
            </button>
            <button v-else class="post-btn" @click="dislikePost">
                <span class="post-btn-icon material-symbols-outlined">thumb_down</span>
            </button> 
        </div>
    </div>
</template>

<style scoped>


.comment-header{
    display: flex;
    justify-content: flex-start;
    align-items: center;

}

.comment-username{
    font-size: 1.5rem;
    margin-right: 0.5rem;
}

.date{
    font-size: 0.8rem;
}

.comment-footer{
    display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-content {
    font-size: 0.9em;
}

.comment-btn-grp{
    scale:0.7;
}
</style>
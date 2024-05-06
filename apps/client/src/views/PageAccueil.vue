<script setup lang="ts">

import feed from "../components/common/feed.vue"
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { onMounted, ref } from "vue";
import AppLayout from "@/components/common/AppLayout.vue";
import modal from "@/components/pop-ups/modal.vue";
import NewPost from "@/components/NewPost.vue";

const loadFeed = ref(false);

const store = useUserInfoStore();

const userId = ref('')
const username = ref('');
const userIsFactChecker = ref()
const posts=ref<any[]>([]);;
const showCreateNewPost = ref(false);

const switchShowCreateNewPost = () => {
    showCreateNewPost.value = !showCreateNewPost.value;
}

const handleNewPostStatus = (status: string) => {
    if (status === 'success') {
      switchShowCreateNewPost();
    } else {
        alert('An error occurred while posting your message');
    }
}


onMounted(async () => {
    let userInfo = store.getUserInfo;

    userId.value = userInfo._id!;
    username.value = userInfo.username!;
    userIsFactChecker.value = userInfo.isFactChecker === "true" ? true : false;

    try {

        posts.value = (await axios.get('/posts/getSuggestions')).data.suggestions;

        console.log(posts.value)
        loadFeed.value = true;
    } catch (error) {
        console.error("Erreur lors de la récupération des posts :", error);
    }
});

</script>

<template>
    <AppLayout>
        <feed v-if="loadFeed" :posts="posts" :isFactChecker="userIsFactChecker"></feed>
        <div v-else class="loading-container">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </AppLayout>

    <button class="btn btn-primary b create-post-btn" @click="switchShowCreateNewPost">Create a new post</button>

    <modal v-if="showCreateNewPost" @close="switchShowCreateNewPost">
        <NewPost @postStatus="handleNewPostStatus"/>
    </modal>
</template>

<style scoped>

.mainFeed {
    padding-top: 70px;
}

main {
    margin: 0 auto;
    padding: 24px 12px;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.create-post-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.05);
}

.loading-container {
    padding: 12px;
    display: flex;
    justify-content: center;
}

</style>
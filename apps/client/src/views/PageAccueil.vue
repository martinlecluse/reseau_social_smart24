<script setup lang="ts">

import feed from "../components/common/feed.vue"
import { useUserInfoStore } from "../stores/userInfo";
import axios from "axios";
import { onMounted, ref } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
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
    <AppHeader></AppHeader>

    <div class="mainFeed">
        <main>
            <div class="options">
                <button class="btn btn-primary b" @click="switchShowCreateNewPost">
                    Create a new post
                </button>
            </div>

            <feed v-if="loadFeed" :posts="posts" :isFactChecker="userIsFactChecker"></feed>
        </main>
    </div>

    <modal v-if="showCreateNewPost" @close="switchShowCreateNewPost">
        <NewPost @postStatus="handleNewPostStatus"/>
    </modal>
</template>

<style scoped>

.mainFeed{
    width:100%;
    height:100vh;
    padding-top: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    background-image: linear-gradient(to bottom, #f7e1e1 50%, #B9ABAB 100%);
}

main {
    margin: 0 auto;
    padding: 24px 12px;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.options {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
}

</style>
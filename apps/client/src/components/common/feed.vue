<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-v-for-key -->
<script setup lang="ts">
import { defineProps } from 'vue';
import post from '../post.vue'

const props = defineProps({
    posts: Object,
    isFactChecker: Boolean
})

</script>

<template>
    <div class="feed">
        <div class="posts" v-for="(item, index) in  props.posts" :key="index">
            <post :info="item" :userIsFactChecker="isFactChecker"></post>
        </div>
    </div>
</template>

<style scoped>

.feed {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.posts {
    padding: 24px;
}

.posts:not(:last-child) {
    border-bottom: solid 1px rgb(231, 231, 231);
}

</style>
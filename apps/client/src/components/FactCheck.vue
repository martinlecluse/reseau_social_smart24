<script setup>

const props = defineProps([
    'factCheck'
]);
</script>

<template>
    <div class="comment-header">
        <h2 class="createdBy">{{ factCheck.emittedBy.username }}</h2>
        <p class="date">{{ factCheck.date }}</p>
    </div>
    <div class="comment-content">
        <p class="std">Grade : {{ factCheck.grade }}/2</p>
        <p class="std">{{ factCheck.comment }}</p>
    </div>
</template>

<style scoped>


.comment-header{
    display: flex;
    justify-content: flex-start;
}

.date{
    font-size: 0.8rem;
}

.comment-content {
    margin: 0 0 0 1em;
}
</style>
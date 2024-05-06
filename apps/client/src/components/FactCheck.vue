<script setup>

const props = defineProps([
    'factCheck'
]);
const dateInstance = new Date(props.factCheck.date);
</script>

<template>
    <div class="comment-header">
        <h2 class="createdBy">{{ factCheck.emittedBy.username }}</h2>
        <p class="date">{{ dateInstance.toLocaleString('fr-FR') }}</p>
    </div>
    <div class="comment-content">
        <p class="std accent-bold">{{ factCheck.emittedBy.organization }}</p>
        <p class="std">Grade : {{ factCheck.grade }}/2</p>
        <p class="std">{{ factCheck.comment }}</p>
    </div>
</template>

<style scoped>


.comment-header{
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.date{
    font-size: 0.8rem;
    margin-left: 0.5em
}

.comment-content {
    margin: 0 0 0 1em;
}
</style>
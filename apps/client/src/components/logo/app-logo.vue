<script setup>

const props = defineProps([
    'size'
])

</script>

<template>
    <div class="app-logo">
        <a class ="logoLink" href="/homepage">
            <p class="logo laila" :style="{fontSize: props.size}">A</p>
        </a>
    </div>
</template>

<style scoped>
.logo {
    font-weight: 700;
    font-size: 50px;
    margin: 0;
}

.logoLink{
    text-decoration: none;
    color: inherit;
}
</style>
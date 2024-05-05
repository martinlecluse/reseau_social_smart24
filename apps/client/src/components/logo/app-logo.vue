<script setup>

const props = defineProps([
    'size'
])

</script>

<template>
    <!-- <div class="app-logo">
        <a class ="logoLink" href="/homepage">
            <p class="logo laila" :style="{fontSize: props.size}">A</p>
        </a>
    </div> -->
    <router-link to="/homepage" class="logo laila" :style="{fontSize: props.size}">
        A
    </router-link>
</template>

<style scoped>

.logo {
    font-weight: 700;
    font-size: 50px;
    margin: 0;
    color: black;
    text-decoration: none;
    transition: ease-in scale 0.1s;
}

.logo:hover {
    scale: 1.05;
}

.logo:active {
    scale: 0.95;
}

</style>
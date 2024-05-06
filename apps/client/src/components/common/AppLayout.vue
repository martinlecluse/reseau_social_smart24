<script setup lang="ts">
import AppHeader from "@/components/common/AppHeader.vue";
</script>

<template>
    <AppHeader></AppHeader>

    <div class="main-container">
        <div class="main-content">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.main-container {
    padding-top: 70px;
}

.main-content {
    margin: 24px auto;
    background-color: white;
    border-radius: 12px;
    border: solid 1px rgb(240, 240, 240);
    box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.025);
    max-width: 900px;
}
</style>
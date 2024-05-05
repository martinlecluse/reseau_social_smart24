<script setup>
import AppLogo from '../logo/app-logo.vue';
import { useUserInfoStore } from "../../stores/userInfo";
import { useTokenStore } from '@/stores/auth';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const logout = () => {
    tokenStore.logout();
    window.location.href = '/login';
}

</script>

<template>
    <header>
        <div class="identity">
            <AppLogo size="40px"/>
            <div class="info-user">
                <div class="info-user-avatar"></div>
                <span class="info-user-username">{{ userInfoStore.getUserInfo.username }}</span>
            </div>
        </div>

        <nav>
            <slot name="nav">
                <router-link to="/homepage">
                    <button class="btn btn-primary b">Feed</button>
                </router-link>
                <router-link to="/settings">
                    <button class="btn btn-primary b">Settings</button>
                </router-link>
                <button class="btn btn-primary b" @click="logout">Logout</button>
            </slot>
        </nav>
    </header>
</template>

<style scoped>

header {
    position: fixed;
    display: flex;
    justify-content: space-between;
    align-items:center;
    height: 70px;
    background-color: white;
    width: 100%;
    padding: 0 24px;
    z-index: 100;
    border-bottom: solid 1px rgb(231, 231, 231);
}

.identity {
    display: flex;
    align-items: center;
    gap: 1em;
}

.info-user {
    border: solid 1px rgb(202, 202, 202);
    border-radius: 100px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-user-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: rgb(202, 202, 202);
}

.info-user-username {
    padding: 0 12px 0 0;
    font-weight: 600;
}

nav {
    display: flex;
    gap: 6px;
}

</style>
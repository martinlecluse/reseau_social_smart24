<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useUserInfoStore } from "../stores/userInfo";
import FeedComment from "./FeedComment.vue";
import modal from "./pop-ups/modal.vue";
import FeedFactCheck from "./FeedFactCheck.vue";

const props = defineProps({
    info: {
        _id: Object,
        createdBy: Object,
        date: Date,
        direct: Number,
        metrics: Object,
        text: String,
    },
    userIsFactChecker: Boolean
});


const store = useUserInfoStore();
const userInfo = store.getUserInfo;
const id = userInfo._id;

const metric = ref('');
const likedBy = ref(false);
const unlikedBy = ref(false);
const trustedBy = ref(false);
const untrustedBy = ref(false);

const dateInstance = new Date(props.info.date);

const showFactChecks = ref(false);
const loadComments = ref(false);


const handleFactCheckStatus = (status) => {
    if (status === 'success') {
        switchShowFactChecks();
    } else {
        alert('An error occurred while posting your message');
    }
}

onMounted(async () => {
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
});

const openCommentsPanel = () => {
    loadComments.value = true
}

const closeFeedComment = async () => {
    loadComments.value = false;
    metric.value = await getMetrics();
}

async function getMetrics() {
    const res = await axios.get(`/posts/${props.info._id}/metrics`);
    return res.data;
}

async function switchShowFactChecks (){
    showFactChecks.value = !showFactChecks.value;
    metric.value = await getMetrics();
    return showFactChecks.value;
}

async function likePost() {
    await axios.post(`/posts/${props.info._id}/metrics/like`);
    
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

async function dislikePost() {
    await axios.post(`/posts/${props.info._id}/metrics/dislike`);
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

async function trustPost() {
    await axios.post(`/posts/${props.info._id}/metrics/trust`);
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

async function untrustPost() {
    await axios.post(`/posts/${props.info._id}/metrics/untrust`);
    metric.value = await getMetrics();
    checkIfUserHasLiked(metric.value);
}

function checkIfUserHasLiked(list) {
    // Initialiser les indicateurs de like à false
    likedBy.value=false;
    unlikedBy.value=false;
    trustedBy.value=false;
    untrustedBy.value=false;

    // Récupérer les informations de like pour le post actuel
    let likedBySet = new Set(list.likedBy);
    let dislikedBySet = new Set(list.dislikedBy);
    let trustedBySet = new Set(list.trustedBy);
    let untrustedBySet = new Set(list.untrustedBy);

    // Vérifier si l'utilisateur a aimé le post
    if (likedBySet.has(id)) {
        likedBy.value = true;
    }
    // Vérifier si l'utilisateur a désaimé le post
    if (dislikedBySet.has(id)) {
        unlikedBy.value = true;
    }
    // Vérifier si l'utilisateur a fait confiance au post
    if (trustedBySet.has(id)) {
        trustedBy.value = true;
    }
    // Vérifier si l'utilisateur n'a pas fait confiance au post
    if (untrustedBySet.has(id)) {
        untrustedBy.value = true;
    }
}
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
/* Vos styles CSS ici */
</style>


<template>

    <div class="  ">
        <div class="post">
            <div class="post-content">
                <p class="std"> {{info.text}}</p>
            </div>
            <div class="post-footer">
                <div class="post-footer-left"> 
                    <div v-if="props.userIsFactChecker" class="comment-icon-container">  
                        <button class="post-btn" @click="switchShowFactChecks">
                            <span class="post-btn-icon material-symbols-outlined">verified</span>
                            <span class="post-btn-count">{{metric.nbFactChecks}}</span>
                        </button>
                    </div>

                    <div class="post-btn-grp">
                        <button v-if="trustedBy" class="post-btn post-btn-active post-btn-green" @click="trustPost">
                            <span class="post-btn-icon material-symbols-outlined">verified_user</span>
                            <span class="post-btn-count">{{metric.nbTrusts}}</span>
                        </button>
                        <button v-else class="post-btn" @click="trustPost">
                            <span class="post-btn-icon material-symbols-outlined">verified_user</span>
                            <span class="post-btn-count">{{metric.nbTrusts}}</span>
                        </button>

                        <button v-if="untrustedBy" class="post-btn post-btn-active post-btn-red" @click="untrustPost">
                            <span class="post-btn-icon material-symbols-outlined">remove_moderator</span>
                            <span class="post-btn-count">{{metric.nbUntrusts}}</span>
                        </button>
                        <button v-else class="post-btn" @click="untrustPost">
                            <span class="post-btn-icon material-symbols-outlined">remove_moderator</span>
                            <span class="post-btn-count">{{metric.nbUntrusts}}</span>
                        </button>
                    </div>

                    <div class="post-btn-grp">
                        <button v-if="likedBy" class="post-btn post-btn-active post-btn-green" @click="likePost">
                            <span class="post-btn-icon material-symbols-outlined">thumb_up</span>
                            <span class="post-btn-count">{{metric.nbLikes}}</span>
                        </button>
                        <button v-else class="post-btn" @click="likePost">
                            <span class="post-btn-icon material-symbols-outlined">thumb_up</span>
                            <span class="post-btn-count">{{metric.nbLikes}}</span>
                        </button>

                        <button v-if="unlikedBy" class="post-btn post-btn-active post-btn-red" @click="dislikePost">
                            <span class="post-btn-icon material-symbols-outlined">thumb_down</span>
                            <span class="post-btn-count">{{metric.nbDislikes}}</span>
                        </button>
                        <button v-else class="post-btn" @click="dislikePost">
                            <span class="post-btn-icon material-symbols-outlined">thumb_down</span>
                            <span class="post-btn-count">{{metric.nbDislikes}}</span>
                        </button>
                    </div>

                    <div class="post-btn-grp">
                        <button class="post-btn" @click="openCommentsPanel">
                            <span class="post-btn-icon material-symbols-outlined">comment</span>
                            <span class="post-btn-count">{{metric.nbComments}}</span>
                        </button>
                    </div>
                </div>
                
                <div class="post-footer-right">
                    <p class="post-creator-username">
                        <router-link v-if="props.info.createdBy && (props.info.createdBy.username && props.info.createdBy._id)" :to="{ name: 'profile', params: { profileId: props.info.createdBy._id } }">
                            {{ props.info.createdBy.username }}
                        </router-link>

		<router-link v-if="props.info.createdBy && (props.info.createdBy[0].username && props.info.createdBy[0]._id)" :to="{ name: 'profile', params: { profileId: props.info.createdBy[0]._id } }">
                            {{ props.info.createdBy[0].username }}
                        </router-link>
                    </p>
                    <p class="post-date">{{ dateInstance.toLocaleString('fr-FR') }}</p>
                </div>
            </div>
        </div>
    </div>
    <div v-if="loadComments">
        <modal @close="closeFeedComment"><FeedComment :parentPostId="info._id" @comment-sent="closeFeedComment"></FeedComment></modal>
    </div>
    <div v-if="showFactChecks">
        <modal @close="switchShowFactChecks">
            <FeedFactCheck 
                :parentPostId="props.info._id" 
                :userIsFactChecker="userIsFactChecker" 
                @postStatus="handleFactCheckStatus">
            </FeedFactCheck>
        </modal>
    </div>


</template>

<style scoped>

h1, h2, h3, h4, h5, h6, p {
    margin: 0;
}

.post-creator-username{
    font-weight: 600;
}
.post {
    font-family: 'inter', sans-serif;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.post-content {
    font-size: 0.9em;
}

.post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.post-footer-left {
    display: flex;
    gap: 6px;
}

.post-date {
    margin: 0;
    font-size: 0.85em;
    opacity: 0.65;
}

</style>

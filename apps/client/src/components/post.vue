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
let factCheckZero= ref(0);
let factCheckOne= ref(0);
let factCheckTwo= ref(0);



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
    modifDiagram();
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
    modifDiagram();
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

function getProportionFactCheck(){

    let nbFactChecks = props.info.metrics.factChecks.length;

    for(let i=0 ; i<nbFactChecks ; i++){
        if(props.info.metrics.factChecks[i].grade==0){
            factCheckZero.value=factCheckZero.value+1;
        }else if(props.info.metrics.factChecks[i].grade==1){
            factCheckOne.value=factCheckOne.value+1;

        }else if(props.info.metrics.factChecks[i].grade==2){
            factCheckTwo.value=factCheckTwo.value+1;

        }
    }

    if(nbFactChecks!=0){
        factCheckZero.value= factCheckZero.value/nbFactChecks*100;
        factCheckOne.value= factCheckOne.value/nbFactChecks*100;
        factCheckTwo.value= factCheckTwo.value/nbFactChecks*100;
    }
    
}

function modifDiagram(){
    getProportionFactCheck();
    // Récupérer l'élément de la barre de progression
    var progressBar = document.getElementById(props.info._id);
    // Définir le dégradé conique en fonction de la valeur de factCheckScore
   
    let myList=[factCheckZero.value,factCheckOne.value,factCheckTwo.value];

    if(factCheckOne.value==0 && factCheckTwo.value==0 && factCheckZero.value==0){
        progressBar.style.backgroundColor = "gray";
    }else{
        progressBar.style.background = `conic-gradient(orange 0% ${myList[0]}% , gray ${myList[0]}% ${myList[0]+myList[1]}%, green ${myList[0]+myList[1]}% ${myList[0]+myList[1]+myList[2]}%)`;
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
                    <div v-if="props.userIsFactChecker" class="comment-icon-container post-btn-grp">  
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

                    <div v-if="metric.nbFactChecks!=0" class="post-btn-grp">
                        <div v-bind:id=props.info._id class="progress-bar" @click="switchShowFactChecks">
                            <div id="progress">{{metric.factCheckScore}}</div>
                        </div>
                     </div>


                </div>

                
                <div class="post-footer-right">
                    <p class="post-creator-username">
                        <router-link v-if="props.info.createdBy && (props.info.createdBy.username && props.info.createdBy._id)" :to="{ name: 'profile', params: { profileId: props.info.createdBy._id } }">
                            {{ props.info.createdBy.username }}
                        </router-link>

		<router-link v-if="props.info.createdBy[0] && (props.info.createdBy[0].username && props.info.createdBy[0]._id)" :to="{ name: 'profile', params: { profileId: props.info.createdBy[0]._id } }">
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


.progress-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5vh;
  height: 5vh;
  margin-left: 10vh;
  border-radius: 50%;
  color:black;
  font-size: 1.3rem;
  font-family: 'Laila', serif;

}

/* .progress-bar::before {
  counter-reset: var(--progress-value);
  content: counter(percentage);
  animation: progress 2s 1 forwards;
} */



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

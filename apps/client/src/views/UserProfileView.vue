<script setup lang="ts">

import AppHeader from "@/components/common/AppHeader.vue";
import feed from "../components/common/feed.vue"
import '../assets/main.css'
import { useUserInfoStore } from "../stores/userInfo";
import { computed, onMounted, ref, defineProps } from "vue";
import axios from 'axios'
import AppLayout from "@/components/common/AppLayout.vue";

const props = defineProps({
  profileId: {
    type: String,
    required: true
  }
});

const store = useUserInfoStore();

let currentUserId = ref('');
let currentUserUsername = ref('');
let currentUserIsFactChecker = ref()

let userProfileId: string = props.profileId;
let userProfileUsername = ref('');
let userProfileName = ref('');
let userProfileSurname = ref('');
let userProfileFactchecker = ref(false);

const posts = ref<any[]>([]);

const fetchInfos = async (userId: string) => {
  try {
    const response = await axios.get(`user/${userId}/profile`);
    userProfileUsername.value = JSON.stringify(response.data.userData.username).replace(/"/g, '');
    userProfileName.value = JSON.stringify(response.data.userData.name).replace(/"/g, '');
    userProfileSurname.value = JSON.stringify(response.data.userData.surname).replace(/"/g, '');
    userProfileFactchecker.value = (JSON.stringify(response.data.userData.factChecker) == "true")
    posts.value = (JSON.parse(JSON.stringify(response.data.lastPosts)));

    if(JSON.stringify(response.data.userData.trustedUsers).includes(userProfileId)){
      let trusted = document.getElementsByClassName('trust');
      trusted[0].setAttribute('id', 'trusted');
    } else if(JSON.stringify(response.data.userData.untrustedUsers).includes(userProfileId)){
      let unTrusted = document.getElementsByClassName('untrust');
      unTrusted[0].setAttribute('id', 'unTrusted');
    }
  } catch (error) {
    console.error(error);
  }
  console.log((posts));
};

onMounted( async () => {
    //retrieve session information
    const userInfo = computed(()=>store.getUserInfo).value;
    currentUserId.value = userInfo._id!;
    currentUserUsername.value = userInfo.username!;
    currentUserIsFactChecker.value = (userInfo.isFactChecker === "true") ;
    await fetchInfos(userProfileId);
});

async function buttonTrustUser() {
  let trusted = document.getElementsByClassName('trust');
  trustUser();
  if(trusted[0].hasAttribute('id')){
    trusted[0].removeAttribute('id');
  } else {
    trusted[0].setAttribute('id', 'trusted')
  }
  let unTrusted = document.getElementsByClassName('untrust');
  unTrusted[0].removeAttribute('id');
}

async function buttonUnTrustUser() {
  let unTrusted = document.getElementsByClassName('untrust');
  unTrustUser();
  if(unTrusted[0].hasAttribute('id')){
    unTrusted[0].removeAttribute('id');
  } else {
    unTrusted[0].setAttribute('id', 'unTrusted')
  }
  let trusted = document.getElementsByClassName('trust');
  trusted[0].removeAttribute('id');
}

async function trustUser(){
  await axios.post('/user/trustUser', {user: currentUserId.value, otherUserId: props.profileId});
}

async function unTrustUser(){
  await axios.post('/user/untrustUser', {user: currentUserId.value, otherUserId: props.profileId});
}

</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
</style>

<template>
  <!-- <AppHeader></AppHeader> -->

  <AppLayout>
    <div class="content">
      <div class="user-profile-container">
        <div class="user-profile-info">
          <p class="user-profile-name">{{ userProfileName }} {{ userProfileSurname }}</p>
          <em class="column">
            <p class="user-profile-username">@{{ userProfileUsername }} 
              <span v-if="userProfileFactchecker" class="material-symbols-outlined factCheckerTick">security</span>
            </p>
          </em>
            
        </div>

        <div class="user-profile-buttons">
            <div class="post-btn-grp">
                <button class="post-btn trust" @click="buttonTrustUser">
                    <span class="post-btn-icon material-symbols-outlined">verified_user</span>
                </button>
                <button class="post-btn untrust" @click="buttonUnTrustUser">
                    <span class="post-btn-icon material-symbols-outlined">remove_moderator</span>
                </button>
            </div>
        </div>
      </div>

      <feed :posts="posts" :isFactChecker="userProfileFactchecker" class="feed"></feed>
    </div>
  </AppLayout>
</template>

<style scoped>

h1, h2, h3, h4, h5, h6, p {
  margin: 0;
}

.user-profile-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: solid 1px rgb(231, 231, 231);
}

.user-profile-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-profile-name {
  font-size: 2.2em;
  font-weight: 600;
}

.user-profile-username {
  font-size: 1.2em;
  font-weight: 700;
  opacity: 0.75;
}

#trusted {
  color: rgb(39, 39, 195);
}

#unTrusted {
  color: rgb(228, 37, 37);
}
.column{
  display: flex;
  align-items: flex-start;
  flex-direction: column;

}

.factCheckerTick:hover:after {
  display: block;
  content: "This user is a fact checker";
  position: absolute;
  background: #f8f8f8;
  border-right: 5px solid #dfdfdf;
  border-bottom: 5px solid #dfdfdf;
  border-top: 5px solid #dfdfdf;
  border-left: 5px solid #dfdfdf;
  padding: 5px;
  width: auto;
  font-size: 14px;
  font-family: Arial, Helvetica, sans-serif;
}

  /* .content {
    padding-top: 70px;
  }

  .user-profile-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .user-profile-infos {
    display:flex;
    flex-direction: column;
  }
 
  #userIdentity {
    font-size: 2em;
  }

  .user-profile-buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  

  .button-profile {
    background-color: transparent;
    margin-right: 2vh;
    border: none;
    outline: none;
  }

  .button-profile:hover {
    color: #b9abab;
  }

  .button-profile:focus {
    outline: none;
  }

  #trusted {
    color: rgb(39, 39, 195);
  }

  #unTrusted {
    color: rgb(228, 37, 37);
  }

  .factCheckerTick {
    font-size: 15px;
    margin-left: 5px;
  }
  
  

   */
</style>
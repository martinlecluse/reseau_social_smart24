<script setup>

import axios from "axios";
import { onMounted } from 'vue';
import  { useUserInfoStore } from '../stores/userInfo'
import  { ref } from 'vue'
import { useTokenStore } from '../stores/auth'
import { authHeader } from "@/utils/auth";
import { computed } from "vue";
import BandeauSettings from "@/components/common/bandeau-settings.vue";

const loaded = ref(false);

const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();

const token = ref('');

const userId = ref('');
const userData = ref('');

const newFactCheckedRate = ref('');
const newDiversityRate = ref('');

function switchSelectedValue(event) {
  let siblings = event.target.parentNode.childNodes
  siblings.forEach(s => {
    s.setAttribute('id', 'not-selected')
  });
  event.target.setAttribute('id', 'selected');
}

function updateFactCheckRate(value, event) {
    newFactCheckedRate.value = value;
    switchSelectedValue(event)
}

function updateDiversityRate(value, event) {
    newDiversityRate.value = value;
    switchSelectedValue(event)
}

async function updateUserParams() {
    let updatedInfo = { parameters : { rateFactChecked: newFactCheckedRate.value, rateDiversification: newDiversityRate.value}};
    userData.value = (await axios.post('/user/update', updatedInfo, authHeader(token.value))).data;
}

onMounted(async () => {
    //recover user id
    const userInfo = userInfoStore.getUserInfo;
    userId.value = userInfo._id;
    token.value = computed(() => tokenStore.getToken).value;

    //get all info
    userData.value = (await axios.get('/user/' + userId.value, authHeader(token.value))).data;
    //important not to crush values saved in the db in case user clicks on "valider"
    newFactCheckedRate.value = userData.value.parameters.rateFactChecked;
    newDiversityRate.value = userData.value.parameters.rateDiversification;
    loaded.value = true;
});

</script>

<template>
    <div class="content">
        <BandeauSettings :username="userData.username" :firstname="userData.name" :lastname="userData.surname"></BandeauSettings>
        <div v-if="loaded" class="panel profile">
            <div class="info">
                <h1 class="std title1">Profile</h1>
                <div class="section user-info">
                    <h2 class="std title2">Personal information</h2>
                    <div class="section-content">
                        <p class="std text"><span class="std accent-bold">Name :</span> {{ userData.name }} {{ userData.surname }}</p>
                        <p class="std text"><span class="std accent-bold">E-mail :</span> {{ userData.mail }}</p>
                        <div v-if="userData.factChecker === true" class="fact-checker-info">
                            <h3 class="std title3">Recognized fact-checker</h3>
                            <p class="std text"><span class="std accent-bold">Organization :</span> {{ userData.organization }}</p>
                        </div>
                    </div>
                </div>
                <div class="section params">
                    <h2 class="std title2">Settings</h2>
                    <div class="section-content">
                        <p class="std text">Here, you can choose the way you want the public feed to look like</p>
                        <div class="select-param">
                            <p class="std text accent-bold">Fact-checking of the feed : {{ userData.parameters.rateFactChecked }} %</p>
                            <p class="std text accent-italic">Set the rate of fact-checked posts in your feed</p>
                            <div class="set-param">
                                <div class="btn-group btn-group-toggle" role="group" data-toggle="buttons">
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(0, $event)">0</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(10, $event)">10</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(20, $event)">20</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(30, $event)">30</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(40, $event)">40</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(50, $event)">50</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(60, $event)">60</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(70, $event)">70</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(80, $event)">80</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(90, $event)">90</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateFactCheckRate(100, $event)">100</button>
                                </div>
                            </div>
                            <div class="validate-button"><button class="btn btn-primary" @click="updateUserParams">Valider</button></div>
                        </div>
                        <div class="select-param">
                            <p class="std text accent-bold">Diversity of the feed : {{ userData.parameters.rateDiversification }} %</p>
                            <p class="std text accent-italic">Set the rate of posts that will be out of your current interest centers (sounds exciting !)</p>
                            <div class="set-param">
                                <div class="btn-group btn-group-toggle" role="group" data-toggle="buttons">
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(0, $event)">0</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(10, $event)">20</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(20, $event)">20</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(30, $event)">30</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(40, $event)">40</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(50, $event)">50</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(60, $event)">60</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(70, $event)">70</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(80, $event)">80</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(90, $event)">90</button>
                                    <button class="btn btn-primary" id="not-selected" @click="updateDiversityRate(100, $event)">100</button>
                                </div>
                            </div>
                            <div class="validate-button"><button class="btn btn-primary" @click="updateUserParams">Valider</button></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.content{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    width: 100%;
}

.info {
    margin: 2em 2em 2em 2em;
}

.section {
    margin: 1em 0 0 0.3em;
}

.section-content {
    margin: 1em 0 0 0.3em;
}

.fact-checker-info {
    margin: 1em 0 0 0;
}

.select-param {
    margin: 1em 0 0 0;
}

.validate-button {
    display: flex;
    justify-content: flex-end;
}

.validate-button button {
    margin: 0 3em 0 0;
}

.set-param {
    display: flex;
    flex-direction: row;
    justify-content: space-around;

    margin: 0.5em 0 0.5em 0;
}

.select-param #not-selected.btn.btn-primary {
  background-color: white;
  color: black;
  border: 1px solid black;
}

.select-param #selected.btn.btn-primary {
  background-color: blue;
  color: white;
  border: 1px solid blue;
}

</style>
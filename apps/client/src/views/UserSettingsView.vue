<script setup>

import axios from "axios";
import { onMounted } from 'vue';
import  { useUserInfoStore } from '../stores/userInfo'
import  { ref } from 'vue'
import { useTokenStore } from '../stores/auth'
import { computed } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";

const loaded = ref(false);

const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();

const token = ref('');

const userId = ref('');
const userData = ref('');

const changed = ref(false);
const savedMessage = ref('');
const newFactCheckedRate = ref('');
const newDiversityRate = ref('');

async function updateUserParams() {
    savedMessage.value = 'Saving...';
    let updatedInfo = { parameters : { rateFactChecked: newFactCheckedRate.value, rateDiversification: newDiversityRate.value}};
    userData.value = (await axios.post('/user/update', updatedInfo)).data;
    changed.value = false;
    savedMessage.value = 'Settings saved !';
}

function handleFactCheckRateChange(event) {
    newFactCheckedRate.value = event.target.value;
    changed.value = true;
    savedMessage.value = '';
}

function handleDiversityRateChange(event) {
    newDiversityRate.value = event.target.value;
    changed.value = true;
    savedMessage.value = '';
}

onMounted(async () => {
    //recover user id
    console.log("before axios" + userData.value)
    const userInfo = userInfoStore.getUserInfo;
    userId.value = userInfo._id;
    token.value = computed(() => tokenStore.getToken).value;

    //get all info
    userData.value = (await axios.get('/user/' + userId.value)).data;
    console.log("after axios" + userData.value);
    //important not to crush values saved in the db in case user clicks on "valider"
    newFactCheckedRate.value = userData.value.parameters.rateFactChecked;
    newDiversityRate.value = userData.value.parameters.rateDiversification;
    loaded.value = true;
    console.log("loaded" + loaded.value);
});

</script>

<template>
    <AppHeader></AppHeader>

    <div class="content" v-if="loaded">
        <section>
            <h1 class="section-title">Profile</h1>

            <div class="subsection">
                <h2 class="subsection-title">Personal information</h2>
                
                <div class="field">
                    <p class="field-title">Name</p>
                    <input class="field-content" disabled :value="userData.name + ' ' + userData.surname" />
                </div>
                <div class="field">
                    <p class="field-title">Email</p>
                    <input class="field-content" disabled :value="userData.mail" />
                </div>
                <div class="field" v-if="userData.factChecker">
                    <p class="field-title">Organization</p>
                    <input class="field-content" disabled :value="userData.organization" />
                </div>
            </div>
        </section>

        <section>
            <h1 class="section-title">Settings</h1>

            <p class="std text">Here, you can choose the way you want the public feed to look like</p>
            <div class="subsection">
                <h2 class="subsection-title">Feed</h2>

                <div>
                    <div class="field">
                        <p class="field-title">Fact-checking <span class="field-value">{{newFactCheckedRate}} %</span></p>
                        <input class="field-content" type="range" min="0" max="100" step="10" :value="newFactCheckedRate" @change="handleFactCheckRateChange" @input="handleFactCheckRateChange" />
                    </div>
                    <p class="field-info">Set the rate of fact-checked posts in your feed</p>
                </div>
                <div>
                    <div class="field">
                        <p class="field-title">Diversity <span class="field-value">{{newDiversityRate}} %</span></p>
                        <input class="field-content" type="range" min="0" max="100" step="10" :value="newDiversityRate" @change="handleDiversityRateChange" @input="handleDiversityRateChange" />
                    </div>
                    <p class="field-info">Set the rate of posts that will be out of your current interest centers (sounds exciting !)</p>
                </div>
            </div>
            
            <div class="submit">
                <button class="button" @click="updateUserParams" :disabled="!changed">Save</button>
                <p class="submit-message">{{ savedMessage }}</p>
            </div>
        </section>


        <!-- <div v-if="loaded" class="panel profile">
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
                            <div class="validate-button"><button class="button" @click="updateUserParams">Valider</button></div>
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
                            <div class="validate-button"><button class="button" @click="updateUserParams">Valider</button></div>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->
    </div>
</template>

<style scoped>

h1, h2, h3, h4, h5, h6, p {
    margin: 0;
}

.content {
    padding-top: 70px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 94px 12px 24px 12px;
    max-width: 800px;
    margin: 0 auto;
}

section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.subsection {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.field {
    display: flex;
    gap: 12px;
}

.field .field-title {
    width: 33%;
    max-width: 200px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.75);
}

.field > input {
    flex-grow: 1;
}

.field-info {
    font-size: 0.85em;
    opacity: 0.75;
    font-style: italic;
}

.field-value {
    background-color: rgb(110, 110, 110);
    color: white;
    padding: 3px 8px;
    font-size: 0.8em;
    border-radius: 100px;
    white-space: nowrap;
}

.submit {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.submit button {
    width: 150px;
}

.submit-message {
    font-size: 0.85em;
    font-style: italic;
}

</style>
<script setup>

import axios from "axios";
import { onMounted } from 'vue';
import  { useUserInfoStore } from '../stores/userInfo'
import  { ref } from 'vue'
import { useTokenStore } from '../stores/auth'
import { computed } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppLayout from "@/components/common/AppLayout.vue";

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
    const userInfo = userInfoStore.getUserInfo;
    userId.value = userInfo._id;
    token.value = computed(() => tokenStore.getToken).value;

    //get all info
    userData.value = (await axios.get('/user/' + userId.value)).data;
    //important not to crush values saved in the db in case user clicks on "valider"
    newFactCheckedRate.value = userData.value.parameters.rateFactChecked;
    newDiversityRate.value = userData.value.parameters.rateDiversification;
    loaded.value = true;
});

</script>

<template>
    <AppLayout>
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
                    <button class="btn btn-primary" @click="updateUserParams" :disabled="!changed">Save</button>
                    <p class="submit-message">{{ savedMessage }}</p>
                </div>
            </section>
        </div>
    </AppLayout>
</template>

<style scoped>

h1, h2, h3, h4, h5, h6, p {
    margin: 0;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px 12px;
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
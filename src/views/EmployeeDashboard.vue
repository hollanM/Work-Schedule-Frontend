<script setup>
import { ref, onMounted, computed } from "vue";
import store from "../store/store"
import userServices from "../services/userServices";
import shiftServices from "../services/shiftServices";
const shifts = ref([]);
const user = ref({});

const userSession = computed(() => store.getters.getLoginUserInfo);
console.log(userSession.value);

async function getShifts(){
    console.log("user id: ", user.value.id)
    const response = await shiftServices.getForUser(user.value.id);
    shifts.value = response.data;
    console.log("shifts", shifts.value);
}

async function getCurrentUser(){
    //this guard is not needed, session works as intended.
    console.log('userSession.value:', userSession.value);
    if (!userSession.value || !userSession.value.userId) {
      console.log('No user session or userId');
      return;
    }
    const response = await userServices.get(userSession.value.userId);
    user.value = response.data;
}


onMounted(async () =>{
    await getCurrentUser();
    await getShifts();
})

</script>

<template>
    <v-container>
        <h1 class = "header-text">Your Shifts</h1>
       <v-row>
        <v-card
        v-for="shift in shifts"
        >
            <span>
                {{ shift.user_id }}
            </span>
        </v-card>
       </v-row>
    </v-container>
</template>

<style scoped>


.header-text{
    color: rgb(134, 134, 134);
    margin: 0;
    padding: 0;
}

</style>
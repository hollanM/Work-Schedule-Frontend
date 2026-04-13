





<script setup>
import SocialLogin from "../components/SocialLogin.vue";
import { ref, computed } from "vue";
import store from "../store/store"
import { useRouter } from "vue-router";
import userServices from "../services/userServices";


const router = useRouter();
const role = ref("");

const userSession = computed(() => store.getters.getLoginUserInfo);
console.log(userSession.value);


async function routeUser(){
    console.log(role.value)
    const response = await userServices.update(userSession.value.userId, {role: role.value});
    console.log("response", response);
    role.value === "Employee" ? router.push({ name: "employee-dashboard" }) : router.push({ name: "schedules" });
}
</script>

<template>
  <v-container fluid class="login-bg fill-height pa-0">
      <div class="bg-image"></div>
    <!-- Centered Login Area -->
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">


              <v-card class="pa-6 rounded-xl" elevation="6">
            <h3> Select your Role</h3>
         <v-radio-group v-model="role">
            <v-radio  label="Employee" value="Employee"></v-radio>
            <v-radio  label="Manager" value="Manager"></v-radio>
            </v-radio-group>
            <v-btn class="create-button" @click="routeUser()">
            Continue
        </v-btn>






        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-bg {
  position: relative;
  overflow: hidden;

  background: linear-gradient(
    120deg,
    #7a0c0c,
    #9f2a2a,
    #9d7676,
    #924c4c,
    #7a0c0c,
    #7a0c0c
  );
  background-size: 400% 400%;
  animation: gradientMove 14s ease infinite;
}

/* IMAGE LAYER */
.bg-image {
  position: absolute;
  inset: 0;

  background: url('/_OC-Logo-SmallMark1-White-onlyOC.png') right/contain no-repeat;

  opacity: 0.75;        
  z-index: 0;
}

/* optional tint overlay */
.login-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1;
}


/* content stays above everything */
.login-bg > *:not(.bg-image) {
  position: relative;
  z-index: 2;
}

@keyframes gradientMove {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


/* .login-bg {
  background: linear-gradient(
    135deg,
    #eef2ff 0%,
    #f8fafc 40%,
    #ffffff 100%
  );
}

.login-bg {
  position: relative;
  background: url('/login-bg.jpg') center/cover no-repeat;
}

.login-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(20, 30, 50, 0.45);
}


.login-bg > * {
  position: relative;
  z-index: 1;
} */

.create-button{
    background-color: #4CAF50;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 50px;
    width: fit-content;
    height: fit-content;
}


</style>































































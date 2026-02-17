<script setup>
import ocLogo from "/oc-logo-white.png";
import Attendance from "/Attendance.png";
import Bell from "/Bell.png";
import Dashboard from "/Dashboard.png";
import Inbox from "/Inbox.png";
import Schedule from "/Schedule.png";
import Settings from "/Settings.png";
import { ref, onMounted } from "vue";
import Utils from "../config/utils";
import AuthServices from "../services/authServices";
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const user = ref(null);
const title = ref("Tutorials");
const initials = ref("");
const name = ref("");
const logoURL = ref("");

const resetMenu = () => {
  user.value = null;
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  }
};

const logout = () => {
  AuthServices.logoutUser(user.value)
    .then((response) => {
      
      Utils.removeItem("user");
      router.push({ name: "login" });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

onMounted(() => {
  logoURL.value = ocLogo;
  resetMenu();
});
</script>

<template>
  <div app>
    <v-app-bar id="app-bar">
      <div id="Bell_Div" v-if="user" class="container">
        <div>
          <router-link :to="{ name: '' }">
            <v-img class="image" id="Bell_img" :src="Bell" height="50" width="50" contain></v-img>
          </router-link>
        </div>
      </div>
      <div id="Dashboard_Div" v-if="user" class="container">
        <div>
          <router-link :to="{ name: '' }">
            <v-img class="image" id="Dashboard_img" :src="Dashboard" height="50" width="50" contain></v-img>
          </router-link>
        </div>
        <p id="Dashboard_p"> DashBoard </p>
      </div>
      <div id="Schedule_Div" v-if="user" class="container">
        <div flex="1">
          <router-link :to="{ name: '' }">
            <v-img class="image" id="Schedule_img" :src="Schedule" height="50" width="50" contain></v-img>
          </router-link>
        </div>
        <p id="Schedule_p"> Schedule </p>
      </div>
      <div id="Attendance_Div" v-if="user" class="container">
      <div>
        <router-link :to="{ name: '' }">
          <v-img class="image" id="Attendance_img" :src="Attendance" height="50" width="50" contain></v-img>
        </router-link>
      </div>
      <p id="Attendance_"> Attendance </p>
      </div>
      <v-spacer></v-spacer>
      <div v-if="user">
        <v-btn class="mx-2" :to="{ name: 'tutorials' }"> List </v-btn>
        <v-btn class="mx-2" :to="{ name: 'add' }"> Add Tutorial </v-btn>
      </div>
      <v-menu bottom min-width="200px" rounded offset-y v-if="user">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon x-large>
            <v-avatar v-if="user" color="secondary">
              <span class="accent--text font-weight-bold">{{ initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="secondary" class="mt-2 mb-2">
                <span class="accent--text font-weight-bold">{{  initials  }}</span>
              </v-avatar>
              <h3>{{ name }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text @click="logout"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<style>
.container 
{
  cursor: pointer; 
}

#app-bar 
{
  /*background-color: rgb(60, 60, 60);*/
}

#Bell_Div
{
  background-color: rgba(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Dashboard_Div
{
  background-color: rgba(60, 60, 60);
  color: rgb(193, 193, 193);
}


#Dashboard_Div:hover
{
  filter: brightness(50%); 
}

#Schedule_Div
{
  background-color: rgba(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Attendance_Div
{
  background-color: rgba(60, 60, 60);
  color: rgb(193, 193, 193);
}
</style>

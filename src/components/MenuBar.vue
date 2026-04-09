

<script setup>
import ocLogo from "/oc-logo-white.png";
import Attendance from "/Attendance.png";
import Bell from "/Bell.png";
import Dashboard from "/Dashboard.png";
import Inbox from "/Inbox.png";
import Schedule from "/Schedule.png";
import Settings from "/Settings.png";
import Dropdown_Arrow from "/Dropdown-arrow.png";
import LockAsTerminal from "/LockAsTerminal.png";
import Logout from "/Logout.png";
import MyAvailability from "/MyAvailability.png";
import MySchedule from "/MySchedule.png";
import Profile from "/ProfileAndSettings.png";
import SwitchWorkplaces from "/SwitchWorkplaces.png";
import timesheets from "/timesheets.png";
import TimeTracker from "/TimeTracker.png";

import { ref, onMounted } from "vue";
import Utils from "../config/utils";
import AuthServices from "../services/authServices";
import { useRouter, useRoute } from 'vue-router'
import store from "../store/store"
import {computed, watch} from "vue";
import userServices from "../services/userServices";


const router = useRouter()
const user = ref(null);
const title = ref("Tutorials");
const initials = ref("");
const name = ref("");
const logoURL = ref("");
const role = ref("")

const resetMenu = () => {

  user.value = null;
  user.value = Utils.getStore("user");
  console.log("user in menu bar", user.value);
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
    Profile_Items.value[0].route.params.id = user.value.userId;
  userServices.get(user.value.userId)
      .then((response) => {
        const data = response.data;
        role.value = data.role;
        store.commit("setLoginUser", user.value); 
        Utils.setStore("user", user.value);
      })
      .catch((error) => {
        console.log("error", error);
      });

  }
};


const logout = () => {
  AuthServices.logoutUser(user.value)
    .then((response) => {
      store.commit("setLoginUser", null);
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

const Dashboard_Open = ref(false);
const Dashboard_Items = ref([
  { title: 'Home', route: { name: 'schedules' }, photo: Dashboard },
]);
const Schedule_Open = ref(false);
const Schedule_Items = ref([
  { title: 'Work Schedule', route: { name: '' }, photo: Schedule },
  { title: 'Preferences', route: { name: '' }, photo: Schedule},
]);
const Attendance_Open = ref(false);
const Attendance_Items = ref([
  { title: 'Time Sheets', click: '', photo: timesheets },
  { title: 'Time Tracker', click: '', photo: TimeTracker },
  { title: 'Lock as Terminal', click: '', photo: LockAsTerminal },
]);
const Inbox_Open = ref(false);
const Inbox_Items = ref([
  { title: 'Inbox', click: '', photo: Inbox },
]);
const Settings_Open = ref(false);
const Settings_Items = ref([
  { title: 'Profile', click: '',photo: Profile }, //we need to have functions now instead of router links here
  { title: 'Settings', click: '', photo: Settings },
  { title: 'My Schedule', click: '', photo: MySchedule },
  { title: 'My Availability', click: '', photo: MyAvailability },
  { title: 'Switch Workspaces', click: '', photo: SwitchWorkplaces },
]);

const Profile_Open = ref(false);
const Profile_Items = ref([
  { title: 'Edit Profile', route: { name: 'editProfile', params: { id: user.value?.userId } }, photo: Profile },
  { title: 'Logout', action: 'logout', photo: Logout }, // CHANGED: never actually logged out, instead just redirected to login page.
]);


const handleSettingsItemClick = (item) => {
  if (item.click === '') 
  {

  } else if (item.route?.name) 
  {

  }
};
</script>

<template>
  <div app>
    <v-app-bar id="app-bar">
      <div id="Bell_Div" v-if="user" class="container">
        <div>
          <router-link :to="{ name: '' }">
            <v-img class="image" id="Bell_img" :src="Bell" height="40" width="40" contain></v-img>
          </router-link>
        </div>
      </div>
      <v-menu v-if="user && role === 'Manager'" v-model="Dashboard_Open" transition="slide-y-transition">
        <template #activator="{ props }">
          <v-btn id="Dashboard_Div" class="container" v-bind="props">
            <v-img id="image" :src="Dashboard" height="40" width="40" contain/>
            <span>Dashboard</span>
            <img :src="Dropdown_Arrow" height="25" width="25" :style="{transform: Dashboard_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"/>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Dashboard_Item, index) in Dashboard_Items" :key="index" :to="Dashboard_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-img :src="Dashboard_Item.photo" width="24" height="24" contain/>
            </template>
            <v-list-item-title>
              {{ Dashboard_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu v-if="user && role === 'Manager'" v-model="Schedule_Open" transition="slide-y-transition" >
        <template #activator="{ props }">
          <v-btn id="Schedule_Div" class="container" v-bind="props">
            <v-img id="image" :src="Schedule" height="40" width="40" contain/>
            <span>Schedule</span>
            <img :src="Dropdown_Arrow" height="25" width="25" :style="{transform: Schedule_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"/>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Schedule_Item, index) in Schedule_Items" :key="index" :to="Schedule_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-img :src="Schedule_Item.photo" width="24" height="24" contain/>
            </template>
            <v-list-item-title>
              {{ Schedule_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu v-if="user && role === 'Manager'" v-model="Attendance_Open" transition="slide-y-transition">
        <template #activator="{ props }">
          <v-btn id="Attendance_Div" class="container" v-bind="props">
            <v-img id="image" :src="Attendance" height="40" width="40" contain/>
            <span>Attendance</span>
            <img :src="Dropdown_Arrow" height="25" width="25" :style="{transform: Attendance_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"/>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Attendance_Item, index) in Attendance_Items" :key="index" :to="Attendance_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-img :src="Attendance_Item.photo" width="24" height="24" contain/>
            </template>
            <v-list-item-title>
              {{ Attendance_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-spacer></v-spacer>
      <v-menu v-model="Inbox_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Inbox_Div" class="container" v-bind="props">
            <v-img id="image" :src="Inbox" height="40" width="40" contain/>
            <span>Inbox</span>
            <img :src="Dropdown_Arrow" height="25" width="25" :style="{transform: Inbox_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"/>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Inbox_Item, index) in Inbox_Items" :key="index" :to="Inbox_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-img :src="Inbox_Item.photo" width="24" height="24" contain/>
            </template>
            <v-list-item-title>
              {{ Inbox_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu class="v-menu" v-model="Settings_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Settings_Div" class="container" v-bind="props">
            <v-img id="Settings_Image" :src="Settings" height="40" width="40" contain/>
            <span>Settings</span>
            <img :src="Dropdown_Arrow" height="25" width="25" :style="{transform: Settings_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"/>
          </v-btn>
        </template>
        <v-list class="dropdown">    
          <v-list-item v-for="(Settings_Item, index) in Settings_Items" :key="index" @click="handleSettingsItemClick(Settings_Item)" class="dropdown-menu">
            <template #prepend>
              <v-img :src="Settings_Item.photo" width="24" height="24" contain/>
            </template>
            <v-list-item-title>
              {{ Settings_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- <v-menu bottom min-width="200px" rounded offset-y v-if="user">
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
      </v-menu> -->

      <v-menu v-model="Profile_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Profile_Div" class="container" v-bind="props">
            <v-img id="Profile_Image" :src="user.profileImage" height="40" width="40" cover class="profile-round"/>
            <span>Profile</span>

            <img :src="Dropdown_Arrow" height="25" width="25" :style="{ transform: Profile_Open ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s ease'}"/>
          </v-btn>
        </template>

        <v-list class="dropdown">
          <v-list-item
            v-for="(Profile_Item, index) in Profile_Items"
            :key="index"
            :to="Profile_Item.route"
            class="dropdown-menu"
            @click="Profile_Item.action === 'logout' ? logout() : null"
          >
            <template #prepend>
              <v-img :src="Profile_Item.photo" width="24" height="24" contain />
            </template>

            <v-list-item-title>{{ Profile_Item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

    </v-app-bar>
  </div>
</template>

<style>
.container 
{
  display: flex;
  align-items: center;
  gap: 8px; 
  cursor: pointer; 
  height: 100%;
  padding: .1vw;
  min-height: 64px; /*might need to be dynamic later but works for now (height of the app-bar)*/
}

.dropbtn
{
  transform: rotate(90deg); /*arrow is initally on its side, and will rotate when clicked on*/
}

.dropdown {
  padding-top: 0;
  position: relative;
  display: inline-block;
  background-color: rgb(76, 76, 76) !important; /*this is the color behind the buttons (not the button background)*/
}

.dropdown-menu {
  background-color: rgb(40, 40, 40) !important; /*!important is the difference between this working and not*/
  color: rgb(193, 193, 193) !important; /*at this point i think it is overwriting the list when the other normally happens*/
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  padding: 0.1vw;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dropdown-menu:hover
{
  filter: brightness(60%); 
}

.v-menu
{
  height: 100%;
}

#app-bar 
{
  background-color: rgb(60, 60, 60);
  overflow: visible; /*lets the dropdown extend over the bottom of the app bar*/
}

#Bell_Div
{
  background-color: rgb(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Bell_Div:hover
{
  filter: brightness(50%); 
}

#Dashboard_Div
{
  background-color: rgb(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Dashboard_Div:hover
{
  filter: brightness(50%); 
}

#Schedule_Div
{
  background-color: rgb(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Schedule_Div:hover
{
  filter: brightness(50%); 
}

#Attendance_Div
{
  background-color: rgb(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Attendance_Div:hover
{
  filter: brightness(50%); 
}

#Inbox_Div
{
  background-color: rgb(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Inbox_Div:hover
{
  filter: brightness(50%); 
}

#Settings_Div
{
  background-color: rgb(60, 60, 60);
  color: rgb(193, 193, 193); 
}

#Settings_Div:hover
{
  filter: brightness(50%); 
}

#Profile_Div {
  background-color: rgb(60, 60, 60);
  color: rgb(193, 193, 193);
}

#Profile_Image {
  flex-shrink: 0;
}

#Profile_Div:hover {
  filter: brightness(50%);
}

.profile-round {
  border-radius: 50%;
}

</style>

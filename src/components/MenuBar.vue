<script setup>
import ocLogo from "/oc-logo-white.png";
import Bell from "/Bell.png";
import Dropdown_Arrow from "/Dropdown-arrow.png";

import { ref, computed,onMounted } from "vue";
import Utils from "../config/utils";
import AuthServices from "../services/authServices";
import { useRouter, useRoute } from 'vue-router'
import userServices from "../services/userServices";
import store from "../store/store"

const router = useRouter()
const user = ref(null);
const title = ref("Tutorials");
const initials = ref("");
const name = ref("");
const logoURL = ref("");
//need for the disablement of parts of the UI
const userSession = computed(() => store.getters.getLoginUserInfo);
const currentUser = ref([]);
const isManager = computed(() => currentUser.value && currentUser.value.role === 'Manager'); //needed this because user is null till the backend responds


const resetMenu = () => {
  user.value = null;
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
    Profile_Items.value[0].route.params.id = user.value.userId;
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

const Dashboard_Open = ref(false);
const Dashboard_Items = ref([
  { title: 'Home', route: { name: 'schedules' }, photo: Dashboard }, //turn into button
]);
const Schedule_Open = ref(false);
const Schedule_Items = ref([
  { title: 'Work Schedule', route: { name: '' }, photo: Schedule }, //turn into button
  //{ title: 'Preferences', route: { name: '' }, photo: Schedule},
]);
const Attendance_Open = ref(false);
const Attendance_Items_Employee = ref([
  { title: 'Time Tracker', click: '', photo: TimeTracker }, //alwase visible
]);
const Attendance_Items_Manager = ref([
  { title: 'Time Sheets', click: '', photo: timesheets }, //manager only
  { title: 'Time Tracker', click: '', photo: TimeTracker }, //alwase visible
  { title: 'Lock as Terminal', click: '', photo: LockAsTerminal }, //manager only
]);
const Inbox_Open = ref(false);
const Inbox_Items = ref([
  { title: 'Inbox', click: '', photo: Inbox }, //merge with the bell icon
]);
const Settings_Open = ref(false);
const Settings_Items = ref([ //need to merge this with the profile button eventually
  //{ title: 'Profile', click: '',photo: Profile },
  { title: 'Settings', click: '', photo: Settings },
  { title: 'My Schedule', click: '', photo: MySchedule },
  { title: 'My Availability', click: '', photo: MyAvailability },
  //{ title: 'Switch Workspaces', click: '', photo: SwitchWorkplaces },
]);

const Profile_Open = ref(false);
const Profile_Items = ref([
  { title: 'Edit Profile', route: { name: 'editProfile', params: { id: user.value?.userId } }, photo: Profile },
  { title: 'My Schedule', click: '', photo: MySchedule },
  { title: 'My Availability', click: '', photo: MyAvailability },
  { title: 'Switch Workspaces', click: '', photo: SwitchWorkplaces },
  { title: 'Logout', action: 'logout', photo: Logout }, 
]);

async function getCurrentUser(){
    //this guard is not needed, session works as intended.
    //console.log('userSession.value:', userSession.value);
    if (!userSession.value || !userSession.value.userId) {
      console.log('No user session or userId');
      return;
    }
    const response = await userServices.get(userSession.value.userId);
    currentUser.value = response.data;
    console.log('Current user data:', currentUser.value);
}

onMounted(async () => {
  await getCurrentUser(); //I need the current user for the v-ifs to disable pieces between manager and employee
  logoURL.value = ocLogo;
  resetMenu();
});


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
      
      <v-menu v-model="Dashboard_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Dashboard_Div" class="container" v-bind="props">
            <v-icon icon="mdi-view-dashboard"></v-icon>
            <span>Dashboard</span>
            <v-icon icon="mdi-chevron-right" :style="{transform: Dashboard_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"></v-icon>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Dashboard_Item, index) in Dashboard_Items" :key="index" :to="Dashboard_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-icon :icon="Dashboard_Item.icon" size="small"></v-icon>
            </template>
            <v-list-item-title>
              {{ Dashboard_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu v-model="Schedule_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Schedule_Div" class="container" v-bind="props">
            <v-icon icon="mdi-calendar-month"></v-icon>
            <span>Schedule</span>
            <v-icon icon="mdi-chevron-right" :style="{transform: Schedule_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"></v-icon>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Schedule_Item, index) in Schedule_Items" :key="index" :to="Schedule_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-icon :icon="Schedule_Item.icon" size="small"></v-icon>
            </template>
            <v-list-item-title>
              {{ Schedule_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu v-model="Attendance_Open" transition="slide-y-transition" v-if="!isManager">
        <template #activator="{ props }">
          <v-btn id="Attendance_Div" class="container" v-bind="props">
            <v-icon icon="mdi-clipboard-list"></v-icon>
            <span>Attendance</span>
            <v-icon icon="mdi-chevron-right" :style="{transform: Attendance_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"></v-icon>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Attendance_Item, index) in Attendance_Items_Employee" :key="index" :to="Attendance_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-img :src="Attendance_Item.photo" width="24" height="24" contain/>
            </template>
            <v-list-item-title>
              {{ Attendance_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu v-model="Attendance_Open" transition="slide-y-transition" v-if="isManager">
        <template #activator="{ props }">
          <v-btn id="Attendance_Div" class="container" v-bind="props">
            <v-img id="image" :src="Attendance" height="40" width="40" contain/>
            <span>Attendance</span>
            <img :src="Dropdown_Arrow" height="25" width="25" :style="{transform: Attendance_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"/>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Attendance_Item, index) in Attendance_Items_Manager" :key="index" :to="Attendance_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-icon :icon="Attendance_Item.icon" size="small"></v-icon>
            </template>
            <v-list-item-title>
              {{ Attendance_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-spacer></v-spacer>
      <!-- <v-menu v-model="Inbox_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Inbox_Div" class="container" v-bind="props">
            <v-icon icon="mdi-inbox"></v-icon>
            <span>Inbox</span>
            <v-icon icon="mdi-chevron-right" :style="{transform: Inbox_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"></v-icon>
          </v-btn>
        </template>
        <v-list class="dropdown">
          <v-list-item v-for="(Inbox_Item, index) in Inbox_Items" :key="index" :to="Inbox_Item.route" class="dropdown-menu">
            <template #prepend>
              <v-icon :icon="Inbox_Item.icon" size="small"></v-icon>
            </template>
            <v-list-item-title>
              {{ Inbox_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- <v-menu class="v-menu" v-model="Settings_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Settings_Div" class="container" v-bind="props">
            <v-icon icon="mdi-cog"></v-icon>
            <span>Settings</span>
            <v-icon icon="mdi-chevron-right" :style="{transform: Settings_Open ? 'rotate(0deg)' : 'rotate(90deg)',transition: 'transform 0.2s ease'}"></v-icon>
          </v-btn>
        </template>
        <v-list class="dropdown">    
          <v-list-item v-for="(Settings_Item, index) in Settings_Items" :key="index" @click="handleSettingsItemClick(Settings_Item)" class="dropdown-menu">
            <template #prepend>
              <v-icon :icon="Settings_Item.icon" size="small"></v-icon>
            </template>
            <v-list-item-title>
              {{ Settings_Item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
      
      <!-- @@!!!!!Hollan is hiding the settings dropdown since it is no longer needed!!!!!@@ -->


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
      <!-- This was orginal profile with logout. Hollan has this for a reference -->

      <v-menu v-model="Profile_Open" transition="slide-y-transition" v-if="user">
        <template #activator="{ props }">
          <v-btn id="Profile_Div" class="container" v-bind="props">
            <v-avatar v-if="user.profileImage" size="40" class="profile-avatar">
              <v-img :src="user.profileImage" cover/>
            </v-avatar>
            <v-avatar v-else size="40" class="profile-avatar">
              <span>{{ initials }}</span>
            </v-avatar>
            <span>Profile</span>
            <v-icon icon="mdi-chevron-right" :style="{ transform: Profile_Open ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s ease'}"></v-icon>
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
              <v-icon :icon="Profile_Item.icon" size="small"></v-icon>
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
  min-height: 64px;
}

.dropdown {
  padding: 0;
  position: relative;
  display: inline-block;
  background-color:  rgb(17, 26, 37)  !important;
}

.dropdown-menu {
  background-color: rgb(17, 26, 37) !important;
  color: rgb(193, 193, 193) !important;
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
  background-color: rgb(32, 46, 62);
  overflow: visible;
}

#Bell_Div
{
  background-color: rgb(32, 46, 62);
  color: rgb(193, 193, 193);
}

#Bell_Div:hover
{
  filter: brightness(50%); 
}

#Dashboard_Div
{
  background-color: rgb(32, 46, 62);
  color: rgb(193, 193, 193);
}

#Dashboard_Div:hover
{
  filter: brightness(50%); 
}

#Schedule_Div
{
  background-color: rgb(32, 46, 62);
  color: rgb(193, 193, 193);
}

#Schedule_Div:hover
{
  filter: brightness(50%); 
}

#Attendance_Div
{
  background-color: rgb(32, 46, 62);
  color: rgb(193, 193, 193);
}

#Attendance_Div:hover
{
  filter: brightness(50%); 
}

#Inbox_Div
{
  background-color: rgb(32, 46, 62);
  color: rgb(193, 193, 193);
}

#Inbox_Div:hover
{
  filter: brightness(50%); 
}

#Settings_Div
{
  background-color: rgb(32, 46, 62);
  color: rgb(193, 193, 193); 
}

#Settings_Div:hover
{
  filter: brightness(50%); 
}

#Profile_Div {
  background-color: rgb(32, 46, 62);
  color: rgb(193, 193, 193);
}

#Profile_Div:hover {
  filter: brightness(50%);
}

.profile-avatar {
  flex-shrink: 0;
  border-radius: 50%;
}

</style>
<script setup>
import { ref } from 'vue'

const user = ref(null);
const drawer = ref(true)


function toggle(){
  drawer.value = !drawer.value
}

const resetMenu = () => {
  user.value = null;
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  }
};

// these don't do anything yet, just placeholders for the UI
const menuItems = [
  { name: 'Schedule', icon: '', to: '/schedules' },
  { name: 'View Options', icon: '', to: '' },
  { name: 'Positions', icon: '', to: '' },
  { name: 'Tags', icon: '', to: '' },
  { name: 'Job Sites', icon: '', to: '' },
  { name: 'Task Lists', icon: '', to: '' },
]

// Dropdown state for schedule name (UI-only, no behavior yet)
const selectedSchedule = ref(null)
const scheduleOptions = [
  'Default Schedule',
  'Morning Shift',
  'Evening Shift',
]

// View Options collapsible state (UI-only)
const viewOptionsOpen = ref(false)
const viewOptions = [
  'placeholder',
  'placeholder',
  'placeholder',
]

const viewTagsOpen = ref(false)
const tagsOptions = [
  'placeholder',
  'placeholder',
  'placeholder',
]

const viewJobSitesOpen = ref(false)
const jobSiteOptions = [
  'placeholder',
  'placeholder',
  'placeholder',
]
const viewTaskListsOpen = ref(false)
const taskListOptions = [
  'placeholder',
  'placeholder',
  'placeholder',
]


</script>

<template>
   
  <v-navigation-drawer
    v-model="drawer"
    app
    class = "drawer"
  >
   
    <v-list nav>
      <!-- schedule menu items -->
      <v-list-item 
        v-for="item in menuItems"
        :key="item.name"
        :to="item.to || undefined"
        v-bind:router="!!item.to"
        @click="item.name === 'View Options' ? viewOptionsOpen = !viewOptionsOpen : (item.name === 'Tags' ? viewTagsOpen = !viewTagsOpen : (item.name === 'Job Sites' ? viewJobSitesOpen = !viewJobSitesOpen : (item.name === 'Task Lists' ? viewTaskListsOpen = !viewTaskListsOpen : null)))"
      >
        <template #prepend>
          <v-icon :icon="item.icon" />
        </template>

        <v-list-item-title>
          {{ item.name }}
        </v-list-item-title>

        <!-- schedule drop down -->
        <template v-if="item.name === 'Schedule'">
          <v-list dense>
            <v-list-item>
              <v-select
                v-model="selectedSchedule"
                :items="scheduleOptions"
                label="Schedule Name"
                dense
                hide-details
                solo
              />
            </v-list-item>
          </v-list>
        </template>

        <!-- Options drop down -->
        <template #append v-if="item.name === 'View Options'">
          <v-icon :icon="viewOptionsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </template>

        <template v-if="item.name === 'View Options'">
          <v-list v-show="viewOptionsOpen" dense>
            <v-list-item v-for="opt in viewOptions" :key="opt">
              <v-list-item-title>{{ opt }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </template>

        <!-- tags drop down -->
        <template #append v-if="item.name === 'Tags'">
          <v-icon :icon="viewTagsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </template>

        <template v-if="item.name === 'Tags'">
          <v-list v-show="viewTagsOpen" dense>
            <v-list-item v-for="opt in tagsOptions" :key="opt">
              <v-list-item-title>{{ opt }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </template>

        <!-- Job Sites drop down -->
        <template #append v-if="item.name === 'Job Sites'">
          <v-icon :icon="viewJobSitesOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </template>

        <template v-if="item.name === 'Job Sites'">
          <v-list v-show="viewJobSitesOpen" dense>
            <v-list-item v-for="opt in jobSiteOptions" :key="opt">
              <v-list-item-title>{{ opt }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </template>

        <!-- Task Lists drop down -->
        <template #append v-if="item.name === 'Task Lists'">
          <v-icon :icon="viewTaskListsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </template>

        <template v-if="item.name === 'Task Lists'">
          <v-list v-show="viewTaskListsOpen" dense>
            <v-list-item v-for="opt in taskListOptions" :key="opt">
              <v-list-item-title>{{ opt }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

    <v-btn class="circle-button zero-margin "  @click="toggle()"
    :class="{ closed: !drawer }"
    >
        <v-icon class="ml-3">
          {{ drawer ? 'mdi-chevron-left' : 'mdi-chevron-right' }}
        </v-icon>
    </v-btn>
</template>

<style scoped>
.circle-button{
    background-color: #ff000000;
    color: rgb(148, 148, 148);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 10px !important;
    height: 30px !important;
    min-width: 30px;
    font-size: 20px;
    z-index: 1001;
    position: absolute;
  top: 50%;
  left: 256px; /* drawer width */
  transform: translate(-50%, -50%);
  transition: left 0.25s ease;
}

.closed{
    background-color: #ff000000;
    color: rgb(148, 148, 148);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 10px !important;
    height: 30px !important;
    min-width: 30px;
    font-size: 20px;
    z-index: 1001;
    position: absolute;
  top: 50%;
  left: 0; /* drawer width */
  transform: translate(-50%, -50%);
  transition: left 0.25s ease;
}

.drawer{
  overflow: visible;
}

.zero-margin{
  margin: 0;
}
</style>



<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from 'vue'
import MenuBar from "./components/MenuBar.vue";
import AppSidebar from "./components/AppSidebar.vue";

const drawer = ref(false);
</script>

<template>
  <v-app>
    <MenuBar :key="$route.fullPath" />
    <AppSidebar v-model:drawer="drawer" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

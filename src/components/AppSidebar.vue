<script setup>
import { ref } from 'vue'

defineProps({
  drawer: Boolean
})

defineEmits(['update:drawer'])

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

</script>

<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    app
  >
    <v-list nav>
      <!-- schedule menu items -->
      <v-list-item
        v-for="item in menuItems"
        :key="item.name"
        :to="item.to || undefined"
        v-bind:router="!!item.to"
        @click="item.name === 'View Options' ? viewOptionsOpen = !viewOptionsOpen : null"
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
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

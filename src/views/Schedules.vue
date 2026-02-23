<template>
  <v-container fluid class="pa-6">

    <!-- HEADER -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">
        {{ formattedRange }}
      </h1>

      <div class="d-flex align-center ga-3">

        <v-btn-group divided>
          <v-btn icon="mdi-chevron-left" @click="prevWeek" />
          <v-btn icon="mdi-calendar-month" />
          <v-btn icon="mdi-chevron-right" @click="nextWeek" />
        </v-btn-group>

        <v-btn variant="outlined" @click="goToday">
          TODAY
        </v-btn>

        <v-btn-group divided>
          <v-btn>Week</v-btn>
        </v-btn-group>

        <v-btn icon="mdi-printer" variant="outlined" />
        <v-btn icon="mdi-wrench" variant="outlined" />

      </div>
    </div>

    <!-- TABLE -->
    <v-card>
      <v-table density="comfortable" class="schedule-table">
        <thead>
          <tr>
            <th>Custom</th>
            <th v-for="day in weekDays" :key="day.date">
              {{ day.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- USERS -->
          <tr v-for="user in users" :key="user.id">
            <td class="d-flex align-center">
              <v-avatar size="28" class="mr-2">
                <v-img :src="user.avatar" />
              </v-avatar>
              {{ user.name }}
            </td>

            <td
              v-for="day in weekDays"
              :key="day.date"
              @click="addHour(user.id, day.date)"
              class="clickable"
            >
              <div v-if="user.hours[day.date]">
                {{ user.hours[day.date] }}
              </div>
              <v-icon
                v-else
                size="16"
                color="success"
              >
                mdi-plus
              </v-icon>
            </td>
          </tr>

          <!-- ADD USER -->
          <tr>
            <td>
              <v-btn
                variant="text"
                color="success"
                prepend-icon="mdi-plus-circle-outline"
                @click="addUser"
              >
                ADD USER
              </v-btn>
            </td>
            <td v-for="day in weekDays" :key="'empty-'+day.date"></td>
          </tr>

          <!-- TOTALS -->
          <tr class="bg-grey-lighten-4">
            <td>
              <strong>Assigned Total</strong><br />
              {{ totalHours }} hrs
            </td>

            <td v-for="day in weekDays" :key="'total-'+day.date">
              {{ dayTotals[day.date] || 0 }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { startOfWeek, addDays, format } from 'date-fns'

/* =====================================================
   STATE (will eventually come from backend)
   ===================================================== */

const currentDate = ref(new Date())

// Placeholder data (pretend this came from API)
const users = ref([
  {
    id: 1,
    name: 'Perfect C.',
    avatar: 'https://i.pravatar.cc/40',
    hours: {}
  }
])

/* =====================================================
   WEEK DISPLAY (UI only — backend will control data)
   ===================================================== */

const weekStart = computed(() =>
  startOfWeek(currentDate.value, { weekStartsOn: 1 })
)

const weekDays = computed(() =>
  Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart.value, i)
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE')
    }
  })
)

const formattedRange = computed(() => {
  const start = weekStart.value
  const end = addDays(start, 6)
  return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`
})

/* =====================================================
   API STUBS (replace with axios later)
   ===================================================== */

function apiFetchWeek(direction) {
  console.log('API CALL → fetch week:', direction)
}

function apiFetchToday() {
  console.log('API CALL → fetch current week')
}

function apiAddUser() {
  console.log('API CALL → create new user')
}

function apiUpdateHours(userId, date) {
  console.log('API CALL → update hours:', {
    userId,
    date
  })
}

/* =====================================================
   BUTTON HANDLERS
   ===================================================== */

const prevWeek = () => {
  apiFetchWeek('previous')
}

const nextWeek = () => {
  apiFetchWeek('next')
}

const goToday = () => {
  apiFetchToday()
}

const addUser = () => {
  apiAddUser()
}

const addHour = (userId, date) => {
  apiUpdateHours(userId, date)
}

/* =====================================================
   TOTALS (UI only, safe to keep)
   ===================================================== */

const dayTotals = computed(() => {
  const totals = {}
  weekDays.value.forEach(day => {
    totals[day.date] = users.value.reduce(
      (sum, user) => sum + (user.hours[day.date] || 0),
      0
    )
  })
  return totals
})

const totalHours = computed(() =>
  Object.values(dayTotals.value).reduce((a, b) => a + b, 0)
)
</script>

<style scoped>
.schedule-table th {
  background: #e0e0e0;
  font-weight: 600;
}

.schedule-table td,
.schedule-table th {
  border: 1px solid #cfcfcf;
  text-align: center;
  height: 56px;
}

.schedule-table td:first-child,
.schedule-table th:first-child {
  text-align: left;
  width: 220px;
}

.clickable {
  cursor: pointer;
}
</style>
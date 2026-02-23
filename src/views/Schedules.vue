<script setup>
import { ref, computed } from "vue";
import { startOfWeek, addDays, format } from "date-fns";

/* =====================================================
   STATE (will eventually come from backend)
   ===================================================== */

const currentDate = ref(new Date());

/* =====================================================
    GET USER DATA
   ===================================================== */

const users = ref([]);

const fetchUsers = () => {
  console.log("API CALL → fetch users for manager");
  // Simulate API call and update users.value with response
  users.value = [
    {
      id: 1,
      name: "Perfect C.",
      avatar: "https://i.pravatar.cc/40",
      hours: {
        "2026-02-24": 7,
      },
    },
    {
      id: 2,
      name: "Another User",
      avatar: "https://i.pravatar.cc/",
      hours: {
        "2026-02-24": 4,
        "2026-02-23": 6,
      },
    },
  ];
};

fetchUsers();

/* =====================================================
   WEEK DISPLAY (UI only — backend will control data)
   ===================================================== */

const weekStart = computed(() =>
  startOfWeek(currentDate.value, { weekStartsOn: 1 }),
);

const weekDays = computed(() =>
  Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart.value, i);
    return {
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "EEEE"),
    };
  }),
);

const formattedRange = computed(() => {
  const start = weekStart.value;
  const end = addDays(start, 6);
  return `${format(start, "MMMM d")} - ${format(end, "MMMM d, yyyy")}`;
});

/* =====================================================
   BUTTON HANDLERS
   ===================================================== */

const prevWeek = () => {
  apiFetchWeek("previous");
};

const nextWeek = () => {
  apiFetchWeek("next");
};

const goToday = () => {
  apiFetchToday();
};

const addUser = () => {
  apiAddUser();
};

const assignUser = (userId, date) => {
  apiAssignUser(userId, date);
};

/* =====================================================
   API calls (replace with axios later)
   ===================================================== */

function apiFetchWeek(direction) {
  console.log("API CALL → fetch week:", direction);
}

function apiFetchToday() {
  console.log("API CALL → fetch current week");
}

function apiAddUser() {
  console.log("API CALL → create new user");
}

function apiAssignUser(userId, date) {
  console.log("API CALL → assign user to day:", {
    userId,
    date,
  });
}

/* =====================================================
   TOTALS (UI only, safe to keep)
   ===================================================== */

const dayTotals = computed(() => {
  const totals = {};
  weekDays.value.forEach((day) => {
    totals[day.date] = users.value.reduce(
      (sum, user) => sum + (user.hours[day.date] || 0),
      0,
    );
  });
  return totals;
});

const totalHours = computed(() =>
  Object.values(dayTotals.value).reduce((a, b) => a + b, 0),
);
</script>

<!-- HTML CODE -->
<!--           -->
<!--           -->
<template>
  <v-container fluid class="pa-6">
    <!-- HEADER -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">{{ formattedRange }}</h1>
      <div class="d-flex align-center ga-3">
        <!-- Buttons for week navigation -->
        <v-btn-group divided>
          <v-btn icon="mdi-chevron-left" @click="prevWeek" />
          <v-btn icon="mdi-calendar-month" />
          <v-btn icon="mdi-chevron-right" @click="nextWeek" />
        </v-btn-group>

        <!-- Button for going to today's schedule view -->
        <v-btn variant="outlined" @click="goToday">TODAY</v-btn>

        <!-- Button for viewing entire week schedule -->
        <v-btn-group divided>
          <v-btn>Week</v-btn>
        </v-btn-group>

        <!-- Buttons for printing and options(?) -->
        <v-btn icon="mdi-printer" variant="outlined" />
        <v-btn icon="mdi-wrench" variant="outlined" />
      </div>
    </div>

    <!-- Table View -->
    <v-card>
      <v-table density="comfortable" class="schedule-table">
        <!-- Head of Table
              Shows days and custom tag. (what does custom mean?)-->
        <thead>
          <tr>
            <th>Custom</th>
            <th v-for="day in weekDays" :key="day.date">
              {{ day.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Getting users into tables -->
          <!-- TODO: Make a function that gets all users for the assigned manager -->
          <tr v-for="user in users" :key="user.id">
            <td class="d-flex align-center">
              <v-avatar size="28" class="mr-2">
                <v-img :src="user.avatar" />
              </v-avatar>
              {{ user.name }}
            </td>

            <!-- Assigns user to that day -->
            <!-- TODO: modal popup? Ask Julian -->
            <!-- TODO: Also have a plus sign show when hovering over -->
            <td
              v-for="day in weekDays"
              :key="day.date"
              @click="assignUser(user.id, day.date)"
              class="clickable"
            >
              <!-- If the user has hours for that day, show it -->
              <!-- Else show a plus button to assign. -->
              <div v-if="user.hours[day.date]">
                {{ user.hours[day.date] }}
              </div>
              <v-icon v-else size="16" color="success" class="hover-icon">
                mdi-plus
              </v-icon>
            </td>
          </tr>

          <!-- Adding user -->
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
            <!-- This shows the bars between columns if NO dates are shown. -->
            <td v-for="day in weekDays" :key="'empty-' + day.date"></td>
          </tr>

          <!-- Total Hours  -->
          <tr class="bg-grey-lighten-4">
            <td>
              <strong>Assigned Total</strong><br />
              {{ totalHours }} hrs
            </td>

            <td v-for="day in weekDays" :key="'total-' + day.date">
              {{ dayTotals[day.date] || 0 }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

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

.hover-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.clickable:hover .hover-icon {
  opacity: 1;
}
</style>

<script setup>
import { ref, computed, onMounted } from "vue";
import { startOfWeek, addDays, format } from "date-fns";
import ScheduleShiftModal from "../components/ScheduleShiftModal.vue";
import employeeServices from "../services/employeeServices";
import userServices from "../services/userServices";
import shiftServices from "../services/shiftServices";
import date_timeServices from "../services/date_timeServices";
import addUserModal from "../components/UserModal.vue";

/* =====================================================
   STATE (will eventually come from backend)
   ===================================================== */

const currentDate = ref(new Date());

const shiftsByUserAndDate = computed(() => {
  const map = {}

  for (const shift of shifts.value) {
    const key = `${shift.user_id}-${shift.shiftDate}`
    if (!map[key]) map[key] = []
    map[key].push(shift)
  }

  return map
})

async function reload(){
  await fetchEmployees();
  await loadShifts();
}

const isUserModalOpened = ref(false);

/* =====================================================
    GET USER DATA
   ===================================================== */


const employees = ref([]);
const shifts = ref([]);

//or employees, depending on who you ask...
const fetchEmployees = async() => {
  console.log("API CALL → fetch users for manager");
  // Simulate API call and update users.value with response
  const response = await userServices.getAll(); // Replace with actual API call
 employees.value = response.data; // Assuming the response has a data property with the list of employees
   for (const emp of employees.value) {
      if(emp.role !== "Employee"){
        const index = employees.value.indexOf(emp);
        if (index > -1) {
          employees.value.splice(index, 1);
        }
      }
    }
  console.log("Fetched employees:", employees.value);
  for (const employee of employees.value) {
    employee.avatar = `https://i.pravatar.cc/40?u=${employee.id}`; // Generate avatar URL based on employee ID
    employee.hours = 0;
  }
};



async function loadShifts() {
  const response = await shiftServices.getAll()
  shifts.value = response.data


  for (const shift of shifts.value) {
    if(shift.is_template) continue; // skip templates, they don't have dates
    const start = await date_timeServices.get(shift.start_day_id)
    const end = await date_timeServices.get(shift.end_day_id)

    const dateObj = new Date(start.data.first_date_time)

    shift.shiftDate = dateObj.toISOString().split("T")[0] // yyyy-MM-dd
    shift.formattedTime = `${formatShiftTimeFromISO(start.data.first_date_time)} - ${formatShiftTimeFromISO(end.data.first_date_time)}`;
  }
}

//formating out of iso time format again.
function formatShiftTimeFromISO(isoString) {
  if (!isoString) return "Invalid time";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid time";

  const hours24 = date.getHours(); // local time
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes} ${ampm}`;
}


onMounted(() => {
  fetchEmployees();
  loadShifts();
});
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

const goWeek = () => {
  console.log("Go to week view");
};

const addUser = () => {
  //apiAddUser();
  isUserModalOpened.value = true;
};

//add user modal functions start
const openModal = () => 
{
  isUserModalOpened.value = true;
};
const closeUserModal = () => 
{
  isUserModalOpened.value = false;
};

const userModalSaveButton = () => //this is for the save button in the user modal, will need to submit froms in the future
{

}
//add user modal functions end

const assignUser = (userId, date) => {
  apiAssignUser(userId, date);
};

// Prints the schedule
const printSchedule = () => {
  console.log("Print schedule");
};

// WHAT DO YOU DO
const wrenchOptions = () => {
  console.log("Open options");
};

/* =====================================================
   API calls (replace with axios later)
   :)
   ===================================================== */

// Function to fetch the previous or next week (for week navigation buttons)
function apiFetchWeek(direction) {
  console.log("API CALL → fetch week:", direction);
}

// Function to fetch the current week (for "Today" button)
function apiFetchToday() {
  console.log("API CALL → fetch current week");
}

// Function to create a new user (for now just logs, but will eventually update backend and refresh data)
function apiAddUser() {
  console.log("API CALL → create new user");
}

// Function to assign a user to a specific day (for now just logs, but will eventually update backend and refresh data)
function apiAssignUser(userId, date) {
  console.log("API CALL → assign user to day:", {
    userId,
    date,
  });
}

/* =====================================================
   TOTALS (UI only, safe to keep)
   ===================================================== */

// const dayTotals = computed(() => {
//   const totals = {};
//   weekDays.value.forEach((day) => {
//     totals[day.date] = users.value.reduce(
//       (sum, user) => sum + (user.hours[day.date] || 0),
//       0,
//     );
//   });
//   return totals;
// });

// const totalHours = computed(() =>
//   Object.values(dayTotals.value).reduce((a, b) => a + b, 0),
// );


/* =====================================================
   Modal Logic (Julian's form changes)
   ===================================================== */

   const showModal = ref(false);
   const date = ref("");/*modal props*/
   const employeeName = ref("");/*modal props*/

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
          <v-btn @click="goWeek">Week</v-btn>
        </v-btn-group>

        <!-- Buttons for printing and options(?) -->
        <v-btn icon="mdi-printer" variant="outlined" @click="printSchedule" />
        <v-btn icon="mdi-wrench" variant="outlined" @click="wrenchOptions" />
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
          <tr v-for="employee in employees" :key="employee.id">
            <td class="d-flex align-center">
              <v-avatar size="28" class="mr-2">
                <v-img :src="employee.avatar" />
              </v-avatar>
              {{ employee.fName }}
            </td>

            <!-- Assigns user to that day -->
            <!-- TODO: modal popup? Ask Julian -->
            <!-- TODO: Also have a plus sign show when hovering over -->
            <td
              v-for="day in weekDays"
              :key="day.date"
              @click="assignUser(employee.id, day.date)"
              class="clickable shift-cell"
            > 
              <!-- If the user has hours for that day, show it -->
              <!-- Else show a plus button to assign. -->
              <div class="shift-template-button-container"v-if="shiftsByUserAndDate[`${employee.id}-${day.date}`] && shiftsByUserAndDate[`${employee.id}-${day.date}`].length > 0"
                    v-for="shift in shiftsByUserAndDate[`${employee.id}-${day.date}`] || []"
                    :key="shift.id"
                  >
                    <v-btn
                      class ="shift-template-button"
                      :style="{ backgroundColor: shift.color, color: 'white' }"
                    >
                      {{ shift.formattedTime }}
                    </v-btn>
                  </div>
              <v-icon v-else size="16" color="success" class="hover-icon" @click.stop="showModal = true, date = day.date, employeeName = employee.fName">
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
              0 hrs
            </td>

            <td v-for="day in weekDays" :key="'total-' + day.date">
              0
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>

  <!-- add User Modal -->
  <addUserModal
  v-if="isUserModalOpened"
  :isOpen="isUserModalOpened"
  @modal-close="closeUserModal"/>
  <!-- add end of User Modal -->

  <!-- Julians Form changes start here -->
   <transition name="fade">
  <ScheduleShiftModal v-if="showModal"
  @close="showModal = false; reload()"
  :employee_name="employeeName"
  :date="date"
  ></ScheduleShiftModal>
  </transition>
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

.shift-cell {
  padding: 0 !important; /* remove all padding */
  margin: 0 !important;        /* optional: let height shrink to content */
  max-width: 200px !important;
}

.hover-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.clickable:hover .hover-icon {
  opacity: 1;
}

/*Julian's styles start here */
/* Fade transition for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
.shift-template-button-container {
  max-width: fit-content;
    margin: 0;
  padding: 0;
  display: inline-block; 
}
/* Shift template button styles */
.shift-template-button {
  padding-left: 4px !important;
  padding-right: 4px !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  min-width: 0 !important;      /* remove Vuetify default min width */ 
}


</style>

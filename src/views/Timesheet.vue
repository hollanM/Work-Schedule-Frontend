<script setup>
import { ref, computed, onMounted } from "vue";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  subDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameWeek,
} from "date-fns";
import userServices from "../services/userServices";
import shiftServices from "../services/shiftServices";
import clock_in_outServices from "../services/clock_in_outServices";
import clock_listServices from "../services/clock_listServices";
import date_timeServices from "../services/date_timeServices";
import store from "../store/store.js";
import ClockEditModal from "../components/ClockEditModal.vue";

const currentDate = ref(new Date());
const employees = ref([]);
const shifts = ref([]);
const clockLists = ref([]);
const userSession = computed(() => store.getters.getLoginUserInfo);
const currentUser = ref([]);

const selectedPeriod = ref(null);
const showEditModal = ref(false);

const hourLabels = Array.from({ length: 24 }).map((_, hour) => 
  format(new Date(2026, 0, 1, hour, 0, 0), "h a")
);

const WEEK_SLOT_HEIGHT = 64;

const weekStart = computed(() =>
  startOfWeek(currentDate.value, { weekStartsOn: 0 })
);

const weekDays = computed(() =>
  Array.from({ length: 7 }).map((_, i) => {
    const nextDate = addDays(weekStart.value, i);
    return {
      dateObj: nextDate,
      date: format(nextDate, "yyyy-MM-dd"),
      label: format(nextDate, "EEEE"),
      shortLabel: format(nextDate, "EEE").toUpperCase(),
      dayNumber: format(nextDate, "d"),
      isActive: isSameDay(nextDate, currentDate.value),
    };
  })
);

const weekHourRows = computed(() =>
  Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    label: hourLabels[hour],
  }))
);

const formattedHeader = computed(() =>
  `${format(weekStart.value, "MMMM d")} - ${format(addDays(weekStart.value, 6), "MMMM d, yyyy")}`
);

// Only show employees who have shifts this week
const employeesWithShifts = computed(() => {
  const employeeIdsWithShifts = new Set(
    shifts.value
      .filter(shift => !shift.is_template && shift.startDate && isSameWeek(new Date(shift.startDate), currentDate.value))
      .map(shift => shift.user_id)
  );
  return employees.value.filter(emp => employeeIdsWithShifts.has(emp.id));
});

async function loadData() {
  await getCurrentUser();
  await fetchEmployees();
  await fetchShifts();
  await fetchClockData();
}

async function getCurrentUser() {
  if (!userSession.value || !userSession.value.userId) return;
  const response = await userServices.get(userSession.value.userId);
  currentUser.value = response.data;
}

async function fetchEmployees() {
  if (!currentUser.value.department_id) return;
  const response = await userServices.getDept(currentUser.value.department_id);
  employees.value = response.data.map(user => ({
    ...user,
    name: [user.fName, user.lName].filter(Boolean).join(" ") || user.email || `User ${user.id}`
  }));
}

async function fetchShifts() {
  if (!currentUser.value.department_id) return;
  const response = await shiftServices.getAllDept(currentUser.value.department_id);
  const fetchedShifts = response.data;
  
  for (const shift of fetchedShifts) {
    if (shift.is_template) continue;

    try {
      const start = await date_timeServices.get(shift.start_day_id);
      const end = await date_timeServices.get(shift.end_day_id);
      shift.startDate = new Date(start.data.first_date_time);
      shift.endDate = new Date(end.data.first_date_time);
    } catch (error) {
      console.error("Error fetching date_time for shift:", shift.id, error);
    }
  }
  shifts.value = fetchedShifts;
}

async function fetchClockData() {
  if (!currentUser.value.department_id) return;
  const response = await clock_listServices.findAllForDept(currentUser.value.department_id);
  clockLists.value = response.data;
}

const clockPeriods = computed(() => {
  const periods = [];

  clockLists.value.forEach(list => {
    const userId = list.user_id;
    if (!userId) return;

    // Robust date parsing for all events in this list
    const userEvents = (list.clock_in_outs || []).sort((a, b) => {
      const dateTimeA = new Date(`${a.day.replace(/-/g, '/')} ${a.time}`);
      const dateTimeB = new Date(`${b.day.replace(/-/g, '/')} ${b.time}`);
      return dateTimeA - dateTimeB;
    });

    // Pair events: 1st is IN, 2nd is OUT
    for (let i = 0; i < userEvents.length; i += 2) {
      const startEvent = userEvents[i];
      const endEvent = userEvents[i + 1];
      
      if (startEvent) {
        const startDate = new Date(`${startEvent.day.replace(/-/g, '/')} ${startEvent.time}`);
        const endDate = endEvent ? new Date(`${endEvent.day.replace(/-/g, '/')} ${endEvent.time}`) : null;
        
        periods.push({
          id: `${userId}-${i}`,
          userId: parseInt(userId),
          startDate,
          endDate: endDate || new Date(), // If no clock out, show up to now
          isClockedIn: !endEvent,
          startEventId: startEvent.id,
          endEventId: endEvent ? endEvent.id : null,
          formattedTime: `${format(startDate, "h:mm a")} - ${endDate ? format(endDate, "h:mm a") : 'Present'}`
        });
      }
    }
  });
  
  return periods;
});

const weekClockPeriods = computed(() =>
  clockPeriods.value.filter(period => {
    const dayIndex = differenceInCalendarDays(period.startDate, weekStart.value);
    return dayIndex >= 0 && dayIndex < 7;
  })
);

function getPeriodStyle(period) {
  const dayIndex = differenceInCalendarDays(period.startDate, weekStart.value);
  const startMinutes = period.startDate.getHours() * 60 + period.startDate.getMinutes();
  const durationMinutes = Math.max(
    (period.endDate.getTime() - period.startDate.getTime()) / 60000,
    30
  );

  return {
    left: `calc(${dayIndex} * (100% / 7) + 10px)`,
    width: "calc((100% / 7) - 20px)",
    top: `${(startMinutes / 60) * WEEK_SLOT_HEIGHT}px`,
    height: `${Math.max((durationMinutes / 60) * WEEK_SLOT_HEIGHT, 38)}px`,
    backgroundColor: period.isClockedIn ? "#4caf50" : "#2196f3",
    border: "2px solid white"
  };
}

function getEmployeeName(userId) {
  const emp = employees.value.find(e => e.id === userId);
  return emp ? emp.name : "Unknown";
}

function prevPeriod() {
  currentDate.value = subWeeks(currentDate.value, 1);
}

function nextPeriod() {
  currentDate.value = addWeeks(currentDate.value, 1);
}

function jumpToToday() {
  currentDate.value = new Date();
}

function openEditModal(period) {
  selectedPeriod.value = period;
  showEditModal.value = true;
}

onMounted(loadData);
</script>

<template>
  <v-container fluid class="timesheet-page pa-6">
    <div class="header d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">Time Tracking: {{ formattedHeader }}</h1>
      <div class="d-flex align-center ga-3">
        <v-btn
          variant="outlined"
          color="primary"
          @click="jumpToToday"
        >
          Today
        </v-btn>
        <v-btn-group divided>
          <v-btn icon="mdi-chevron-left" @click="prevPeriod" />
          <v-menu :close-on-content-click="false" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-calendar-month" v-bind="props" />
            </template>
            <v-date-picker v-model="currentDate" color="primary"></v-date-picker>
          </v-menu>
          <v-btn icon="mdi-chevron-right" @click="nextPeriod" />
        </v-btn-group>
      </div>
    </div>

    <v-card class="calendar-card">
      <div class="calendar">
        <div class="calendar__header">
          <div class="calendar__days">
            <div v-for="day in weekDays" :key="day.date" class="calendar__day-header">
              <div class="calendar__day-label" :class="{ 'calendar__day-label--today': day.isActive }">
                {{ day.shortLabel }}
              </div>
              <div class="calendar__day-number" :class="{ 'calendar__day-number--today': day.isActive }">
                {{ day.dayNumber }}
              </div>
            </div>
          </div>
        </div>

        <div class="calendar__body">
          <div class="calendar__times">
            <div v-for="hourRow in weekHourRows" :key="'time-' + hourRow.hour" class="calendar__time-slot">
              {{ hourRow.label }}
            </div>
          </div>

          <div class="calendar__grid">
            <div class="calendar__columns">
              <div v-for="day in weekDays" :key="'column-' + day.date" class="calendar__column"></div>
            </div>

            <div class="calendar__rows">
              <div v-for="hourRow in weekHourRows" :key="'row-' + hourRow.hour" class="calendar__row"></div>
            </div>

            <div
              v-for="period in weekClockPeriods"
              :key="'period-' + period.id"
              class="time-period"
              :style="getPeriodStyle(period)"
              @click="openEditModal(period)"
            >
              <span class="period__title">{{ getEmployeeName(period.userId) }}</span>
              <span class="period__time">{{ period.formattedTime }}</span>
              <span v-if="period.isClockedIn" class="period__status">Clocked In</span>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <div class="mt-6">
      <h2 class="text-h5 mb-4">Employees Scheduled This Week</h2>
      <v-list v-if="employeesWithShifts.length > 0">
        <v-list-item v-for="emp in employeesWithShifts" :key="emp.id">
          <template v-slot:prepend>
            <v-avatar color="primary">{{ emp.fName[0] }}{{ emp.lName[0] }}</v-avatar>
          </template>
          <v-list-item-title>{{ emp.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ emp.role }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-alert v-else type="info">No employees scheduled for this week.</v-alert>
    </div>

    <ClockEditModal
      v-if="showEditModal"
      :period="selectedPeriod"
      :employeeName="getEmployeeName(selectedPeriod.userId)"
      @close="showEditModal = false"
      @save="loadData"
    />
  </v-container>
</template>

<style scoped>
.timesheet-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.calendar-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
}

.calendar {
  background: #fff;
}

.calendar__header {
  display: grid;
  grid-template-columns: 86px 1fr;
  border-bottom: 1px solid #e0e0e0;
}

.calendar__days {
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar__day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.calendar__day-label {
  font-size: 12px;
  font-weight: 600;
  color: #757575;
}

.calendar__day-label--today {
  color: #2196f3;
}

.calendar__day-number {
  font-size: 18px;
  font-weight: 700;
  margin-top: 4px;
}

.calendar__day-number--today {
  color: #fff;
  background: #2196f3;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.calendar__body {
  display: grid;
  grid-template-columns: 86px 1fr;
  max-height: 700px;
  overflow-y: auto;
}

.calendar__times {
  border-right: 1px solid #e0e0e0;
}

.calendar__time-slot {
  height: 64px;
  padding: 8px;
  font-size: 12px;
  color: #757575;
  text-align: right;
}

.calendar__grid {
  position: relative;
  height: 1536px; /* 24 * 64 */
}

.calendar__columns {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  pointer-events: none;
}

.calendar__column {
  border-right: 1px solid #f0f0f0;
}

.calendar__rows {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: repeat(24, 64px);
  pointer-events: none;
}

.calendar__row {
  border-bottom: 1px solid #f0f0f0;
}

.time-period {
  position: absolute;
  z-index: 10;
  border-radius: 8px;
  padding: 8px;
  color: #fff;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.1s;
}

.time-period:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.period__title {
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.period__time {
  font-size: 11px;
}

.period__status {
  font-size: 10px;
  font-style: italic;
  margin-top: auto;
}
</style>

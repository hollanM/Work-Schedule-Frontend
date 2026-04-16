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
import ScheduleShiftModal from "../components/ScheduleShiftModal.vue";
import positionServices from "../services/positionServices";
import shiftServices from "../services/shiftServices";
import date_timeServices from "../services/date_timeServices";
import userServices from "../services/userServices";
import addUserModal from "../components/UserModal.vue";
import taskListServices from "../services/task_listServices";
import departmentServices from "../services/departmentServices";
import store from "../store/store.js"

const currentDate = ref(new Date());
const currentView = ref("week");
const isUserModalOpened = ref(false);
const employees = ref([]);
const shifts = ref([]);
const positions = ref([]);
const userSession = computed(() => store.getters.getLoginUserInfo);
const currentUser = ref([]);
const isManager = computed(() => currentUser.value && currentUser.value.role === 'Manager'); //needed this because user is null till the backend responds
const showMyShifts = ref(false); // track when the user wants to show only their shifts.

const showModal = ref(false);
const date = ref("");
const employeeName = ref("");
const selectedShift = ref(null);

const hourLabels = [
  "12A",
  "1A",
  "2A",
  "3A",
  "4A",
  "5A",
  "6A",
  "7A",
  "8A",
  "9A",
  "10A",
  "11A",
  "12P",
  "1P",
  "2P",
  "3P",
  "4P",
  "5P",
  "6P",
  "7P",
  "8P",
  "9P",
  "10P",
  "11P",
];

const WEEK_SLOT_HEIGHT = 64;

const shiftsByUserAndDate = computed(() => {
  const map = {};

  for (const shift of shifts.value) {
    const key = `${shift.user_id}-${shift.shiftDate}`;
    if (!map[key]) map[key] = [];
    map[key].push(shift);
  }

  return map;
});

const hasUserShifts = computed(() => {
  //console.log("checking found shifts");
  shifts.value.forEach(shift => {
    console.log("Checking shift for user:", {
      shiftUserId: shift.user_id ?? false, //need the null check here for the sign in page
      sessionUserId: userSession.value.userId,
      shiftStartDate: shift.startDate,
      currentDate: currentDate.value,
      isSameWeek: isSameWeek(shift.startDate, currentDate.value),
    })
  });
  return shifts.value.some((shift) => //.some returns true if it finds a match to the given criteria
    !shift.is_template &&
    shift.user_id === userSession.value.userId &&
    isSameWeek(shift.startDate, currentDate.value),
  );
});

const employeeLookup = computed(() => {
  const map = {};

  for (const employee of employees.value) {
    map[employee.id] = employee;
  }

  return map;
});

const selectedDateKey = computed(() => format(currentDate.value, "yyyy-MM-dd"));

const weekStart = computed(() =>
  startOfWeek(currentDate.value, { weekStartsOn: 0 }), //0 is start of Sunday, Monday start was messing with the .isSameWeek import
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
  }),
);

const weekHourRows = computed(() =>
  Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    label: format(new Date(2026, 0, 1, hour, 0, 0), "h a"),
  })),
);

const weekCalendarShifts = computed(() =>
  shifts.value.filter((shift) => {
    if (shift.is_template || !shift.startDate || !shift.endDate) return false;

    const dayIndex = differenceInCalendarDays(shift.startDate, weekStart.value);
    return dayIndex >= 0 && dayIndex < 7;
  }),
);

const formattedHeader = computed(() =>
  currentView.value === "day"
    ? format(currentDate.value, "MMMM d, yyyy")
    : `${format(weekStart.value, "MMMM d")} - ${format(addDays(weekStart.value, 6), "MMMM d, yyyy")}`,
);

const dayTotalHours = computed(() =>
  getDayShifts().reduce((sum, shift) => sum + getShiftDurationHours(shift), 0),
);

const dayCalendarShifts = computed(() =>
  shifts.value.filter(
    (shift) =>
      !shift.is_template &&
      shift.startDate &&
      isSameDay(shift.startDate, currentDate.value),
  ),
);

async function reload() {
  await fetchEmployees();
  await fetchPositions();
  await loadShifts();
}

const fetchEmployees = async () => {
  const response = await userServices.getAll();
  employees.value = response.data
    .filter((user) => user.role === "Employee")
    .map((user) => ({
      ...user,
      name: [user.fName, user.lName].filter(Boolean).join(" ") || user.email || `User ${user.id}`,
      avatar: null,
      hours: 0,
    }));
};

const fetchPositions = async () => {
  const response = await positionServices.getAll();
  positions.value = response.data;
};

async function loadShifts() {
  const response = await shiftServices.getAll();
  shifts.value = response.data;

  for (const shift of shifts.value) {
    if (shift.is_template) continue;

    const start = await date_timeServices.get(shift.start_day_id);
    const end = await date_timeServices.get(shift.end_day_id);
    const startDate = new Date(start.data.first_date_time);
    const endDate = new Date(end.data.first_date_time);

    shift.startDate = startDate;
    shift.endDate = endDate;
    shift.shiftDate = format(startDate, "yyyy-MM-dd");
    shift.formattedTime = `${formatShiftTimeFromISO(start.data.first_date_time)} - ${formatShiftTimeFromISO(end.data.first_date_time)}`;
    shift.positionName =
      positions.value.find((position) => position.id === shift.position_id)?.name || "";
  }
}

function formatShiftTimeFromISO(isoString) {
  if (!isoString) return "Invalid time";

  const parsedDate = new Date(isoString);
  if (isNaN(parsedDate.getTime())) return "Invalid time";

  const hours24 = parsedDate.getHours();
  const minutes = parsedDate.getMinutes().toString().padStart(2, "0");
  const ampm = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes} ${ampm}`;
}

function openShiftModal(selectedEmployeeName, selectedDate, shift = null) {
  if (!isManager.value) return;
  employeeName.value = selectedEmployeeName;
  date.value = selectedDate;
  selectedShift.value = shift;
  showModal.value = true;
}

function addUser() {
  isUserModalOpened.value = true;
}

function closeUserModal() {
  isUserModalOpened.value = false;
}

function assignUser(userId, selectedDate) {
  apiAssignUser(userId, selectedDate);
}

function prevPeriod() {
  currentDate.value =
    currentView.value === "day"
      ? subDays(currentDate.value, 1)
      : subWeeks(currentDate.value, 1);
}

function nextPeriod() {
  currentDate.value =
    currentView.value === "day"
      ? addDays(currentDate.value, 1)
      : addWeeks(currentDate.value, 1);
}

function jumpToToday() {
  currentDate.value = new Date();
  currentView.value = "day";
}

function switchToWeekView() {
  currentView.value = "week";
}

function switchToDayView() {
  currentView.value = "day";
}

function apiAssignUser(userId, selectedDate) {
  console.log("API CALL → assign user to day:", {
    userId,
    date: selectedDate,
  });
}

function getEmployeeShiftsForDate(employeeId, selectedDate) {
  return shiftsByUserAndDate.value[`${employeeId}-${selectedDate}`] || [];
}

function getDayShifts() {
  return shifts.value.filter(
    (shift) =>
      !shift.is_template &&
      shift.startDate &&
      isSameDay(shift.startDate, currentDate.value),
  );
}

function getEmployeeDayShifts(employeeId) {
  return getEmployeeShiftsForDate(employeeId, selectedDateKey.value);
}

function getShiftDurationHours(shift) {
  if (!shift.startDate || !shift.endDate) return 0;
  return (shift.endDate.getTime() - shift.startDate.getTime()) / 3600000;
}

function getEmployeeName(userId) {
  return employeeLookup.value[userId]?.name || "Unassigned";
}

function getWeekShiftStyle(shift) {
  if (!shift.startDate || !shift.endDate) return {};

  const dayIndex = differenceInCalendarDays(shift.startDate, weekStart.value);
  const startMinutes = shift.startDate.getHours() * 60 + shift.startDate.getMinutes();
  const durationMinutes = Math.max(
    (shift.endDate.getTime() - shift.startDate.getTime()) / 60000,
    30,
  );

  return {
    left: `calc(${dayIndex} * (100% / 7) + 10px)`,
    width: "calc((100% / 7) - 20px)",
    top: `${(startMinutes / 60) * WEEK_SLOT_HEIGHT}px`,
    height: `${Math.max((durationMinutes / 60) * WEEK_SLOT_HEIGHT, 38)}px`,
    backgroundColor: shift.color || "#4f7df3",
  };
}

function openWeekCell(day) {
  if(userSession.value.userId && isManager.value) //getting rid of the + icon did not do it I also have to disable the button function for non manaers
    openShiftModal("", day.date);
}

function isCompactWeekShift(shift) {
  return getShiftDurationHours(shift) <= 1;
}

function isMediumWeekShift(shift) {
  const duration = getShiftDurationHours(shift);
  return duration > 1 && duration <= 1.5;
}

function openDayCell() {
  if(userSession.value.userId && isManager.value)
    openShiftModal("", selectedDateKey.value);
}

function getDayShiftStyle(shift) {
  if (!shift.startDate || !shift.endDate) return {};

  const startMinutes = shift.startDate.getHours() * 60 + shift.startDate.getMinutes();
  const durationMinutes = Math.max(
    (shift.endDate.getTime() - shift.startDate.getTime()) / 60000,
    30,
  );

  return {
    left: "12px",
    width: "calc(100% - 24px)",
    top: `${(startMinutes / 60) * WEEK_SLOT_HEIGHT}px`,
    height: `${Math.max((durationMinutes / 60) * WEEK_SLOT_HEIGHT, 38)}px`,
    backgroundColor: shift.color || "#4f7df3",
  };
}

function doesShiftCoverHour(shift, hourIndex) {
  if (!shift.startDate || !shift.endDate) return false;

  const hourStart = new Date(currentDate.value);
  hourStart.setHours(hourIndex, 0, 0, 0);

  const hourEnd = new Date(hourStart);
  hourEnd.setHours(hourIndex + 1, 0, 0, 0);

  return shift.startDate < hourEnd && shift.endDate > hourStart;
}

function getShiftStartingInHour(employeeId, hourIndex) {
  const employeeShifts = getEmployeeDayShifts(employeeId);

  return employeeShifts.find((shift) => {
    if (!shift.startDate) return false;

    return (
      isSameDay(shift.startDate, currentDate.value) &&
      shift.startDate.getHours() === hourIndex
    );
  });
}

async function getCurrentUser() {
    //this guard is not needed, session works as intended.
    //console.log('userSession.value:', userSession.value);
    if (!userSession.value || !userSession.value.userId) {
      console.log('No user session or userId');
      return;
    }
    const response = await userServices.get(userSession.value.userId);
    currentUser.value = response.data;
    console.log('Current user data:', currentUser.value);
    if(currentUser.value.department_id === null) { //will add a department for new users but many users will change their departmetns later
      response.value = await createDepartment();
      console.log("Department created and assigned to user:", response.data);
      response.value = await updateUser(); //then add the new department to the user
      console.log("User updated with new department:", response.data);
    }
}

async function createDepartment() {
  const response = await departmentServices.create({
    name: "Department for user: " + currentUser.value.id,
  });
  console.log("Created department:", response.data);
  currentUser.value.department_id = response.data.id;
}

async function updateUser() {
    const response = await userServices.update(currentUser.value.id, {
      department_id: currentUser.value.department_id,
      fName: currentUser.value.fName,
      lName: currentUser.value.lName,
      email: currentUser.value.email,
      role: "Manager", //auto set as manager for new users since they will be new and if they are imported by a manager its automatically set to employee later anyway
      phone_num: currentUser.value.phone_num,
      oc_id: currentUser.value.oc_id,
      pay_rate: currentUser.value.pay_rate,
      manager_notes:  currentUser.value.manager_notes,
    });
    currentUser.value.role = "Manager"; //backend has been updated and now the frontend needs to see the change
}

async function getTaskLists() {
  const response = await taskListServices.getAll();
  console.log("Fetched task lists:", response.data);  
  let departmentTaskList = false;
  response.data.forEach(element => {
    if(element.department_id === currentUser.value.department_id){
      departmentTaskList = true;
    }
  });
  if(departmentTaskList)
  {
    //do nothing since the check passed
  } 
  else 
  { //create a task list for the department
    //console.log(false);
  //   taskListServices.create({ //if the department does not have a task list make one, this is only needed for creating shifts because of FK
  //     name: "Task List for Department " + currentUser.value.department_id,
  //     department_id: currentUser.value.department_id,
  //   });
  }

}

onMounted(async () => {
  await getCurrentUser(); //I need the current user for the v-ifs to disable pieces between manager and employee
  await fetchEmployees();
  await fetchPositions();
  await loadShifts();
});
</script>

<template>
  <v-container fluid class="schedule-page pa-6">
    <div class="schedule-header d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">{{ formattedHeader }}</h1>

      <div class="d-flex align-center ga-3 flex-wrap">
        <!-- a switch component that enables or disables the view to see shifts -->
        <v-switch
          v-if="currentUser.role === 'Employee'"
          v-model="showMyShifts"
          label="My Shifts"
          color="primary"
          hide-details
          density="compact"
        />

        <v-btn-group divided>
          <v-btn icon="mdi-chevron-left" @click="prevPeriod" />
          <v-btn icon="mdi-calendar-month" />
          <v-btn icon="mdi-chevron-right" @click="nextPeriod" />
        </v-btn-group>

        <v-btn-group divided>
          <v-btn
            :variant="currentView === 'day' ? 'flat' : 'text'"
            :color="currentView === 'day' ? 'primary' : undefined"
            @click="switchToDayView"
          >
            Day
          </v-btn>
          <v-btn
            :variant="currentView === 'week' ? 'flat' : 'text'"
            :color="currentView === 'week' ? 'primary' : undefined"
            @click="switchToWeekView"
          >
            Week
          </v-btn>
        </v-btn-group>

      </div>
    </div>

    <v-card v-if="currentView === 'week'" class="week-calendar-card">
    <div>
      <v-alert
        v-if="!hasUserShifts && !isManager"
        type="info"
        title="No Shifts Assigned"
        text="You don't have any shifts scheduled for this week."
      ></v-alert>
    </div>
      <div class="week-calendar">
        <div class="week-calendar__header">
          <div class="week-calendar__days">
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="week-calendar__day-header"
            >
              <div
                class="week-calendar__day-label"
                :class="{ 'week-calendar__day-label--today': day.isActive }"
              >
                {{ day.shortLabel }}
              </div>
              <div
                class="week-calendar__day-number"
                :class="{ 'week-calendar__day-number--today': day.isActive }"
              >
                {{ day.dayNumber }}
              </div>
            </div>
          </div>
        </div>

        <div class="week-calendar__body">
          <div class="week-calendar__times">
            <div
              v-for="hourRow in weekHourRows"
              :key="'time-' + hourRow.hour"
              class="week-calendar__time-slot"
            >
              {{ hourRow.label }}
            </div>
          </div>

          <div class="week-calendar__grid">
            <div class="week-calendar__columns">
              <div
                v-for="day in weekDays"
                :key="'column-' + day.date"
                class="week-calendar__column"
              ></div>
            </div>

            <div class="week-calendar__rows">
              <div
                v-for="hourRow in weekHourRows"
                :key="'row-' + hourRow.hour"
                class="week-calendar__row"
              ></div>
            </div>

            <div class="week-calendar__cell-layer">
              <template v-for="hourRow in weekHourRows" :key="'cell-row-' + hourRow.hour">
                <button
                  v-for="day in weekDays"
                  :key="`cell-${day.date}-${hourRow.hour}`"
                  type="button"
                  class="week-calendar__cell-button"
                  @click="openWeekCell(day)"
                >
                  <v-icon size="16" color="success" class="week-calendar__cell-plus" v-if="userSession.userId && isManager">
                    mdi-plus
                  </v-icon>
                </button>
              </template>
            </div>

            <!-- Added v-show to only show a shift for a user when the user enables to show only my shifts-->
            <button
              v-for="shift in weekCalendarShifts"
              :key="'week-shift-' + shift.id"
              v-show="!showMyShifts || shift.user_id === userSession.userId"
              type="button"
              class="week-event"
              :class="{ 'week-event--compact': isCompactWeekShift(shift) }"
              :style="getWeekShiftStyle(shift)"
              @click="
                openShiftModal(
                  getEmployeeName(shift.user_id),
                  shift.shiftDate,
                  shift
                )
              ",
            >
              <span class="week-event__title">{{ getEmployeeName(shift.user_id) }}</span>
              <span v-if="!isCompactWeekShift(shift)" class="week-event__time">
                {{ shift.formattedTime }}
              </span>
              <span
                v-if="shift.positionName && !isCompactWeekShift(shift) && !isMediumWeekShift(shift)"
                class="week-event__meta"
              >
                {{ shift.positionName }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </v-card>

    <v-card v-else class="day-calendar-card">
    <div>
      <v-alert
        v-if="!hasUserShifts"
        type="info"
        title="No Shifts Assigned"
        text="No shifts scheduled for this week."
      ></v-alert>
    </div>
      <div class="day-calendar">
        <div class="day-calendar__header">
          <div class="day-calendar__header-main">
            <div class="day-calendar__day-label">{{ format(currentDate, "EEE").toUpperCase() }}</div>
            <div class="day-calendar__day-number">{{ format(currentDate, "d") }}</div>
          </div>
        </div>

        <div class="day-calendar__body">
          <div class="day-calendar__times">
            <div
              v-for="hourRow in weekHourRows"
              :key="'day-time-' + hourRow.hour"
              class="day-calendar__time-slot"
            >
              {{ hourRow.label }}
            </div>
          </div>

          <div class="day-calendar__grid">
            <div class="day-calendar__rows">
              <div
                v-for="hourRow in weekHourRows"
                :key="'day-row-' + hourRow.hour"
                class="day-calendar__row"
              ></div>
            </div>

            <div class="day-calendar__cell-layer">
              <button
                v-for="hourRow in weekHourRows"
                :key="'day-cell-' + hourRow.hour"
                type="button"
                class="day-calendar__cell-button"
                @click="openDayCell"
              >
                <v-icon size="16" color="success" class="day-calendar__cell-plus">
                  mdi-plus
                </v-icon>
              </button>
            </div>

            <!-- Added v-show to only show a shift for a user when the user enables to show only my shifts-->
            <button
              v-for="shift in dayCalendarShifts"
              :key="'day-shift-' + shift.id"
              v-show="!showMyShifts || shift.user_id === userSession.userId"
              type="button"
              class="day-event"
              :class="{ 'day-event--compact': isCompactWeekShift(shift) }"
              :style="getDayShiftStyle(shift)"
              @click="openShiftModal(getEmployeeName(shift.user_id), shift.shiftDate, shift)"
            >
              <span class="day-event__title">{{ getEmployeeName(shift.user_id) }}</span>
              <span v-if="!isCompactWeekShift(shift)" class="day-event__time">
                {{ shift.formattedTime }}
              </span>
              <span
                v-if="shift.positionName && !isCompactWeekShift(shift) && !isMediumWeekShift(shift)"
                class="day-event__meta"
              >
                {{ shift.positionName }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </v-card>
  </v-container>

  <!-- Julians Form changes start here -->
   <transition name="fade">
  <ScheduleShiftModal v-if="showModal"
  @close="showModal = false; selectedShift = null; reload()"
  :employee_name="employeeName"
  :date="date"
  :shift="selectedShift"
  ></ScheduleShiftModal>
  </transition>
</template>

<style scoped>
.schedule-page {
  background: #fff;
}

.week-calendar-card {
  border-radius: 28px !important;
  overflow: hidden;
}

.week-calendar {
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.week-calendar__header {
  display: grid;
  grid-template-columns: 86px 1fr;
  align-items: end;
  border-bottom: 1px solid #dfe5f0;
  padding: 10px 14px 0;
}

.week-calendar__days {
  grid-column: 2 / -1;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.week-calendar__day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 12px;
}

.week-calendar__day-label {
  color: #49556a;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.week-calendar__day-label--today {
  color: #3b5ed7;
}

.week-calendar__day-number {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  color: #243043;
  font-size: 22px;
  font-weight: 600;
}

.week-calendar__day-number--today {
  background: #3b5ed7;
  color: #fff;
}

.week-calendar__body {
  display: grid;
  grid-template-columns: 86px 1fr;
  max-height: 980px;
  overflow-y: auto;
}

.week-calendar__times {
  background: rgba(255, 255, 255, 0.92);
}

.week-calendar__time-slot {
  height: 64px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  color: #3d4c60;
  font-size: 14px;
  font-weight: 600;
  padding-top: 10px;
  border-right: 1px solid #e3e8f1;
}

.week-calendar__grid {
  position: relative;
  min-height: 1536px;
}

.week-calendar__columns,
.week-calendar__rows,
.week-calendar__cell-layer {
  position: absolute;
  inset: 0;
}

.week-calendar__columns {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  pointer-events: none;
}

.week-calendar__column {
  border-right: 1px solid #e3e8f1;
}

.week-calendar__column:first-child {
  border-left: 1px solid #e3e8f1;
}

.week-calendar__rows {
  display: grid;
  grid-template-rows: repeat(24, 64px);
  pointer-events: none;
}

.week-calendar__row {
  border-bottom: 1px solid #e3e8f1;
}

.week-calendar__cell-layer {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: repeat(24, 64px);
  z-index: 0;
}

.week-calendar__cell-button {
  border: 0;
  background: transparent;
  position: relative;
  width: 100%;
  height: 100%;
}

.week-calendar__cell-plus {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.week-calendar__cell-button:hover .week-calendar__cell-plus {
  opacity: 1;
}

.week-event {
  position: absolute;
  z-index: 2;
  border: 0;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(51, 96, 188, 0.16);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  text-align: left;
  padding: 10px 12px 12px;
  overflow: hidden;
  line-height: 1.2;
}

.week-event--compact {
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 8px;
}

.week-event__title,
.week-event__time,
.week-event__meta {
  width: 100%;
}

.week-event__title {
  font-size: 14px;
  font-weight: 700;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
}

.week-event__time {
  font-size: 13px;
  opacity: 0.96;
  white-space: normal;
  overflow: hidden;
}

.week-event__meta {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.82;
  white-space: normal;
  overflow: hidden;
}

.day-calendar-card {
  border-radius: 28px !important;
  overflow: hidden;
}

.day-calendar {
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.day-calendar__header {
  display: grid;
  grid-template-columns: 86px 1fr;
  align-items: end;
  border-bottom: 1px solid #dfe5f0;
  padding: 12px 14px 0;
}

.day-calendar__header-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 0 0 12px 12px;
}

.day-calendar__day-label {
  color: #3b5ed7;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.day-calendar__day-number {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: #3b5ed7;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
}

.day-calendar__body {
  display: grid;
  grid-template-columns: 86px 1fr;
  max-height: 980px;
  overflow-y: auto;
}

.day-calendar__times {
  background: rgba(255, 255, 255, 0.92);
}

.day-calendar__time-slot {
  height: 64px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  color: #3d4c60;
  font-size: 14px;
  font-weight: 600;
  padding-top: 10px;
  border-right: 1px solid #e3e8f1;
}

.day-calendar__grid {
  position: relative;
  min-height: 1536px;
}

.day-calendar__rows,
.day-calendar__cell-layer {
  position: absolute;
  inset: 0;
}

.day-calendar__rows {
  display: grid;
  grid-template-rows: repeat(24, 64px);
  pointer-events: none;
}

.day-calendar__row {
  border-bottom: 1px solid #e3e8f1;
}

.day-calendar__cell-layer {
  display: grid;
  grid-template-rows: repeat(24, 64px);
  z-index: 0;
}

.day-calendar__cell-button {
  border: 0;
  background: transparent;
  width: 100%;
  height: 100%;
}

.day-calendar__cell-plus {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.day-calendar__cell-button:hover .day-calendar__cell-plus {
  opacity: 1;
}

.day-event {
  position: absolute;
  z-index: 2;
  border: 0;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(51, 96, 188, 0.16);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  text-align: left;
  padding: 10px 12px 12px;
  overflow: hidden;
  line-height: 1.2;
}

.day-event--compact {
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 8px;
}

.day-event__title,
.day-event__time,
.day-event__meta {
  width: 100%;
}

.day-event__title {
  font-size: 14px;
  font-weight: 700;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
}

.day-event__time {
  font-size: 13px;
  opacity: 0.96;
  white-space: normal;
  overflow: hidden;
}

.day-event__meta {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.82;
  white-space: normal;
  overflow: hidden;
}

.schedule-table th {
  background: #e0e0e0;
  font-weight: 600;
  white-space: nowrap;
}

.schedule-table {
  table-layout: fixed;
  width: 100%;
}

.custom-column {
  width: 220px;
}

.hour-column {
  width: calc((100% - 220px) / 24);
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
}

.employee-cell {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.employee-avatar {
  background: #d7dbe1;
}

.clickable {
  cursor: pointer;
}

.shift-cell {
  padding: 0 !important;
  margin: 0 !important;
  max-width: 200px !important;
}

.hover-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.clickable:hover .hover-icon {
  opacity: 1;
}

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

.shift-template-button {
  padding-left: 4px !important;
  padding-right: 4px !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  min-width: 0 !important;
}

.day-hour-cell {
  padding: 0 !important;
  min-width: 0;
}

.day-hour-cell--filled {
  background: #eef4ff;
}

.day-hour-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

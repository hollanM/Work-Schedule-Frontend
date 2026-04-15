<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import AuthServices from "../services/authServices";
import positionServices from "../services/positionServices";
import task_listServices from "../services/task_listServices.js";
import employeeServices from "../services/employeeServices.js";
import userServices from "../services/userServices.js";
import shiftServices from "../services/shiftServices.js";
import date_timeServices from "../services/date_timeServices.js";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
import { VBtn } from "vuetify/components";

const props = defineProps({
  passedUser: { type: Object, default: () => ({}) },
  employee_name: { type: [Number, String], required: true },
  date: { type: String, required: true },
  shift: { type: Object, default: null }
});


const start_time = ref("");
const end_time = ref("");
const selectedPosition = ref(null);
const selectedTaskList = ref(null); 
const color = ref("#000000");
const saveAsTemplate = ref(false);
const selectedEmployee = ref(props.employee_name)
const router = useRouter();
const fName = ref("");
const lName = ref("");
const user = ref({}); //the user fron the store
const currentUser = ref({}); //the user from the database
const message = ref("");
const shifts = ref([]);
const employees = ref([]);
const employee_names = ref([]);
const task_lists = ref([]);
const task_lists_names = ref([]);
const positions = ref([]);
const position_names = ref([]);
const form_content = ref(false);
const color_picker = ref(false);
const emit = defineEmits(["close"]);
const shiftTemplates = computed(() =>
  shifts.value.filter(shift => shift.is_template === true || shift.is_template === 1 || shift.is_template === "1")
)

function buildEmployeeName(employee) {
  return [employee?.fName, employee?.lName].filter(Boolean).join(" ").trim();
}

const isEditing = computed(() => !!props.shift); // if shift prop is passed, we're editing, otherwise creating

watch(
  () => props.employee_name,
  (newVal) => {
    selectedEmployee.value = newVal
  }
)

//watcher for when templates get sorted.
watch(
  shiftTemplates,
  (newTemplates) => {
    console.log("Shift templates updated:", newTemplates)
  },
  { immediate: true }
)


//auto complete list here for autocompleting the time range.
const timeList = ref([])

function formatTime(totalMinutes) {
  const hour24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const period = hour24 >= 12 ? 'pm' : 'am'
  let hour12 = hour24 % 12
  if (hour12 === 0) hour12 = 12

  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

function generateTimes() {
  const list = []

  for (let mins = 0; mins < 24 * 60; mins += 5) {
    list.push(formatTime(mins))
  }

  timeList.value = list
}


const shiftStartTime = ref("")
const shiftEndTime = ref("")
const shiftTime = ref("")

function convertTo24Hour(timeStr) {
  if (!timeStr) return ""
  const [time, modifier] = timeStr.split(" ")
  let [hours, minutes] = time.split(":")
  if (hours === "12") {
    hours = "00"
  }
  if (modifier.toLowerCase() === "pm") {
    hours = parseInt(hours, 10) + 12
  }
  return `${hours}:${minutes}`
}

const colorSwatches = [
  ["#D32F2F", "#F57C00", "#FBC02D", "#689F38", "#00897B", "#1976D2"],
  ["#C2185B", "#E64A19", "#F9A825", "#43A047", "#00ACC1", "#3949AB"],
  ["#7B1FA2", "#8D6E63", "#9E9D24", "#2E7D32", "#00838F", "#5E35B1"],
  ["#AD1457", "#6D4C41", "#827717", "#558B2F", "#00695C", "#283593"]
]

//Normalizing strings if user don't want to add spaces.
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')   // remove spaces
    .replace(/-/g, '')     // remove dashes
    .replace(/:/g, '')     // remove colons
}

function filterShifts(item, queryText) {
  return normalize(item).includes(normalize(queryText))
}

//trying to force local time here, since timezones ruin everything. 
const formattedDate = computed(() =>
  new Date(props.date + 'T00:00:00')
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
)
const form = reactive({
  name: '',
  status: 'not started'
});


onMounted( async () => {
  console.log("onMounted ran")
  await getPositions();
  await getTaskLists();
  await getEmployees();
  await getShifts();
  await populateShiftTemplates();
  generateTimes();

  if (props.shift) {
    populateFormFromShift(props.shift);
    form_content.value = true;
  }
});

// populating theform with editing shift data
async function populateFormFromShift(shift) {
  selectedEmployee.value = getEmployeeName(shift.user_id);
  shiftTime.value = shift.formattedTime;
  color.value = shift.color;

  // Populate start/end times for the inputs
  if (shift.startDate) {
    shiftStartTime.value = formatTimeInputFromDate(shift.startDate);
  }
  if (shift.endDate) {
    shiftEndTime.value = formatTimeInputFromDate(shift.endDate);
  }

  // for the things below, we find the stuffs by id from the shift and set the selected value to the name 
  selectedPosition.value = positions.value.find(pos => pos.id === shift.position_id)?.name || ""; // 
  selectedTaskList.value = task_lists.value.find(t => t.id === shift.shift_task_list_id)?.name || ""; 

  saveAsTemplate.value = shift.is_template === true || shift.is_template === 1;
}

// formatting the time for the inputs when editing a shift, since they come in as ISO strings and need to be converted to "HH:MM" format for the time inputs.
function formatTimeInputFromDate(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// this function gets the employees name from the employee list based on user id
function getEmployeeName(userId) {
  const emp = employees.value.find(e => e.id === userId);
  return emp ? buildEmployeeName(emp) : props.employee_name;
}


//backend calls for populating dropdowns, etc.
async function getPositions(){
  try{
    const response = await positionServices.getAll();
    positions.value = response.data;
    console.log("returned:" + positions.value);
    position_names.value = positions.value.map(pos => pos.name);
    console.log("position names:" + position_names.value);
  }
  catch(error){
    message.value = "Error: " + error.code + ":" + error.message;
    console.log(error);
  }
}



async function getTaskLists(){
  try{
    const response = await task_listServices.getAll();
    task_lists.value = response.data;
    console.log("returned:" + task_lists.value);
    task_lists_names.value = task_lists.value.map (tl => tl.name);
    console.log("task list names:" + task_lists_names.value);
  }
  catch(error){
    message.value = "Error: " + error.code + ":" + error.message;
    console.log(error);
  }
}

async function getUser(id) {
    //console.log("Getting user with ID:", id);
    try {
        const response = await userServices.get(id);
        user.value = response.data;
        return user.value;
    } catch (error) {
        console.error("Error adding user:", error);
    }
}

async function getEmployees() {
  //this gets users who are "employees.." still needs to be department specific. it is not yet.
  const user_id = Utils.getStore("user").userId;
  try{
    //console.log("user: ", user_id);
    const response = await getUser(user_id);
    currentUser.value = response;
    console.log("Getting employees for department id:", response.department_id);
    const deptResponse = await userServices.getDept(response.department_id);
    employees.value = Array.isArray(deptResponse.data) ? deptResponse.data : [];
    console.log("returned:" + employees.value);

    employees.value = employees.value.filter(emp => emp.role === "Employee");
    console.log("filtered employees:" + employees.value);

    employee_names.value = employees.value.map(buildEmployeeName).filter(Boolean);
    console.log("employee names:" + employee_names.value);
  }
  catch(error){
    message.value = "Error: " + error.code + ":" + error.message;
    console.log(error);
  }
}

//getting the times to display for templates was getting... annoying.
async function getShifts() {
  try {
    const response = await shiftServices.getAll();
    const rawShifts = response.data;

    // Fetch start/end times for each shift
    const enrichedShifts = await Promise.all(
      rawShifts.map(async shift => {
        const start = await date_timeServices.get(shift.start_day_id);
        const end = await date_timeServices.get(shift.end_day_id);
        return {
          ...shift,
          startObj: start.data.first_date_time,
          endObj: end.data.first_date_time
        };
      })
    );

    shifts.value = enrichedShifts;
    console.log("Shifts loaded:", shifts.value);
  } catch (error) {
    console.error(error);
  }
}

//collecting all form data to send to backend when creating shift.
function getFormData() {
  const selectedEmployeeRecord = employees.value.find(
    emp => buildEmployeeName(emp) === selectedEmployee.value
  );

  return {
    employee_id: selectedEmployeeRecord?.id,
    start_time: shiftStartTime.value,
    end_time: shiftEndTime.value,
    color: color.value,
    department_id: currentUser.value.department_id,
    position_id: positions.value.find(pos => pos.name === selectedPosition.value)?.id, // if needed as name or map to id similarly
    shift_task_list_id: task_lists.value.find(t => t.name === selectedTaskList.value)?.id,
    is_template: saveAsTemplate.value
  }
}

function normalizeTimeForSql(timeStr) {
  if (!timeStr) return ""

  return timeStr.length === 5 ? `${timeStr}:00` : timeStr
}

function toSqlDateTime(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0') // months 0-indexed
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

// a function to save the shift... enough said
async function saveShift() {
    if (isEditing.value) {
        await updateShift();
    } else {
        await createShift();
    }
}

async function createShift(){
    const formData = getFormData();
    console.log("Form Data to submit:", formData);
    // Here you would send formData to your backend API to create the shift
    // Example: await shiftServices.create(formData);

    if (!formData.start_time || !formData.end_time) {
      message.value = "Start time and end time are required.";
      return;
    }

    const startDateTime = new Date(`${props.date}T${normalizeTimeForSql(formData.start_time)}`)
    const endDateTime = new Date(`${props.date}T${normalizeTimeForSql(formData.end_time)}`)

    const sqlStart = toSqlDateTime(startDateTime)  // "2026-03-03 00:00:00"
    const sqlEnd = toSqlDateTime(endDateTime)      // "2026-03-03 00:15:00"
    //setting id's of create date times.
    start_time.value = await createDateTime(sqlStart)
    end_time.value = await createDateTime(sqlEnd)

    const response = await shiftServices.create({
      user_id: formData.employee_id,
      department_id: currentUser.value.department_id,
      start_day_id: start_time.value,
      end_day_id: end_time.value,
      color: formData.color,
      position_id: formData.position_id,
      shift_task_list_id: formData.shift_task_list_id,
      is_template: formData.is_template
    })
    console.log("Shift creation response:", response.data);
    emit('close'); // Close the modal after creating the shift

}

// function that updates a shift which is like creating a shift, but it just updates the existing one instead
async function updateShift() {
    const formData = getFormData();
    
    // Convert current selected times to SQL format
    const startDateTime = new Date(`${props.date}T${normalizeTimeForSql(formData.start_time)}`)
    const endDateTime = new Date(`${props.date}T${normalizeTimeForSql(formData.end_time)}`)
    const sqlStart = toSqlDateTime(startDateTime)
    const sqlEnd = toSqlDateTime(endDateTime)
    
    console.log("Form Data to update:", formData);


    // update existing date_time records
    await date_timeServices.update(props.shift.start_day_id, { first_date_time: sqlStart });
    await date_timeServices.update(props.shift.end_day_id, { first_date_time: sqlEnd });

    const response = await shiftServices.update(props.shift.id, {
      user_id: formData.employee_id,
      color: formData.color,
      position_id: formData.position_id,
      shift_task_list_id: formData.shift_task_list_id,
      is_template: formData.is_template
    })
    console.log("Shift update response:", response.data);
    emit('close');
}

// function to delete a shift with confirmation
async function deleteShift(shiftId) {
  if (confirm("Are you sure you want to delete this shift?")) {
    try {
      await shiftServices.delete(shiftId);
      emit('close'); // Close the modal after deleting the shift
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  }
}

//date times will have to be made for each shift that gets created.
async function createDateTime(date){
   const response = await date_timeServices.create({
        first_date_time: date
    })  
    console.log(response.data)
    return response.data.id
}

//this just gets the color attribute from the shift.
function getTextColor(bgColor) {
  // Simple luminance check to pick white or black text
  if (!bgColor) return 'black'
  const c = bgColor.substring(1)      // remove "#"
  const rgb = parseInt(c, 16)         // convert to integer
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = rgb & 0xff
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 186 ? 'black' : 'white'
}

//this is formatting the time for the templates.
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

function formatTimeInputFromISO(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}


// Call this after you fetch shifts
async function populateShiftTemplates() {
  // Filter out templates from all shifts
  const templates = shifts.value.filter(
    shift => shift.is_template === true || shift.is_template === 1 || shift.is_template === "1"
  );

  // For each template, fetch its start/end date-times and add formattedTime
  for (const template of templates) {
    const startObj = await date_timeServices.get(template.start_day_id);
    const endObj = await date_timeServices.get(template.end_day_id);
    const position = await positionServices.get(template.position_id);
    
    // get the task list name if there is one
    let task_list_name = "";
    if (template.shift_task_list_id) {
    const task_list = await task_listServices.get(template.shift_task_list_id);
        task_list_name = task_list.data.name;
    }

    console.log("StartObj:", startObj, "EndObj:", endObj);
    template.formattedTime = `${formatShiftTimeFromISO(startObj.data.first_date_time)} - ${formatShiftTimeFromISO(endObj.data.first_date_time)}`;
    template.position_name = position.data.name;
    template.task_list_name = task_list.data.name;
  }

  // Now shiftTemplates can just point to this array
  shiftTemplates.value = templates;
}

function fillFromTemplate(template){
    selectedPosition.value = template.position_name
    shiftStartTime.value = formatTimeInputFromISO(template.startObj)
    shiftEndTime.value = formatTimeInputFromISO(template.endObj)
    selectedTaskList.value = template.task_list_name
    color.value = template.color
}

</script>

<template>
    <div fluid class="modal">
        
  <div class = "modal-content">
    <div>
        <div class="flex-row">
          <!-- changes the text from "Create Shift" to "Edit Shift" if editing -->
            <h3 class="modal-text">{{ isEditing ? 'Edit' : 'Create' }} Shift for {{ selectedEmployee }} on {{ formattedDate }}</h3>
            <v-btn class = "close-button" @click="$emit('close'), form_content = false">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
        </div>
    <div class="dividing-line"> </div>
    </div>
    <div v-if="!form_content">
        <div v-if="shiftTemplates.length === 0">Loading templates…</div>
        <div v-if="shiftTemplates.length > 0" >
            <h3 class = "modal-header">Shift Templates:</h3>
        <div class="shift-template-grid">
            <v-btn class = "shift-template-button"
            v-for="template in shiftTemplates"
            :key="template.id"
            :style="{ backgroundColor: template.color, color: getTextColor(template.color) }"
            @click="fillFromTemplate(template), form_content = true">
            {{ template.position_name }}
            {{ template.formattedTime }}
            </v-btn>
        </div>
        </div>
        
  </div>

    <div v-if="form_content" class="transition">
        <!-- Middle div -->

        <v-select
  v-model="selectedEmployee"
  :items="employee_names"
  label="Assign to"
  outlined
></v-select>

<div class="flex-row time-color-row">
<v-text-field
  v-model="shiftStartTime"
  label="Start Time"
  type="time"
  clearable
></v-text-field>
<v-text-field
  v-model="shiftEndTime"
  label="End Time"
  type="time"
  clearable
></v-text-field>
<div class="color-picker-wrapper">
    <v-btn
      class="circle-button color-preview-button"
      v-if="!color_picker"
      @click="color_picker = true"
      :style="{ backgroundColor: color, color: getTextColor(color) }"
    >
        <v-icon>mdi-format-color-fill</v-icon>
    </v-btn>
    <v-color-picker class = "modal-color-picker" v-if="color_picker"
        v-model="color"
        mode="swatches"
        :swatches="colorSwatches"
        hide-inputs
        hide-sliders
        hide-canvas
        show-swatches
        @update:modelValue="color_picker = false"
      ></v-color-picker>
</div>
</div>
<v-select
  v-model="selectedPosition"
  :items="position_names"
  label="Position"
  outlined
></v-select>
<v-select
  v-model="selectedTaskList"
  :items="task_lists_names"
  label="Task Lists"
  outlined
></v-select>

<div class="flex-row-baseline">

<v-checkbox-btn v-if="!isEditing"
v-model="saveAsTemplate">
    <template #label>
        <span>Save Shift as Template</span>
    </template>
</v-checkbox-btn></div>

    </div>

    <div>
       
        <div class="dividing-line"> </div>
        <div class="flex-row-right" v-if="!form_content">
            <v-btn v-if="!form_content"class="create-button" icon = "mdi-plus-circle-outline" @click="form_content = true">
            
            Create Custom Shift
            <v-icon class="ml-3">mdi-plus-circle-outline</v-icon>
        </v-btn>

        </div>

        </div>

        <div v-if="form_content" class="flex-row-right">
            <v-btn v-if="!isEditing" class="create-button">Save and Publish</v-btn>
            <v-btn v-if="isEditing" class="delete-button" @click.stop="deleteShift(props.shift.id)">Delete</v-btn>
            <v-btn class="create-button" @click="saveShift()">{{ isEditing ? 'Update' : 'Save' }}</v-btn>    
        </div>
        
    </div>
    
  </div>

</template>

<style scoped>  
/*Julian's form style's start here*/

.modal{
  position: fixed;
  top: 0%;
  background-color: rgba(0, 0, 0, 0.158);
  opacity: 100%;
  z-index: 1000;
  width:100%;
  height:100%;
  display: flex;
  justify-content: center;
  align-items:center;

}


.modal-content{
  background-color: #fefefe;
  display: flex;
  width: 50%;
  height:fit-content;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;

}

.dividing-line{
  border-bottom: 5px solid #cfcfcf;
  margin: 10px 0;
  
}

.flex-row{
    display:flex;
    justify-content: space-between;
}

.time-color-row {
    position: relative;
    align-items: flex-start;
    gap: 12px;
}

.flex-row-baseline{
    display:flex;
}

.flex-row-right{
    display:flex;
    justify-content: flex-end;
}

.modal-text{
    color: rgb(134, 134, 134);
    margin: 0;
    padding: 0;
}

.create-button{
    background-color: #4CAF50;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 50px;
    width: fit-content;
    height: fit-content;
}
.delete-button{
    background-color: #f44336;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 50px;
    width: fit-content;
    height: fit-content;
}

.close-button{
    background-color: transparent;
    color: black;
    border: grey solid 1px;
    cursor: pointer;
    font-size: 20px;
    width: 10px;
    height: fit-content;
}

.form-content{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
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

.transition{
    transition: 0.2s ease-in-out;
}



.modal-color-picker{
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 20;
    height: auto;
    max-height: none;
    overflow: visible;
    flex-shrink: 0;
}

.color-picker-wrapper {
  position: relative;
  flex-shrink: 0;
}

.color-preview-button {
  min-width: 72px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.modal-color-picker :deep(.v-color-picker-swatches) {
  max-height: none;
  overflow: visible;
}

.modal-header{
    color: rgb(148, 148, 148);
    font-size: 18px;
}

.shift-template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.shift-template-button {
  text-align: center;
  font-size: 0.55rem;
  width: 100%;
  max-width: 600px;
}
</style>

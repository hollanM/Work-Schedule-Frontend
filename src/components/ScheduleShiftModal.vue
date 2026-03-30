<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import AuthServices from "../services/authServices";
import positionServices from "../services/positionServices";
import qualification_listServices from "../services/qualification_listServices.js";
import task_listServices from "../services/task_listServices.js";
import employeeServices from "../services/employeeServices.js";
import shiftServices from "../services/shiftServices.js";
import date_timeServices from "../services/date_timeServices.js";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
import { VBtn } from "vuetify/components";

const props = defineProps({
  employee_name: { type: [Number, String], required: true },
  date: { type: String, required: true }
});


const start_time = ref("");
const end_time = ref("");
const selectedPosition = ref(null);
const selectedTag = ref(null);
const selectedTaskList = ref(null); 
const color = ref("#000000");
const saveAsTemplate = ref(false);
const selectedEmployee = ref(props.employee_name)
const router = useRouter();
const fName = ref("");
const lName = ref("");
const user = ref({});
const message = ref("");
const shifts = ref([]);
const employees = ref([]);
const employee_names = ref([]);
const qualification_lists = ref([]);
const qualification_lists_names = ref([]);
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


const shiftRanges = ref([])
const shiftTime = ref('')

function generateShiftRanges() {
  const ranges = []

  for (let i = 0; i < timeList.value.length; i++) {
    for (let j = i + 1; j < timeList.value.length; j++) {
      ranges.push(`${timeList.value[i]} - ${timeList.value[j]}`)
    }
  }

  shiftRanges.value = ranges
}

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
  await getQualificationLists();
  await getTaskLists();
  await getEmployees();
  await getShifts();
  await populateShiftTemplates();
  generateTimes();
  generateShiftRanges(); 
});


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

async function getQualificationLists(){
  try{
    const response = await qualification_listServices.getAll();
    qualification_lists.value = response.data;
    console.log("returned:" + qualification_lists.value);
    qualification_lists_names.value = qualification_lists.value.map(ql => ql.qualification_description);
    console.log("qualification list names:" + qualification_lists_names.value);
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

async function getEmployees(){
  try{
    const response = await employeeServices.getAll();
    employees.value = response.data;
    console.log("returned:" + employees.value);
    employee_names.value = employees.value.map(emp => emp.name);
    console.log("employee names:" + employee_names.value);
  }
  catch(error){
    message.value = "Error: " + error.code + ":" + error.message;
    //console.log(message.value); //cant believe message is assigned but not used, (its passed to the sidebar)
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
        return { ...shift, startObj: start.first_date_time, endObj: end.first_date_time };
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
  return {
    employee_id: employees.value.find(emp => emp.name === selectedEmployee.value)?.id,
    shiftTime: shiftTime.value,
    color: color.value,
    position_id: positions.value.find(pos => pos.name === selectedPosition.value)?.id, // if needed as name or map to id similarly
    qualification_list_id: qualification_lists.value.find(q => q.qualification_description === selectedTag.value)?.id,
    shift_task_list_id: task_lists.value.find(t => t.name === selectedTaskList.value)?.id,
    is_template: saveAsTemplate.value
  }
}

//the times need to be converted into sql times to be stored. annoying, but necessary.
function convertTo24Hour(timeStr) {
  // timeStr example: "12:15 am" or "4:30 pm"
  const [time, modifier] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)

  if (modifier.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12
  }
  if (modifier.toLowerCase() === 'am' && hours === 12) {
    hours = 0
  }

  // pad to 2 digits
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')

  return `${hh}:${mm}:00` // seconds optional
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





async function createShift(){
    const formData = getFormData();
    console.log("Form Data to submit:", formData);
    // Here you would send formData to your backend API to create the shift
    // Example: await shiftServices.create(formData);
    

    const shiftTime = formData.shiftTime
    const [startStr, endStr] = shiftTime.split(' - ')

    const startDateTime = new Date(`${props.date}T${convertTo24Hour(startStr)}`)
    const endDateTime = new Date(`${props.date}T${convertTo24Hour(endStr)}`)

    const sqlStart = toSqlDateTime(startDateTime)  // "2026-03-03 00:00:00"
    const sqlEnd = toSqlDateTime(endDateTime)      // "2026-03-03 00:15:00"
    //setting id's of create date times.
    start_time.value = await createDateTime(sqlStart)
    end_time.value = await createDateTime(sqlEnd)

    const response = await shiftServices.create({
      employee_id: formData.employee_id,
      start_day_id: start_time.value,
      end_day_id: end_time.value,
      color: formData.color,
      position_id: formData.position_id,
      qualification_list_id: formData.qualification_list_id,
      shift_task_list_id: formData.shift_task_list_id,
      is_template: formData.is_template
    })
    console.log("Shift creation response:", response.data);
    emit('close'); // Close the modal after creating the shift

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
    const task_list = await task_listServices.get(template.shift_task_list_id);
    const qualification_list = await qualification_listServices.get(template.qualification_list_id);

    // Add a new property just for frontend display
    console.log("StartObj:", startObj, "EndObj:", endObj);
    template.formattedTime = `${formatShiftTimeFromISO(startObj.data.first_date_time)} - ${formatShiftTimeFromISO(endObj.data.first_date_time)}`;
    template.position_name = position.data.name;
    template.task_list_name = task_list.data.name;
    template.qualification_list_name = qualification_list.data.qualification_description;
  }

  // Now shiftTemplates can just point to this array
  shiftTemplates.value = templates;
}

function fillFromTemplate(template){
    selectedPosition.value = template.position_name
    shiftTime.value = template.formattedTime
    selectedTaskList.value = template.task_list_name
    selectedTag.value = template.qualification_list_name
    color.value = template.color
}

</script>

<template>
    <div fluid class="modal">
        
  <div class = "modal-content">
    <div>
        <div class="flex-row">
            <h3 class="modal-text">Create Shift for {{ selectedEmployee }} on {{ formattedDate }}</h3>
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
  v-if="employee_names.length"
  v-model="selectedEmployee"
  :items="employee_names"
  label="Assign to"
  outlined
></v-select>

<div class="flex-row">
<v-autocomplete
  v-model="shiftTime"
  :items="shiftRanges"
  label="Time"
  clearable
  :custom-filter="filterShifts"
  @update:modelValue="val => shiftTime = val"
></v-autocomplete>
    <v-btn class="circle-button" v-if="!color_picker" @click="color_picker = true">
        <v-icon class="ml-3">mdi-format-color-fill</v-icon>
    </v-btn>
    <v-color-picker class = "modal-color-picker" v-if="color_picker" @click="color_picker = false"
        v-model="color"
        mode="swatches"
        hide-inputs
        hide-sliders
        hide-canvas
        show-swatches
      ></v-color-picker>    
</div>
<v-select
  v-if="position_names.length"
  v-model="selectedPosition"
  :items="position_names"
  label="Position"
  outlined
></v-select>
<v-select
v-if="qualification_lists_names.length"
  v-model="selectedTag"
  :items="qualification_lists_names"
  label="Qualifications"
  outlined
></v-select>
<v-select
  v-model="selectedTaskList"
  v-if="task_lists_names.length"
  :items="task_lists_names"
  label="Task Lists"
  outlined
></v-select>

<div class="flex-row-baseline">

<v-checkbox-btn
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
            <v-btn class="create-button">
            Save and Publish
        </v-btn>
        <v-btn class="create-button" @click="createShift()">
            Save
        </v-btn>
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
    height: 80px;
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

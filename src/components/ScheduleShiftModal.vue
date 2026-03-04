<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import AuthServices from "../services/authServices";
import positionServices from "../services/positionServices";
import qualification_listServices from "../services/qualification_listServices.js";
import task_listServices from "../services/task_listServices.js";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
import { VBtn } from "vuetify/components";

const selectedPosition = ref(null);
const selectedTag = ref(null);
const selectedTaskList = ref(null); 
const router = useRouter();
const fName = ref("");
const lName = ref("");
const user = ref({});
const message = ref("");
const qualification_lists = ref([]);
const qualification_lists_names = ref([]);
const task_lists = ref([]);
const task_lists_names = ref([]);
const positions = ref([]);
const position_names = ref([]);
const form_content = ref(false);
const color_picker = ref(false);
const emit = defineEmits(["close"]);
const props = defineProps({
  employee_name: { type: [Number, String], required: true },
  date: { type: String, required: true }
});

//trying to force local time here, since timezones ruin everything. 
const formattedDate = computed(() =>
  new Date(props.date + 'T00:00:00')
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
)
const form = reactive({
  name: '',
  status: 'not started'
});


onMounted(() => {
  console.log("onMounted ran")
  getPositions();
  getQualificationLists();
  getTaskLists();

});

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

</script>

<template>
    <div fluid class="modal">
        
  <div class = "modal-content">
    <div>
        <div class="flex-row">
            <h3 class="modal-text">Create Shift for {{ props.employee_name }} on {{ formattedDate }}</h3>
            <v-btn class = "close-button" @click="$emit('close'), form_content = false">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
        </div>
    <div class="dividing-line"> </div>
    </div>
    <div v-if="!form_content">
        <h3>your templates:</h3>
    </div>
    <div v-if="form_content" class="transition">
        <!-- Middle div -->
<div class="flex-row">
   <v-autocomplete
  v-model="shiftTime"
  :items="shiftTimes"
  label="Shift Time"
  clearable
  outlined
/>
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
<v-textarea
  label="Shift Notes"
  outlined
></v-textarea>

<div class="flex-row-baseline">
    <v-checkbox-btn>
    <template #label>
        <span>Repeat Shift</span>
    </template>
</v-checkbox-btn>

<v-checkbox-btn>
    <template #label>
        <span>Save Shift as Template</span>
    </template>
</v-checkbox-btn></div>

    </div>

    <div>
       
        <div class="dividing-line"> </div>
         <v-btn v-if="!form_content"class="create-button" icon = "mdi-plus-circle-outline" @click="form_content = true">
            
            Create Custom Shift
            <v-icon class="ml-3">mdi-plus-circle-outline</v-icon>
        </v-btn>
        <div v-if="form_content" class="flex-row-right">
            <v-btn class="create-button">
            Save and Publish
        </v-btn>
        <v-btn class="create-button">
            Save
        </v-btn>
        </div>
        
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

.circle-button{
    background-color: #00000000;
    color: rgb(148, 148, 148);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 40px;
    height: 60px;
    font-size: 40px;
    padding-top: 10px;
}

.modal-color-picker{
    height: 80px;
}

</style>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import store from "../store/store.js"
import userServices from "../services/userServices"
import positionServices from "../services/positionServices.js"
import task_listServices from '../services/task_listServices.js'
import taskServices from '../services/taskServices.js'

//comment.
const user = ref(null);
const currentUser = ref(null)
const drawer = ref(false)
const loggedIn = ref(false)
const positions = ref([])
const position_names = ref([])
const message = ref("")
const addPositionModal = ref(false)
const positionName = ref("")
const selectedPosition = ref("")
const positionId = ref("")
const taskListId = ref("")
const editPositionModal = ref(false)
const deletePositionModal = ref(false)
const task_lists = ref([])
const addTaskListModal = ref(false)
const task_list_name = ref("")
const saved_task_list_name = ref("")
const current_step_color = ref("#4CAF50")
const unfinished_step_color = ref("#cfcfcf")
const check_mark_color = ref("#4CAF50")
const task_list_name_chosen = ref(false)
const new_tasks = ref([])
const saved_tasks = ref([])
const latest_task_id= ref(0)
const task_name = ref("")
const selectedTaskList =ref("")//this ref is repetitive, I just got lazy here.
const tasks = ref([])
const current_tasks = ref([])//this is also a repetitive ref. I'm just lazy again.
const tasks_to_delete = ref([])
const tasks_to_add = ref([])//repetitive. I want to be organized.
const deleteTaskListModal = ref(false)
const editTaskListModal = ref(false)
const userSession = computed(() => store.getters.getLoginUserInfo);
console.log(userSession.value);

async function savePosition(){
  const response = await positionServices.create({
    name: positionName.value 
  })
  message.value = response.data
  console.log(message.value)

  await getPositions();
}

async function deletePosition(id){
  const response = await positionServices.delete(id);
  console.log(response.data)
  await getPositions()
}

async function getCurrentUser(){
    //this guard is not needed, session works as intended.
    console.log('userSession.value:', userSession.value);
    if (!userSession.value || !userSession.value.userId) {
      console.log('No user session or userId');
      return;
    }
    const response = await userServices.get(userSession.value.userId);
    currentUser.value = response.data;
}

async function getTaskLists(){
  const response = await task_listServices.getAll();
  task_lists.value = response.data;
  console.log(response.data)
}

async function getTasks(){
  const response = await taskServices.getAll();
  tasks.value = response.data
  console.log(response.data)
}
onMounted( async () => {
 await getCurrentUser()
  await getPositions();
  await getTaskLists();
  await getTasks();
});

watch(
  () => userSession.value?.userId,
  (newId) => {
    if (newId) {
      getCurrentUser()
    }
  },
  { immediate: true }
)

function toggleDropdown(name) {
  switch(name) {
    case 'Positions':
      positionOptionsOpen.value = !positionOptionsOpen.value
      break
    case 'View Options':
      viewOptionsOpen.value = !viewOptionsOpen.value
      break
    case 'Tags':
      viewTagsOpen.value = !viewTagsOpen.value
      break
    case 'Job Sites':
      viewJobSitesOpen.value = !viewJobSitesOpen.value
      break
    case 'Task Lists':
      viewTaskListsOpen.value = !viewTaskListsOpen.value
      break
  }
}

function toggle(){
  drawer.value = !drawer.value
}

async function editPosition(id){
  const obj = {name: selectedPosition.value}
  console.log("New name: "+ selectedPosition.value)
  const response = await positionServices.update(id, obj);
  console.log(response.data)
  await getPositions();
}

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

const resetMenu = () => {
  user.value = null;
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  }
};

function resetTaskListModal(){
  unfinished_step_color.value = "#cfcfcf"
  task_list_name_chosen.value = false
  task_list_name.value = ""
  new_tasks.value = [];
  console.log(task_list_name_chosen)
  console.log(unfinished_step_color)
}

function addTask(){
  new_tasks.value.push({id: latest_task_id.value, name: task_name.value})
  latest_task_id.value = latest_task_id.value + 1;
  task_name.value = ""
}

function removeTask(task_name){
  console.log(task_name)
  console.log(new_tasks.value)
  console.log(new_tasks.value.findIndex(task => task.name === task_name))
  const index = new_tasks.value.findIndex(task => task.name === task_name)
  if(index !== -1){
       new_tasks.value.splice(index, 1)
  }

}

async function createTaskList() {
  console.log("task list name:" + saved_task_list_name.value)
  const response = await task_listServices.create({name: saved_task_list_name.value});
  const task_list_id = response.data.id;
  console.log(response.data.id)

//  saved_tasks.value.forEach(async(task, index) => {
//     const task_response = await taskServices.create({name: task.name, shift_task_list_id: task_list_id})
//     console.log(task_response.data)
//  })
//CHANGES HERE FROM HOLLAN
for (const task of saved_tasks.value) 
{
  await taskServices.create({ name: task.name,shift_task_list_id: task_list_id});
}

 await getTaskLists()
 await getTasks()
  
}

async function deleteTaskList(id){
tasks_to_delete.value = tasks.value.filter(task => task.shift_task_list_id === id);
console.log("tasks to delete: " + tasks_to_delete.value)
// tasks_to_delete.value.forEach( async(task, index) =>{
//   const response = await taskServices.delete(task.id);
//   console.log(response.data)
// })
// HOLLAN'S CHANGE HERE!!!!!!!!!!!
for (const task of tasks_to_delete.value) 
{ 
  await taskServices.delete(task.id);
}

const task_list_response = await task_listServices.delete(id);
console.log(task_list_response.data)

await getTaskLists()
await getTasks()

}

async function updateTaskList(id) {
  await task_listServices.update(id, {name: saved_task_list_name.value})

  //remove any task lists that were removed before
  //get all current tasks lists
  current_tasks.value = tasks.value.filter(task => task.shift_task_list_id === id)
  console.log(current_tasks.value)
  //compare with new tasks, get tasks we need to delete.
  tasks_to_delete.value = current_tasks.value.filter(task => !saved_tasks.value.some(saved_task => saved_task.id === task.id))
  console.log("Tasks to get rid of: " + tasks_to_delete.value)
  //delete the tasks that they removed.
  for (const task of tasks_to_delete.value) {
  await taskServices.delete(task.id)
}
  //add any new tasks they added

  const tasks_to_add = saved_tasks.value.filter(
  saved => !current_tasks.value.some(curr => curr.id === saved.id)
)
for (const task of tasks_to_add) {
  await taskServices.create({
    name: task.name,
    shift_task_list_id: id
  })
}
}

// async function handleUpdateTaskList() {
//   console.log("top of update function");
//   saved_tasks.value = [...new_tasks.value]

//   await updateTaskList(taskListId.value).then(async() => {
//     console.log("update task list successful")
//      await getTaskLists();
//      await getTasks();
//   }).catch(error => {
//     console.log("error updating task list: " + error)
//   })

//   await task_listServices.get(taskListId.value).then(response => {
//     console.log("fetched updated task list: " + response.data.name)
//   }).catch(error => {
//     console.log("error fetching updated task list: " + error)
//   })

//   resetTaskListModal()
//   editTaskListModal.value = false

//   console.log("updated task lists")
//    await getTaskLists();
//    await getTasks();
// }
//Revised function
async function handleUpdateTaskList() {
  console.log("top of update function");
  saved_tasks.value = [...new_tasks.value];

  try {
    await updateTaskList(taskListId.value);
    console.log("update task list successful");

    const response = await task_listServices.get(taskListId.value);
    console.log("fetched updated task list:", response.data.name);

    await Promise.all([getTaskLists(), getTasks()]); // Hey julian this helps makes sure that everything is there before resettinG, rather calling over the await getTaskLists();await getTasks(); over and over
  } 
  catch (error) {
    console.log("error updating task list:", error);
  }

  resetTaskListModal();
  editTaskListModal.value = false;
}




function setTaskEditModal(){
  task_list_name.value = selectedTaskList.value
  latest_task_id.value = tasks.value.length + 1
  console.log("task_list model: " + task_list_name.value)
  console.log("task_list_id:  " + taskListId.value)
  new_tasks.value = tasks.value.filter(task => task.shift_task_list_id === taskListId.value)
  console.log("new tasks to prefill: " + new_tasks.value);
}

</script>

<template id="sidebarTemplate">
  <v-navigation-drawer
    v-model="drawer"
    app
    class = "drawer"
  >
   
  <v-expansion-panels>
  <v-expansion-panel title="Positions">
    <v-expansion-panel-text>
      <v-list>

        
        <v-list-item
          v-for="item in positions"
          :key="item.id"
        >
        <div class ="flex-row">
        <span>{{ item.name }}</span>
        <div class = "flex-row-right">
      <v-icon class="hover-icon" @click="editPositionModal = true, selectedPosition = item.name, positionId = item.id">
        mdi-pencil
      </v-icon>
      <v-icon class="hover-icon" @click="deletePositionModal = true, selectedPosition = item.name, positionId = item.id">
        mdi-trash-can-outline
      </v-icon>
      </div>
    </div>
      
      </v-list-item>
      </v-list>
       <v-list-item style="cursor: pointer;" @click="addPositionModal = true">
      <div style="display: flex; align-items: center; gap: 8px;">
        <v-icon>mdi-plus</v-icon>
        <span>Add Position</span>
      </div>
    </v-list-item>
    </v-expansion-panel-text>
    
  </v-expansion-panel>

   <v-expansion-panel
    title="Task Lists"
  >

      <v-expansion-panel-text>
      <v-list>

        
        <v-list-item
          v-for="item in task_lists"
          :key="item.id"
        >
        <div class ="flex-row">
        <span>{{ item.name }}</span>
        <div class = "flex-row-right">
      <v-icon class="hover-icon" @click="editTaskListModal = true, selectedTaskList = item.name, taskListId = item.id, setTaskEditModal()">
        mdi-pencil
      </v-icon>
      <v-icon class="hover-icon" @click="deleteTaskListModal = true, selectedTaskList = item.name, taskListId = item.id">
        mdi-trash-can-outline
      </v-icon>
      </div>
    </div>
      
      </v-list-item>
      </v-list>
       <v-list-item style="cursor: pointer;" @click="addTaskListModal = true">
      <div style="display: flex; align-items: center; gap: 8px;">
        <v-icon>mdi-plus</v-icon>
        <span>Add Task List</span>
      </div>
    </v-list-item>
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>
  </v-navigation-drawer>

    <v-btn v-if="userSession && userSession.userId" class="circle-button zero-margin "  @click="toggle()"
    :class="{ closed: !drawer }"
    >
        <v-icon class="ml-3">
          {{ drawer ? 'mdi-chevron-left' : 'mdi-chevron-right' }}
        </v-icon>
    </v-btn>



    <div v-if="addPositionModal" fluid class="modal">
        
  <div class = "modal-content">
    <div class="flex-row">
    <h3 class = "modal-text">Add position</h3>
     <v-btn class = "close-button" @click="addPositionModal= false">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
            </div>

              <div class="dividing-line"> </div>
    <v-text-field 
    v-model="positionName"
    label="Name"></v-text-field>

      <div class="dividing-line"> </div>
      <div class="flex-row-right">
          <v-btn class="create-button" @click="savePosition(), addPositionModal = false, positionName = ''">
            Save
        </v-btn>
      </div>
      
  </div>
  </div>



  <div v-if="editPositionModal" fluid class="modal">
        
  <div class = "modal-content">
    <div class="flex-row">
    <h3 class = "modal-text">Edit position: {{selectedPosition}}</h3>
     <v-btn class = "close-button" @click="editPositionModal= false">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
            </div>

              <div class="dividing-line"> </div>
    <v-text-field 
    v-model="selectedPosition"
    label="Name"></v-text-field>

      <div class="dividing-line"> </div>
      <div class="flex-row-right">
          <v-btn class="create-button" @click="editPosition(positionId), editPositionModal = false">
            Save
        </v-btn>
      </div>
      
  </div>
  </div>


  <div v-if="deletePositionModal" fluid class="modal">
        
  <div class = "modal-content">
    <div class="flex-row">
    <h3 class = "modal-text">Delete Position {{selectedPosition}} ?</h3>
     <v-btn class = "close-button" @click="deletePositionModal= false">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
            </div>

            <div class ="dividing-line opacity-0"></div>
      <div class="flex-row"> 
        <v-btn class="option-button" @click="deletePositionModal = false">
            cancel
        </v-btn>
          <v-btn class="delete-button" @click="deletePosition(positionId), deletePositionModal = false">
            delete
        </v-btn>
      </div>
      
  </div>
  </div>

  
    <div v-if="addTaskListModal" fluid class="modal">
        
  <div class = "task-list-modal-content">
    <div class="task-list-flex-row">

     <div id ="progress-div" class = "flex-column">
      <h3 id="task-list-header" class = "black-modal-text">New Task List</h3>
      <div class ="flex-column align-items-center">
        <div class="flex-row"> 
          <v-icon v-if="task_list_name_chosen"
          :style="{color: check_mark_color}"
          >
            mdi-check-circle
          </v-icon>
          <v-icon v-if="!task_list_name_chosen"
          :style="{color: current_step_color}"
          >
              mdi-numeric-1-circle
          </v-icon>
          <span>Name</span>
        </div>
          <div class="flex-row"> 

           <v-icon
          :style="{color: unfinished_step_color}"
          >
              mdi-numeric-2-circle
          </v-icon>
          <span>Tasks</span>
        </div>
         
      </div>
    </div>
  
<div id="vertical-task_list-div" class ="vertical-dividing-line"></div>

<div id = "name-task_list-div" class = "flex-column">
  <div class="flex-row">
      <h3 v-if="!task_list_name_chosen" class ="modal-text">Name your Task List</h3>
      <h3 v-if="task_list_name_chosen" class ="modal-text">Add Tasks</h3>
        <v-btn class = "close-button" @click="addTaskListModal= false, resetTaskListModal()">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
  </div>
  <div class="divding-line"></div>

  <div v-if="!task_list_name_chosen" class="flex-column">
<v-text-field 
    v-model="task_list_name"
    label="Name"></v-text-field>


    <div class="flex-row-right">
          <v-btn v-if="task_list_name.length > 0" class="create-button" @click="task_list_name_chosen = true, unfinished_step_color = current_step_color, saved_task_list_name = task_list_name">
            Continue
        </v-btn>
      </div>
  </div>

    <div v-if="task_list_name_chosen" class="flex-column">
      <span id ="no-tasks-span" v-if="new_tasks.length === 0">No Tasks Added</span>
      <v-list class ="scrollable-list" v-if="new_tasks.length > 0">
        <v-list-item
        v-for="task in new_tasks"
        :key = task.id
        > 

        <div class ="flex-row">
        <span>{{ task.name }}</span>
        <div class = "flex-row-right">
      <v-icon class="hover-icon" @click="removeTask(task.name)">
        mdi-trash-can-outline
      </v-icon>
    </div>
      </div>
        </v-list-item>
      </v-list>
<v-text-field 
    v-model="task_name"
    label="Name"></v-text-field>

    <v-btn id="add-task-button" class="create-button" @click="addTask()">
            Add
        </v-btn>


    <div class="flex-row-right">
          <v-btn v-if="new_tasks.length > 0"class="create-button" @click="addTaskListModal= false, saved_tasks = new_tasks, resetTaskListModal(), createTaskList()">
            Finish
        </v-btn>
      </div>
  
  </div>
   </div>

</div>



    </div>

  </div>



     <div v-if="editTaskListModal" fluid class="modal">
        
  <div class = "task-list-modal-content">
    <div class="task-list-flex-row">

     <div id ="progress-div"-2 class = "flex-column">
      <h3 id="task-list-header-2" class = "black-modal-text">Edit Task List {{ selectedTaskList }}</h3>
      <div class ="flex-column align-items-center">
        <div class="flex-row"> 
          <v-icon v-if="task_list_name_chosen"
          :style="{color: check_mark_color}"
          >
            mdi-check-circle
          </v-icon>
          <v-icon v-if="!task_list_name_chosen"
          :style="{color: current_step_color}"
          >
              mdi-numeric-1-circle
          </v-icon>
          <span>Name</span>
        </div>
          <div class="flex-row"> 

           <v-icon
          :style="{color: unfinished_step_color}"
          >
              mdi-numeric-2-circle
          </v-icon>
          <span>Tasks</span>
        </div>
         
      </div>
   
     </div>
<div id="vertical-task_list-div-2" class ="vertical-dividing-line"></div>

<div id = "name-task_list-div-2" class = "flex-column">
  <div class="flex-row">
      <h3 v-if="!task_list_name_chosen" class ="modal-text">Task List name</h3>
      <h3 v-if="task_list_name_chosen" class ="modal-text">Update your Tasks</h3>
        <v-btn class = "close-button" @click="editTaskListModal= false, resetTaskListModal()">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
  </div>
  <div class="divding-line"></div>

  <div v-if="!task_list_name_chosen" class="flex-column">
<v-text-field 
    v-model="task_list_name"
    label="Name"></v-text-field>


    <div class="flex-row-right">
          <v-btn v-if="task_list_name.length > 0" class="create-button" @click="task_list_name_chosen = true, unfinished_step_color = current_step_color, saved_task_list_name = task_list_name">
            Continue
        </v-btn>
      </div>
  </div>

    <div v-if="task_list_name_chosen" class="flex-column">
      <span id ="no-tasks-span-2" v-if="new_tasks.length === 0">No Tasks Added</span>
      <v-list class ="scrollable-list" v-if="new_tasks.length > 0">
        <v-list-item
        v-for="task in new_tasks"
        :key = task.id
        > 

        <div class ="flex-row">
        <span>{{ task.name }}</span>
        <div class = "flex-row-right">
      <v-icon class="hover-icon" @click="removeTask(task.name)">
        mdi-trash-can-outline
      </v-icon>
    </div>
      </div>
        </v-list-item>
      </v-list>
<v-text-field 
    v-model="task_name"
    label="Name"></v-text-field>

    <v-btn id="add-task-button-2" class="create-button" @click="addTask()">
            Add
        </v-btn>


    <div class="flex-row-right">
          <v-btn v-if="new_tasks.length > 0"class="create-button" @click="editTaskListModal= false, handleUpdateTaskList(taskListId)">
            Finish 
        </v-btn>
      </div>
  </div>


</div>
</div>
       
   
  
      
  </div>
  </div>



    <div v-if="deleteTaskListModal" fluid class="modal">
        
  <div class = "modal-content">
    <div class="flex-row">
    <h3 class = "modal-text">Delete Task List {{selectedTaskList}} ?</h3>
     <v-btn class = "close-button" @click="deleteTaskListModal= false">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
            </div>

            <div class ="dividing-line opacity-0"></div>
      <div class="flex-row"> 
        <v-btn class="option-button" @click="deleteTaskListModal = false">
            cancel
        </v-btn>
          <v-btn class="delete-button" @click="deleteTaskList(taskListId), deleteTaskListModal = false">
            delete
        </v-btn>
      </div>
      
  </div>
  </div>

</template>

<style scoped>

.circle-button{
    background-color: #ff000000;
    color: rgb(148, 148, 148);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 10px !important;
    height: 30px !important;
    min-width: 30px;
    font-size: 20px;
    z-index: 1001;
    position: absolute;
  top: 50%;
  left: 256px; /* drawer width */
  transform: translate(-50%, -50%);
  transition: left 0.25s ease;
}

.closed{
    background-color: #ff000000;
    color: rgb(148, 148, 148);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 10px !important;
    height: 30px !important;
    min-width: 30px;
    font-size: 20px;
    z-index: 1001;
    position: absolute;
  top: 50%;
  left: 0; /* drawer width */
  transform: translate(-50%, -50%);
  transition: left 0.25s ease;
}

.drawer{
  overflow: visible;
}

.zero-margin{
  margin: 0;
}

.chevron-top {
  align-self: flex-start; /* fixes it to top instead of vertically centered */
}

.modal{
  position: fixed;
  top: 0%;
  background-color: rgba(0, 0, 0, 0.158);
  opacity: 100%;
  z-index: 10000;
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

.task-list-modal-content{
  background-color: #fefefe;
  display: flex;
  width: 60%;
  height:fit-content;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;

}

.task-list-flex-row{
  display:flex;
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

.modal-text{
    color: rgb(134, 134, 134);
    margin: 0;
    padding: 0;
}


.flex-row-right{
    display:flex;
    justify-content: flex-end;
}

.flex-row{
    display:flex;
    justify-content: space-between;
}

.flex-column{
  display: flex;
  flex-direction: column;
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
    background-color: #b93f3f;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 50px;
    width: fit-content;
    height: fit-content;
}

.option-button{
   background-color: #939393;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 50px;
    width: fit-content;
    height: fit-content;
}

.dividing-line{
  border-bottom: 5px solid #cfcfcf;
  margin: 10px 0;
  
}
.vertical-dividing-line{
  border-right: 5px solid #cfcfcf;
  margin: 10px 0;
}

.clickable {
  cursor: pointer;
}
.hover-icon {
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

 .hover-icon:hover {
  opacity: 1;
}

.opacity-0{
  opacity: 0;
}

.black-modal-text{
      color: rgb(0, 0, 0);
    margin: 0;
    padding: 0;
    font-size: 1.3vw;
}

.align-items-center{
  align-items: center;
}
.scrollable-list {
  height: 130px !important;
  max-height: 130px !important;
  overflow-y: auto !important;
}

#progress-div{
  margin-right: 10%;
}

#name-task_list-div{
  width: 65% !important;
}

#vertical-task_list-div{
  margin-right: 5%;
}

#task-list-header{
  margin-bottom: 5%;
}

#no-tasks-span{
  height: 130px;
}

#add-task-button{
  margin-bottom: 20px;
}

#progress-div-2{
  margin-right: 10%;
}

#name-task_list-div-2{
  width: 65% !important;
}

#vertical-task_list-div-2{
  margin-right: 5%;
}

#task-list-header-2{
  margin-bottom: 5%;
}

#no-tasks-span-2{
  height: 130px;
}

#add-task-button-2{
  margin-bottom: 20px;
}
  
#sidebarTemplate /* I tried but this did not put the sidebar under the popup */
{
  z-index: 980;
}
</style>

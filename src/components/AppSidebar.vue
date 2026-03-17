<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import store from "../store/store.js"
import userServices from "../services/userServices"
import positionServices from "../services/positionServices.js"

const user = ref(null);
const currentUser = ref(null)
const drawer = ref(false)
const loggedIn = ref(false)
const positions = ref([])
const position_names = ref([])
const message = ref("")
const addPositionModal = ref(false)
const positionName = ref("")

const userSession = computed(() => store.getters.getLoginUserInfo);
console.log(userSession.value);

async function savePosition(){
  const response = await positionServices.create({
    name: positionName.value 
  })
  message.value = response.data
  console.log(message.value)
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
onMounted( async () => {
 await getCurrentUser()
  await getPositions();
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




</script>

<template>
   
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
          :title="item.name"
        />
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
          <v-btn class="create-button" @click="savePosition(), addPositionModal = false">
            Save
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

.dividing-line{
  border-bottom: 5px solid #cfcfcf;
  margin: 10px 0;
  
}
</style>



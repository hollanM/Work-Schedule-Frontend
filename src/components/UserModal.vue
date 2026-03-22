<script setup>
import { defineProps, defineEmits, ref, watch, shallowRef, computed } from "vue";
import {onClickOutside} from "@vueuse/core";

const props = defineProps({
  isOpen: Boolean,
  selectedComponent: { type: String, default: 'ProfileModal' },
});

const emit = defineEmits(["modal-close"]);
const target = ref(null)
const form = ref({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "",
});
const currentComponent = ref(props.selectedComponent);
const selectedSchedules = ref([]);
const selectedPositions = ref([]);
const selectedTags = ref([]);

onClickOutside(target, (event) => { //had issues with this one, needed to ignore certain clicks
  const target = event?.target;
  if (!target) return;
  // keep popups open when interacting with v-select menu dropdown
  if (target.closest('.v-menu, .v-overlay, .v-list-item, .v-select')) //ignoring these clickable items
    return;
  emit('modal-close');
});

const menuItems = [ //same as Sam's sidebar, but for the user modal
  { name: 'Profile', component: 'ProfileModal' }, //are the componet pieces needed anymore?
  { name: 'Assignments', component: 'AssignmentsModal' },
  { name: 'Hourly Rates', component: 'HourlyRatesModal' },
  { name: 'Log Notes', component: 'LogNotesModal' },
  { name: 'Advanced', component: 'AdvancedModal' },
]

watch(() => props.selectedComponent, (value) => {
    if (value) currentComponent.value = value;
});

const changeModalContent = (item) => {
    //console.log("Changing modal content to:", item);
    currentComponent.value = item;
};

const scheduleItems = [
    { title: 'Schedule 1', route: '/schedule1' },
    { title: 'Schedule 2', route: '/schedule2' },
    { title: 'Schedule 3', route: '/schedule3' },
];

const positionItems = [
    { title: 'Position 1', route: '/position1' },
    { title: 'Position 2', route: '/position2' },
    { title: 'Position 3', route: '/position3' },
];

const tagItems = [
    { title: 'Tag 1', route: '/tag1' },
    { title: 'Tag 2', route: '/tag2' },
    { title: 'Tag 3', route: '/tag3' },
];

const submit = () => { //having this might prevent some issues, but it does nothing
    console.log('Form submitted');
};
</script>

<template>
    <div v-if="isOpen" class="modal-popup">
        <div class="modal-wrapper">
            <div class="modal-container" ref="target">
                <v-list nav id="userModalNav">
                    <v-list-item v-for="item in menuItems" :key="item.name" @click="changeModalContent(item.component)">
                        <template>
                            <v-icon :icon="item.icon" />
                        </template>
                        <v-list-item-title id="userModalOptions">
                            {{ item.name }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
                <!-- end of sidebar -->
                <!-- beginning of screens -->
                <div id="addUserModalScreen"> 
                    <!-- profile content -->
                    <div v-if="currentComponent == 'ProfileModal'">
                        <div>
                            <div id="topBar">
                                <p id="title">Add User</p>
                                <div id="header">
                                    <button @click.stop="emit('modal-close')">X</button>
                                </div>
                            </div>
                            <hr id="pageBreakTop"/>
                            <form @submit.prevent="submit" id="formContainer">
                                <div id="formHolder">
                                    <div id="formDiv">
                                        <div class="field">
                                            <label>First Name</label>
                                            <input id="firstNameForm" type="text" v-model="form.firstName" />
                                        </div>
                                        <div class="field">
                                            <label>Last Name</label>
                                            <input id="lastNameForm" type="text" v-model="form.lastName" />
                                        </div>
                                        <div class="field">
                                            <label>Email</label>
                                            <input id="emailForm" type="email" v-model="form.email" />
                                        </div>
                                        <div class="field">
                                            <label>Phone Number</label>
                                            <input id="phoneNumberForm" type="text" v-model="form.phoneNumber" />
                                        </div>
                                        <div class="field">
                                            <label>Role</label>
                                            <input id="roleForm" type="text" v-model="form.role" />
                                        </div>
                                    </div> <!-- will need to change later to the users google picture -->
                                    <img id="userModalImage" src="../../public/profileAndSettings.png"/>
                                </div>
                                <hr id="pageBreakBottom"/>
                                <div id="buttonDiv">
                                    <button id="addUserButton" type="submit">Add User</button>
                                    <div id="footer">
                                        <button id="continueButton" @click="changeModalContent('AssignmentsModal')"> Continue to Assignments </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <!-- assignments content -->
                    <div v-if="currentComponent == 'AssignmentsModal'"> 
                        <div id="assignmentsTopBar">
                            <p id="title">Add User</p>
                            <div id="header">
                                <button @click.stop="emit('modal-close')">X</button>
                            </div>
                        </div>
                        <hr id="assignmentsPageBreakTop"/>
                        <form @submit.prevent="submit" id="formContainer"> 
                            <div id="assignmentsFormDiv">
                                <p class="dropdown-title"> Schedules </p>
                                <v-select v-model="selectedSchedules" :items="scheduleItems" item-title="title" item-value="title" label="Select Schedules" class="dropdown" hide-details @click.stop></v-select>
                                <p class="dropdown-title"> Positions </p>
                                <v-select v-model="selectedPositions" :items="positionItems" item-title="title" item-value="title" label="Select Positions" class="dropdown" hide-details @click.stop></v-select>
                                <p class="dropdown-title"> Tags </p>
                                <v-select v-model="selectedTags" :items="tagItems" item-title="title" item-value="title" label="Select Tags" class="dropdown" hide-details @click.stop></v-select><!-- hide details is require to remove a vue computed spacer -->
                            </div>
                        </form>
                        <hr id="assignmentsPageBreakBottom"/>
                        <div id="assignmentsButtonDiv">
                            <button id="addAssignmentsButton" type="submit">Add Assignments</button>
                            <button id="continueButton" @click="changeModalContent('HourlyRatesModal')"> Continue to Hourly Rates </button>
                        </div>
                    </div>
                    <!-- hourly rates content -->
                    <div v-if="currentComponent == 'HourlyRatesModal'"> 
                        <div id="topBar">
                            <p id="title">User Hourly Rates</p>
                            <div id="header">
                                <button @click.stop="emit('modal-close')">X</button>
                            </div>
                        </div>
                        <p>User Hourly Rates Component is working</p>
                        <div id="buttonDiv">
                            <button id="addUserButton" type="submit">Add Hourly Rates</button>
                            <div id="footer">
                                <button id="continueButton" @click="changeModalContent('LogNotesModal')"> Continue to Log Notes </button>
                            </div>
                        </div>
                    </div>
                    <!-- log notes content -->
                    <div v-if="currentComponent == 'LogNotesModal'">
                        <div id="topBar">
                            <p id="title">User Log Notes</p>
                            <div id="header">
                                <button @click.stop="emit('modal-close')">X</button>
                            </div>
                        </div>
                        <p>User Log Notes Component is working</p>
                        <div id="buttonDiv">
                            <button id="addUserButton" type="submit">Add Log Notes</button>
                            <div id="footer">
                                <button id="continueButton" @click="changeModalContent('AdvancedModal')"> Continue to Advanced </button>
                            </div>
                        </div>
                    </div>
                    <!-- advanced content -->
                    <div v-if="currentComponent == 'AdvancedModal'">
                        <div id="topBar">
                            <p id="title">User Advanced</p>
                            <div id="header">
                                <button @click.stop="emit('modal-close')">X</button>
                            </div>
                        </div>
                        <p>User Advanced Component is working</p>
                        <div id="buttonDiv">
                            <button id="addUserButton" type="submit">Add Info</button>
                            <div id="footer">
                                <button id="continueButton" @click="changeModalContent('ProfileModal')"> Save </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/*                        */
/* start of addUser modal */
/*                        */

.userModalImage
{
    width: 100px;
    height: 100px;
    margin-left: 15px;
    margin-top: 15px;
    border-radius: 50%;
    object-fit: cover;
}

.modal-popup /* this is the popup not the items in the popup */
{
    position: fixed;
    z-index: 990;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-container /* this is the box holding the items in the popup */
{
    display: flex;
    width: 300px;
    margin: 150px auto;
    /*cant have padding or it will throw off the orientation of this modal*/
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    min-width: 57vw;
    min-height: 60vh;
}

.addUserModalScreen
{
    padding: 16px;
    box-sizing: border-box;
}

#userModalImage
{
    width: 100%;
    height: 100%;
    margin-top: 1vh;
    margin-right: 2vw;
    margin-bottom: 1vh;
    object-fit: cover;
}

#formHolder
{
    display: flex;
    gap: 20px;
}

#userModalNav 
{
    min-width: 8vw;
    min-height: 60vh; /* needs to match the containers height, not a perfect fix and will need to change later */
    height: 100%;
    background-color: rgb(76, 76, 76);
    color: white;
}

#topBar
{
    padding-left: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    padding-right: 23px;
}

#header
{
    text-align: center;
    z-index: 999; /* this needs to be above the componets inside of this modal */
    min-width: 30px;
    min-height: 30px;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    background-color: rgb(76, 76, 76);
    color: white;
}

#footer
{
    text-align: center;
    z-index: 999; /* this needs to be above the componets inside of this modal */
    min-width: 200px;
    min-height: 30px;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    margin-top: auto; /* pushes the footer to the bottom */
    background-color: rgb(76, 76, 76);
    color: white;
}

#userModalOptions
{
    border-bottom: 1px solid black;
}

/*                      */
/* end of addUser modal */
/*                      */ 

/*                      */
/* addUser profile page */
/*                      */    

#buttonDiv
{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 30vw;
    padding-right: 15px;
}

#addUserButton
{
    padding: 1px;
    text-align: center;
    outline-width: 2px;
    outline-color: black;
    outline-style: solid;
}

#formContainer 
{
    width: 100%;
    max-width: 50vw; /* needs to match the inner size of the popup */
    margin: 0 auto;
    box-sizing: border-box;
}

#pageBreakTop
{
    margin-left: 15px;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-right: 15px;
}

#pageBreakBottom
{
    overflow-x: visible;
    margin-left: 15px;
    margin-bottom: 11.5px;
    margin-right: 15px;
}

#formDiv
{
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr)); /* this is new and exciting */
    gap: 12px;
    min-height: 40vh; /* needs all this restriction to make the form usable */
    max-height: 70vh;
    min-width: 35vw;
    max-width: 30vw;
    overflow-y: auto;
    /*box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); /* just for a visual spacing constraints */
}

#form
{   
    padding-left: 1vw;
    padding-right: 1vw;
    min-height: 10vh;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

#firstNameForm, #lastNameForm, #emailForm, #phoneNumberForm, #roleForm
{
    
    padding: 5px;
    font-size: 16px;
    outline-width: 2px;
    outline-color: black;
    outline-style: solid;
}

.field 
{
    padding-left: 15px;
    padding-right: 15px;
    display: flex;
    flex-direction: column;
}

/*                             */
/* end of addUser profile page */
/*                             */ 

/*                                   */
/* start of addUser Assignments page */
/*                                   */ 

#assignmentsTopBar
{
    padding-left: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
}

#assignmentsFormDiv
{
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    min-height: 40vh;
    max-height: 60vh;
    min-width: 47vw;
}

.dropdown
{
    width: 100%;
    box-sizing: border-box;
    background: #fff !important; /* override another background (I've lost track of which one) */
    border: none !important;
    border: 1px solid #ccc;
    border-radius: 4px;
    max-height: 200px;
}

.dropdown-menu:hover
{
    filter: brightness(60%); 
}

#assignmentsPageBreakTop
{
    margin-left: 15px;
    margin-top: 20px;
    margin-bottom: 10px;
    max-width: 47vw;
}

#assignmentsPageBreakBottom
{
    overflow-x: visible;
    margin-left: 15px;
    margin-bottom: 11.5px;
    max-width: 47vw;
}

#addAssignmentsButton
{
    text-align: center;
    outline-width: 2px;
    outline-color: black;
    outline-style: solid;
    min-width: 150px;
}

#assignmentsButtonDiv
{
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    width: 100%;
    box-sizing: border-box;
}

#addAssignmentsButton 
{
    min-width: 150px;
    outline: 2px solid black;
}

#continueButton 
{
    background-color: rgb(76, 76, 76);
    color: white;
    min-width: 150px;
    outline: 2px solid black;
}

/*                                 */
/* end of addUser Assignments page */
/*                                 */ 

</style>
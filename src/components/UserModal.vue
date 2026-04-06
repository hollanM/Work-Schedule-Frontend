<script setup>
import { defineProps, defineEmits, ref, watch, shallowRef, computed, onMounted } from "vue";
import {onClickOutside} from "@vueuse/core";
import userServices from "../services/userServices"
import store from "../store/store.js"

const props = defineProps({
  isOpen: Boolean,
  userModalAction: {type: String},
  selectedComponent: { type: String, default: 'ProfileModal' },
});

const emit = defineEmits(["modal-close"]);
const target = ref(null);
const currentComponent = ref(props.selectedComponent);
const user = ref(null);
const userSession = computed(() => store.getters.getLoginUserInfo);
const department = ref(null); //got from the currentUser, needed for adding users to the correct department
const userProfilePicture = computed(() => user.value ? user.value.profile_picture : ''); //picture is not being returned yet
const hasError = false;
//profile form 
const userInformation = ref({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: null,
    role: "",
});
//assignments form
const selectedSchedules = ref([]);
const selectedPositions = ref([]);
const selectedTags = ref([]);
//hourly rates form
const employeePayRate = ref(8.75);
//log notes form
const commentData = ref("");
//advanced form
const employeeId = ref();

onMounted( async () => {
    //console.log("User Department: ", userSession.value); //google user content, but no department value (since its from google)
    getUser().then(() => { //get the users department 
        department.value = user.value.department_id

        //console.log("User Department: ", department.value);
    }); //needed .then since assignment was too fast for async
});

const getUser = async() => {
  //console.log("API CALL → fetch manager");
  const response = await userServices.get(userSession.value.userId); //get the user, for the department
  user.value = response.data;
  //console.log("Fetched user:", user.value);
};

const createUser = async() => {
    //console.log("API CALL → create user");
    const newUser = {
        department_id: department.value, //need to assign the new user to the same department as the manager creating them
        fName: userInformation.value.firstName,
        lName: userInformation.value.lastName,
        email: userInformation.value.email,
        role: userInformation.value.role,
        phone_num: userInformation.value.phoneNumber,
        oc_id: employeeId.value,
        pay_rate: employeePayRate.value,
        clocked_in: false,
        manager_notes: commentData.value,
    };
    console.log("New user data:", newUser);
    if(!newUser.fName || !newUser.lName || !newUser.email || !newUser.role || !newUser.phone_num || !newUser.oc_id || !newUser.pay_rate || !newUser.manager_notes)
    {
        console.log("Missing required fields");
        return;
    }
    else 
    {
        try{
            const response = await userServices.create(newUser);
            console.log("Created user:", response.data);
        }
        catch(error){
            console.log("Error creating user:", error);
        }
    }
};

onClickOutside(target, (event) => { //had issues with this one, needed to ignore certain clicks
  const target = event?.target;
  if (!target) return;
  //keep popups open when interacting with v-select menu dropdown
  if (target.closest('.v-menu, .v-overlay, .v-list-item, .v-select')) //ignoring these clickable items
    return;
  emit('modal-close');
});

const menuItems = [ //same as Sam's sidebar, but for the user modal
  { name: 'Profile', component: 'ProfileModal' }, //are the componet pieces needed anymore?
  { name: 'Assignments', component: 'AssignmentsModal' },
  { name: 'Hourly Rate', component: 'HourlyRatesModal' },
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

const roleItems = [
    { title: 'Employee', value: 'Employee' },
    { title: 'Manager', value: 'Manager' },
];

const scheduleItems = [
    { title: 'Schedule 1', value: '' },
    { title: 'Schedule 2', value: '' },
    { title: 'Schedule 3', value: '' },
];

const positionItems = [
    { title: 'Position 1', value: '' },
    { title: 'Position 2', value: '' },
    { title: 'Position 3', value: '' },
];

const tagItems = [
    { title: 'Tag 1', value: '' },
    { title: 'Tag 2', value: '' },
    { title: 'Tag 3', value: '' },
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
                            <div id="formContainer"> <!-- was a form, but vue3 does not do forms this way-->
                                <div id="formHolder">
                                    <div id="formDiv">
                                        <div class="field">
                                            <label>First Name</label>
                                            <input id="firstNameForm" type="text" v-model="userInformation.firstName" />
                                        </div>
                                        <div class="field">
                                            <label>Last Name</label>
                                            <input id="lastNameForm" type="text" v-model="userInformation.lastName" />
                                        </div>
                                        <div class="field">
                                            <label>Email</label>
                                            <input id="emailForm" type="email" v-model="userInformation.email" />
                                        </div>
                                        <div class="field">
                                            <label>Phone Number</label>
                                            <input id="phoneNumberForm" type="text" v-model="userInformation.phoneNumber" />
                                        </div>
                                        <div class="field">
                                            <p class="dropdown-title"> Role </p>
                                            <v-select v-model="userInformation.role" :items="roleItems" item-value="title" class="dropdown" hide-details @click.stop></v-select>
                                        </div>
                                    </div> <!-- will need to change later to the users google picture -->
                                    <img id="userModalImage" src=""/>
                                </div>
                                <hr id="pageBreakBottom"/>
                                <div id="buttonDiv">
                                    <button id="addUserButton" type="submit" v-if="userModalAction === 'edit'">Save User</button>
                                    <button id="continueButton" @click="changeModalContent('AssignmentsModal')"> Continue to Assignments </button>
                                </div>
                            </div>
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
                            <button id="addAssignmentsButton" type="submit" v-if="userModalAction === 'edit'">Save Assignments</button>
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
                        <hr id="pageBreakTop"/>
                        <div id="advancedFormContainer">
                            <p> Pay Rate </p>
                            <input v-model="employeePayRate" id="advancedInput"/>
                        </div>
                        <hr id="advancedPageBreakBottom"/>
                        <div id="hourlyRatesButtonDiv">
                            <button id="hourlyRatesAddUserButton" type="submit" v-if="userModalAction === 'edit'">Save Hourly Rates</button>
                            <button id="hourlyRatesContinueButton" @click="changeModalContent('LogNotesModal')"> Continue to Log Notes </button>
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
                        <v-textarea label="Comments" v-model="commentData"></v-textarea>

                        <div id="buttonDiv">
                            <button id="addUserButton" type="submit" v-if="userModalAction === 'edit'">Save Log Notes</button>
                            <button id="continueButton" @click="changeModalContent('AdvancedModal')"> Continue to Advanced </button>
                        </div>
                    </div>
                    <!-- advanced content -->
                    <div v-if="currentComponent == 'AdvancedModal'" id="AdvancedModal">
                        <div id="topBar">
                            <p id="title">User Advanced</p>
                            <div id="header">
                                <button @click.stop="emit('modal-close')">X</button>
                            </div>
                        </div>
                        <hr id="pageBreakTop"/>
                        <div id="advancedFormContainer">
                            <p> Employee ID </p>
                            <input v-model="employeeId" id="advancedInput"/>
                        </div>
                        <hr id="advancedPageBreakBottom"/>
                        <div id="advancedButtonDiv">
                            <button id="addUserButton" type="submit" v-if="userModalAction === 'edit'">Save Advanced Info</button>
                            <button id="continueButton" @click="createUser"> Save </button>
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
    margin-right: 10px;
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

/*                                    */
/* start of addUser hourly rates page */
/*                                    */ 

#hourlyRatesButtonDiv
{
    display: flex;
    align-items: center;
    padding-left: 28vw;
    padding-right: 15px;
    margin-bottom: auto !important;
}

#hourlyRatesContinueButton 
{
    background-color: rgb(76, 76, 76);
    color: white;
    min-width: 150px;
    outline: 2px solid black;
    min-width: 5vw;
}

#hourlyRatesAddUserButton
{
    padding: 1px;
    text-align: center;
    outline-width: 2px;
    outline-color: black;
    outline-style: solid;
    margin-right: 10px;
}

/*                                  */
/* end of addUser hourly rates page */
/*                                  */ 

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

/*                                */
/* start of addUser Advanced page */
/*                                */ 

#advancedModal
{
    display: flex;
    width: 100%;
}

#advancedPageBreakBottom
{
    margin-left: 15px;
    margin-bottom: 11.5px;
    margin-right: 15px;
    margin-top: min(40vh, 33vh); /* dont know what the first number does but the second is min margin */
    min-width: 46vw;
}

#advancedButtonDiv
{
    display: flex;
    align-items: center;
    padding-left: 28vw;
    padding-right: 15px;
    margin-bottom: auto !important;
}

#advancedFormContainer
{
    margin-left: 15px !important;  /* something was keeping this from working */
    height: 100%;
    max-width: 50vw;
}

#advancedInput
{
    outline: 1px solid black;
}

#advancedInput:focus
{
    outline: 2px solid black;
}

/*                              */
/* end of addUser Advanced page */
/*                              */ 
</style>
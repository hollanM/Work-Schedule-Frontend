<script setup>
import { defineProps, defineEmits, ref } from "vue";

const form = ref({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "",
});

const submit = () =>
{
  
};
</script>

<template>
    <t2 id="spacer">ad</t2>
    <div>
        <t2 id="title">Add User</t2>
        <hr id="pageBreakTop"/>
        <form @submit.prevent="submit" id="formContainer">
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
            </div>
            <hr id="pageBreakBottom"/>
            <div id="buttonDiv">
                <button id="addUserButton" type="submit">Add User</button>
            </div>
        </form>
    </div>
</template>

<style scoped>
#buttonDiv
{
    padding-left: 30vw;
}

#addUserButton
{
    padding: 1px;
    text-align: center;
    outline-width: 2px;
    outline-color: black;
    outline-style: solid;
}

#spacer
{
    opacity: 0;
}

#title
{
    padding-top: 4vh;
    padding: 1vw;
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
}

#pageBreakBottom
{
    overflow-x: visible;
    margin-left: 15px;
    margin-bottom: 11.5px;
    min-width: 47vw; /* also reflected on the top one for some reason */
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
</style>
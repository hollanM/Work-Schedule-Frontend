<script setup>
import { defineProps, defineEmits, ref, watch, shallowRef, computed } from "vue";
import {onClickOutside} from "@vueuse/core";
import ProfileModal from "./UserProfileModal.vue";
import AssignmentsModal from "./UserAssignmentsModal.vue";
import HourlyRatesModal from "./UserHourlyRatesModal.vue";
import LogNotesModal from "./UserLogNotesModal.vue";
import AdvancedModal from "./UserAdvancedModal.vue";

const componentMap = {
  ProfileModal,
  AssignmentsModal,
  HourlyRatesModal,
  LogNotesModal,
  AdvancedModal,
};

const props = defineProps({
  isOpen: Boolean,
  selectedComponent: { type: String, default: 'ProfileModal' },
});

watch(() => props.selectedComponent, (value) => { activeKey.value = value; });

const user = ref(null); //might not be needed, or will be needed later
const emit = defineEmits(["modal-close"]);

const target = ref(null)
onClickOutside(target, () => { //handles the closing of the user modal
  //console.log("onClickOutside triggered - closing modal");  //if you cant close the modal use this to check if its firing
  emit('modal-close');
});

const menuItems = [ //same as Sam's sidebar, but for the user modal
  { name: 'Profile', icon: '', component: 'ProfileModal' },
  { name: 'Assignments', icon: '', component: 'AssignmentsModal' },
  { name: 'Hourly Rates', icon: '', component: 'HourlyRatesModal' },
  { name: 'Log Notes', icon: '', component: 'LogNotesModal' },
  { name: 'Advanced', icon: '', component: 'AdvancedModal' },
]

//const currentComponent = ref(props.selectedComponent);
const currentComponent = shallowRef(componentMap[props.selectedComponent]); //compiler wanted this to be a shallwRef, not that I know what a shallowRef is but is stopped some warnings
watch(() => props.selectedComponent, (value) => {
  currentComponent.value = componentMap[value];
});

const changeModalContent = (item) => {
  currentComponent.value = componentMap[item.component];
};

const continueTo = () =>
{
    if(currentComponent.value === componentMap['ProfileModal'])
    {
        currentComponent.value = componentMap['AssignmentsModal'];
    }
    else if(currentComponent.value === componentMap['AssignmentsModal'])
    {
        currentComponent.value = componentMap['HourlyRatesModal'];
    }
    else if(currentComponent.value === componentMap['HourlyRatesModal'])
    {
        currentComponent.value = componentMap['LogNotesModal'];
    }
    else if(currentComponent.value === componentMap['LogNotesModal'])
    {
        currentComponent.value = componentMap['AdvancedModal'];
    }
};
</script>

<template>
    <div v-if="isOpen" class="modal-popup">
        <div class="modal-wrapper">
            <div class="modal-container" ref="target">
                <slot name="sidebar"><!-- these names match the componet template names in the menu bar-->
                    <v-list nav id="userModalNav">
                        <v-list-item v-for="item in menuItems" :key="item.name" @click="changeModalContent(item)">
                            <template #prepend>
                                <v-icon :icon="item.icon" />
                            </template>
                            <v-list-item-title id="userModalOptions">
                                {{ item.name }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </slot>
                <div id="userModalComponetScreen"> 
                    <slot name="content">
                        <component :is="currentComponent" />
                    </slot>
                </div>
                <div id="header">
                    <button @click.stop="emit('modal-close')">X</button>
                </div>
                <div id="footer" v-if="currentComponent.value === componentMap[ProfileModal]"> 
                    <button id="continueButton" @click="continueTo"> Continue to Assignments </button>
                </div>
                <div id="footer" v-if="currentComponent.value === componentMap[AssignmentsModal]"> 
                    <button id="continueButton" @click="continueTo"> Continue to Hourly Rates </button>
                </div>
                <div id="footer" v-if="currentComponent.value === componentMap[HourlyRatesModal]"> 
                    <button id="continueButton" @click="continueTo"> Continue to Log Notes </button>
                </div>
                <div id="footer" v-if="currentComponent.value === componentMap[LogNotesModal]"> 
                    <button id="continueButton" @click="continueTo"> Continue to Advanced </button>
                </div>
                <div id="footer" v-if="currentComponent.value === componentMap[AdvancedModal]"> 
                    <button id="continueButton" @click="continueTo"> Save and Exit </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
    min-width: 60vw;
    min-height: 60vh;
}

.userModalComponetScreen
{
    border-radius: 8px;
    outline-width: 2px;
    outline-color: black;
    outline-style: solid;
}

#userModalNav 
{
    min-height: 60vh; /* needs to match the containers height, not a perfect fix and will need to change later */
    height: 100%;
    background-color: rgb(76, 76, 76);
    color: white;
}

#header
{
    text-align: center;
    position: absolute; /* removes this object from the normal flex-grid */
    top: 24.5vh; /* only way to control location now */
    right: 21.2vw;
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
    position: absolute;
    bottom: 20.1vh;
    right: 21.2vw;
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

</style>
<script setup>
import { ref, onMounted, reactive } from "vue";
import AuthServices from "../services/authServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const fName = ref("");
const lName = ref("");
const user = ref({});
const emit = defineEmits(["close"]);
const props = defineProps({
  employeeName: { type: [Number, String], required: true },
  date: { type: String, required: true }
});

const form = reactive({
  name: '',
  status: 'not started'
});


</script>

<template>
    <div fluid class="modal">
  <div class = "modal-content">
    <div>
        <div class="flex-row">
            <h3 class="modal-text">Create Shift for {{ props.employeeName }} on {{ props.date }}</h3>
            <v-btn class = "close-button" @click="$emit('close')">
                <v-icon
                    color="grey"
                >mdi-close</v-icon>
            </v-btn>
        </div>
        
    <div class="dividing-line"> </div>
    </div>
    <div>
       
        <div class="dividing-line"> </div>
         <v-btn class="create-button" icon = "mdi-plus-circle-outline">
            
            Create Custom Shift
            <v-icon class="ml-3">mdi-plus-circle-outline</v-icon>
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
  z-index: 4000;
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


</style>

<script setup>
import { ref, onMounted } from "vue";
import AuthServices from "../services/authServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const fName = ref("");
const lName = ref("");
const user = ref({});


</script>

<template>
 <div id = "shcedule_modal" fluid class = "modal">
  <div class = "modal-content">
    <div class="dividing-line"></div>
    <div class="dividing-line"> </div>
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
  z-index: 1;
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
  height: 50%;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

}

.dividing-line{
  border-bottom: 5px solid #cfcfcf;
  margin: 30px 0;
  margin-left: 20px;
  margin-right: 20px;
}

</style>

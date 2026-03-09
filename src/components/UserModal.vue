<script setup>
import { defineProps, defineEmits, ref } from "vue";
import {onClickOutside} from "@vueuse/core";

const props = defineProps({
  isOpen: Boolean,
  drawer: { type: Boolean, default: true }
});

const user = ref(null); //might not be needed
const emit = defineEmits(["update:drawer", "modal-close"]);

const target = ref(null)
onClickOutside(target, ()=>emit('modal-close')) //handles the closing of the user modal

const menuItems = [ //same as Sam's sidebar, but for the user modal
  { name: 'Profile', icon: '', click: '' },
  { name: 'Assignments', icon: '', click: '' },
  { name: 'Hourly Rates', icon: '', click: '' },
  { name: 'Log Notes', icon: '', click: '' },
  { name: 'Advanced', icon: '', click: '' },
]

</script>

<template>
    <div v-if="isOpen" class="modal-mask">
        <div class="modal-wrapper">
            <v-navigation-drawer :model-value="drawer" @update:model-value="$emit('update:drawer', $event)" app> <!--same as Sam's sidebar-->
                <v-list nav>
                    <v-list-item v-for="item in menuItems" :key="item.name" :to="item.to || undefined" @click="item.name === 'View Options'">
                        <template #prepend>
                            <v-icon :icon="item.icon" />
                        </template>
                        <v-list-item-title>
                            {{ item.name }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <div class="modal-container" ref="target">
                <div class="modal-header">
                    <slot name="header"> default header </slot>
                </div>
                <div class="modal-body">
                    <slot name="content"> default content </slot>
                </div>
                <div class="modal-footer">
                    <slot name="footer">
                        <div>
                            <button @click.stop="emit('modal-close')">Submit</button>
                        </div>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-container {
  width: 300px;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

</style>
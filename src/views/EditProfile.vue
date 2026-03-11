<script setup>
import { ref, onMounted } from "vue";
import EmployeeServices from "../services/employeeServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
const router = useRouter();
const valid = ref(false);
const message = ref("My Profile");
const user = Utils.getStore("user");


const props = defineProps({
  id: {
    required: true,
  },
});

const employee = ref({
  name: "",
  email: "",
  phone_num: "",
});


const firstName = ref("");
const lastName = ref("");
//need to switch to database stuff
const dndStart = ref("");
const dndEnd = ref("");
const timezone = ref("");

const alertPrefs = ref({
  timeOffEmail: true,
  timeOffMobile: true,
  swapEmail: true,
  swapMobile: true,
  openShiftEmail: true,
  openShiftMobile: true,
});

const alertSections = ref([
  { label: "Time-Off Requests", email: true, mobile: true },
  { label: "Swap / Drop Requests", email: true, mobile: true },
  { label: "Open Shift Requests", email: true, mobile: true },
  { label: "Schedule Updates", email: true, mobile: true },
  { label: "New User Registrations", email: true, mobile: true },
  { label: "Availability Change", email: true, mobile: true },
  { label: "Clock In/Out Reminders", email: true, mobile: true },
  { label: "Overtime Alerts", email: true, mobile: true },
  { label: "Payroll Reminders", email: true, mobile: true },
  { label: "Reports", email: true, mobile: true },
  { label: "Workplace Alerts", email: true, mobile: true },
  {label: "Shift Reminders", email: true, mobile: true, type: "shiftReminder", time: "2 hours before shift start"
  }
]);

const retrieveEmployee = async () => {
  try {
    const response = await EmployeeServices.get(props.id);
    employee.value = response.data;

    const parts = employee.value.name?.split(" ") || [];
    firstName.value = parts[0] || "";
    lastName.value = parts.slice(1).join(" ") || ""; // lastName.value = parts[1] || "";
  } catch (e) {
    message.value = "Error loading profile";
  }
};

const updateEmployee = async () => {
  const data = {
    name: `${firstName.value} ${lastName.value}`,
    email: employee.value.email,
    phone_num: employee.value.phone_num,
    // dnd_start
    // dnd_end
    // timezone 
    // alertPrefs 
  };

  try {
    await EmployeeServices.update(props.id, data);
    message.value = "Profile updated successfully";
  } catch (e) {
    message.value = "Error updating profile";
  }
};

onMounted(() => {
  retrieveEmployee();
});
</script>

<template>
  <v-container class="py-10" style="max-width: 900px">

    <v-card class="pa-8 mb-10">
      <v-row class="align-center justify-space-between mb-8">
        <h2 class="text-h5"><b>My Profile</b></h2>

        <div class="d-flex gap-3">
          <v-btn color="primary" variant="outlined">
            Change Password
          </v-btn>

          <v-btn color="primary" @click="updateEmployee">
            Save
          </v-btn>
        </div>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="firstName"
                label="First Name"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="lastName"
                label="Last Name"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="employee.email"
                label="Email Address *"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="employee.phone_num"
                label="Mobile Number"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="dndStart"
                    label="Do Not Disturb (from)"
                    type="time"
                  />
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model="dndEnd"
                    label="Do Not Disturb (to)"
                    type="time"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="timezone"
                label="Timezone"
                :items="['CT', 'ET', 'PT', 'MT']"
              />
            </v-col>

          </v-row>
        </v-col>

        <v-col cols="12" md="4" class="d-flex flex-column align-center">
          <v-avatar size="140" class="mb-4" color="grey-lighten-2">
            <v-icon size="70">mdi-account</v-icon>
          </v-avatar>
        </v-col>

      </v-row>
    </v-card>

    
    <v-card class="pa-8">
        <v-row class="align-center justify-space-between mb-8">
          <h2 class="text-h5"><b>Alert Preferences</b></h2>
          <v-btn color="primary">Save</v-btn>
        </v-row>
        <template v-for="(section, index) in alertSections" :key="index">
          <v-row class="mb-4 align-center">
            <v-col cols="12" md="4">
              <strong>{{ section.label }}</strong>
            </v-col>

            <v-col cols="12" md="8" class="d-flex justify-end gap-8" style="gap: 32px;">
              <v-select
                v-if="section.type === 'shiftReminder'"
                v-model="section.time"
                :items="[
                  '5 minutes before shift start',
                  '10 minutes before shift start',
                  '15 minutes before shift start',
                  '30 minutes before shift start',
                  '1 hour before shift start',
                  '2 hours before shift start'
                ]"
                hide-details
                style="max-width: 250px;"
              />
              <v-checkbox v-model="section.email" label="Email" hide-details />
              <v-checkbox v-model="section.mobile" label="Mobile" hide-details />

      
            </v-col>
          </v-row>
      </template>
    </v-card>

  </v-container>
</template>
<script setup>
import { ref, onMounted } from "vue";
import NotificationServices from "../services/notificationServices";
import NotificationListServices from "../services/notificationListServices";
import UserService from "../services/userServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(false);
const message = ref("My Profile");
const user = ref(null);
const sessionUser = Utils.getStore("user");
const role = ref("");

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const phone_num = ref("");

const notificationListId = ref(null);
const notificationRows = ref([]);


//need to switch to database stuff?
const dndStart = ref("");
const dndEnd = ref("");
const timezone = ref("");


const alertSections = ref([
  { key: "timeOffRequests", label: "Time-Off Requests", email: true, mobile: true },
  { key: "swapDropRequests", label: "Swap / Drop Requests", email: true, mobile: true },
  { key: "openShiftRequests", label: "Open Shift Requests", email: true, mobile: true },
  { key: "scheduleUpdates", label: "Schedule Updates", email: true, mobile: true },
  { key: "newUserRegistrations", label: "New User Registrations", email: true, mobile: true },
  { key: "availabilityChange", label: "Availability Change", email: true, mobile: true },
  { key: "clockInOutReminders", label: "Clock In/Out Reminders", email: true, mobile: true },
  { key: "overtimeAlerts", label: "Overtime Alerts", email: true, mobile: true },
  { key: "payrollReminders", label: "Payroll Reminders", email: true, mobile: true },
  { key: "reports", label: "Reports", email: true, mobile: true },
  { key: "workplaceAlerts", label: "Workplace Alerts", email: true, mobile: true },
  { key: "shiftReminder", label: "Shift Reminders", email: true, mobile: true, time: "2 hours before shift start"}
]);


const loadUser = async () => {
  if (!sessionUser) {
    console.log("Session user missing or not loaded:", sessionUser);
    message.value = "User not found in session.";
    return;
  }

  const res = await UserService.get(sessionUser.userId);
  user.value = res.data;

  firstName.value = user.value.fName;
  lastName.value = user.value.lName;
  email.value = user.value.email;
  phone_num.value = user.value.phone_num;
  role.value = user.value.role;
};


const updateUserProfile = async () => {
  try {
    await UserService.update(user.value.id, {
      fName: firstName.value,
      lName: lastName.value,
      phone_num: phone_num.value,
      role: role.value
    });
    
      role.value === "Employee" ? router.push({ name: "employee-dashboard" }) : router.push({ name: "schedules" });

    message.value = "Profile updated successfully";
  } catch (err) {
    message.value = "Error updating profile";
  }
};


const saveAll = async () => {
  await updateNotificationPreferences();
  await loadUser();
};



const loadNotificationList = async () => {
  const listRes = await NotificationListServices.getAllForUser(user.value.id);
  let list = listRes.data[0];

  if (!list) {
    // Create the notification_list container for this user
    const createRes = await NotificationListServices.create({
      user_id: user.value.id,
      department_id: user.value.department_id
    });

    list = createRes.data;
  }
  notificationListId.value = list.id;
};



  const loadNotificationRows = async () => 
  {
    const notifRes = await NotificationServices.getAllForList(notificationListId.value);
    notificationRows.value = notifRes.data;

    alertSections.value.forEach(section => {
      const row = notificationRows.value.find(n => n.type === section.key);
      if (row) {
        section.email = row.email_pref;
        section.mobile = row.mobile_pref;
        section.notificationId = row.id;

        if (section.key === "shiftReminder") {
          section.time = row.time;
        }
      }
    });
};


const updateNotificationPreferences = async () => {
  try {
    for (const section of alertSections.value) {
      await NotificationServices.update(section.notificationId, {
        email_pref: section.email,
        mobile_pref: section.mobile,
        time: section.key === "shiftReminder" ? section.time : null
      });
    }
    message.value = "Notification settings updated successfully";

  } catch (err) {
    message.value = "Error saving notification settings";
  }
};

onMounted(async () => {
  await loadUser();
  await loadNotificationList();
  await loadNotificationRows();
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

          <v-btn color="primary" @click="updateUserProfile">
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
                v-model="email"
                label="Email Address"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="phone_num"
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

            <v-col cols="12" md="6">
              <v-select
                v-model="role"
                label="Role"
                :items="['Manager', 'Employee']"
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
          <v-btn color="primary" @click ="saveAll">Save</v-btn>
        </v-row>
        <template v-for="(section, index) in alertSections" :key="index">
          <v-row class="mb-4 align-center">
            <v-col cols="12" md="4">
              <strong>{{ section.label }}</strong>
            </v-col>

            <v-col cols="12" md="8" class="d-flex justify-end gap-8" style="gap: 32px;">
              <v-select
                v-if="section.key === 'shiftReminder'"
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
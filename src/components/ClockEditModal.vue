<script setup>
import { ref, onMounted, computed } from "vue";
import clock_in_outServices from "../services/clock_in_outServices";
import { format } from "date-fns";

const props = defineProps({
  period: { type: Object, required: true },
  employeeName: { type: String, required: true }
});

const emit = defineEmits(["close", "save"]);

const startTime = ref("");
const endTime = ref("");
const startDate = ref("");
const endDate = ref("");

onMounted(() => {
  if (props.period) {
    startDate.value = format(props.period.startDate, "yyyy-MM-dd");
    startTime.value = format(props.period.startDate, "HH:mm");
    
    if (props.period.endDate && !props.period.isClockedIn) {
      endDate.value = format(props.period.endDate, "yyyy-MM-dd");
      endTime.value = format(props.period.endDate, "HH:mm");
    } else {
      endDate.value = startDate.value;
      endTime.value = "";
    }
  }
});

async function handleSave() {
  try {
    // Update Clock In event
    await clock_in_outServices.update(props.period.startEventId, {
      day: startDate.value,
      time: startTime.value + ":00"
    });

    // Update Clock Out event if it exists
    if (props.period.endEventId) {
      await clock_in_outServices.update(props.period.endEventId, {
        day: endDate.value,
        time: endTime.value + ":00"
      });
    }

    emit("save");
    emit("close");
  } catch (error) {
    console.error("Error updating clock events:", error);
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Clock Times for {{ employeeName }}</h3>
        <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
      </div>
      
      <v-divider class="mb-4"></v-divider>
      
      <div class="modal-body">
        <div class="time-section">
          <h4>Clock In</h4>
          <div class="d-flex ga-2">
            <v-text-field
              v-model="startDate"
              label="Date"
              type="date"
              density="compact"
            ></v-text-field>
            <v-text-field
              v-model="startTime"
              label="Time"
              type="time"
              density="compact"
            ></v-text-field>
          </div>
        </div>

        <div class="time-section mt-4">
          <h4>Clock Out</h4>
          <div class="d-flex ga-2">
            <v-text-field
              v-model="endDate"
              label="Date"
              type="date"
              density="compact"
              :disabled="period.isClockedIn"
            ></v-text-field>
            <v-text-field
              v-model="endTime"
              label="Time"
              type="time"
              density="compact"
              :disabled="period.isClockedIn"
            ></v-text-field>
          </div>
          <v-alert v-if="period.isClockedIn" type="info" density="compact" class="mt-2">
            User is currently clocked in.
          </v-alert>
        </div>
      </div>

      <v-divider class="mt-4"></v-divider>
      
      <div class="modal-actions d-flex justify-end ga-2 mt-4">
        <v-btn variant="text" @click="$emit('close')">Cancel</v-btn>
        <v-btn color="primary" @click="handleSave">Save Changes</v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.time-section h4 {
  margin-bottom: 12px;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>

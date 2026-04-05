<script setup>
</script>

<template>
  <v-container fluid class="employee-dashboard-bg fill-height pa-0">
    <div class="bg-image"></div>
    <!-- Centered Dashboard Area -->
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-6 rounded-xl" elevation="6">
          <!-- Dashboard Title -->
          <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold">Employee Dashboard</h2>
            <p class="text-medium-emphasis">
              Manage your schedules and jobs
            </p>
          </div>

          <!-- Placeholder for Employee Dashboard Content -->
          <div class="text-center mt-4 text-caption">
            Employee dashboard content goes here.
          </div>
        </v-card>
        </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.employee-dashboard-bg {
  position: relative;
  overflow: hidden;
}   
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/employee-dashboard-bg.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.3; /* Adjust opacity as needed */
}   
</style>
<script setup>
import SocialLogin from "../components/SocialLogin.vue";
import { ref } from "vue";
const employeeLogin = ref(false);
</script>

<template>
  <v-container fluid class="login-bg fill-height pa-0">
      <div class="bg-image"></div>
    <!-- Centered Login Area -->
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">

        <v-card class="pa-6 rounded-xl" elevation="6">

          <!-- App Title -->
          <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold">Welcome!</h2>
            <p class="text-medium-emphasis">
              Sign in to manage schedules and jobs
            </p>
          </div>

          <!-- Email -->
          <v-text-field
            label="Email"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            class="mb-3"
          />

          <!-- Password -->
          <v-text-field
            label="Password"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock-outline"
          />

          <!-- Forgot Password -->
          <div class="text-right mb-4">
            <a href="#" class="text-caption text-primary">
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <v-btn
            color="primary"
            size="large"
            block
            class="mb-4"
          >
            Sign In
          </v-btn>

          <!-- Divider -->
          <v-divider class="my-4" />

          <!-- Social Login (kept as requested) -->
          <div class="text-center mb-4 text-caption">
            Or continue with
          </div>

          <SocialLogin 
            :employeeLogin="employeeLogin"
          />

          <!-- Register Link -->
          <div class="text-center mt-6 text-caption">
            Don’t have an account?
            <a href="#" class="text-primary font-weight-medium">
              Create one
            </a>
          </div>

             <v-checkbox-btn
            v-model="employeeLogin">
                <template #label>
                    <span>Log in as Employee</span>
                </template>
            </v-checkbox-btn>

        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-bg {
  position: relative;
  overflow: hidden;

  background: linear-gradient(
    120deg,
    #7a0c0c,
    #9f2a2a,
    #9d7676,
    #924c4c,
    #7a0c0c,
    #7a0c0c
  );
  background-size: 400% 400%;
  animation: gradientMove 14s ease infinite;
}

/* IMAGE LAYER */
.bg-image {
  position: absolute;
  inset: 0;

  background: url('/_OC-Logo-SmallMark1-White-onlyOC.png') right/contain no-repeat;

  opacity: 0.75;        
  z-index: 0;
}

/* optional tint overlay */
.login-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1;
}


/* content stays above everything */
.login-bg > *:not(.bg-image) {
  position: relative;
  z-index: 2;
}

@keyframes gradientMove {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


/* .login-bg {
  background: linear-gradient(
    135deg,
    #eef2ff 0%,
    #f8fafc 40%,
    #ffffff 100%
  );
}

.login-bg {
  position: relative;
  background: url('/login-bg.jpg') center/cover no-repeat;
}

.login-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(20, 30, 50, 0.45);
}


.login-bg > * {
  position: relative;
  z-index: 1;
} */

</style>

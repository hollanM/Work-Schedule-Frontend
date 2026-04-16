import { createRouter, createWebHistory } from "vue-router";
import store from "./store/store.js";

import Login from "./views/Login.vue";
import TutorialsList from "./views/TutorialsList.vue";
import EditTutorial from "./views/EditTutorial.vue";
import AddTutorial from "./views/AddTutorial.vue";
import ViewTutorial from "./views/ViewTutorial.vue";
import AddLesson from "./views/AddLesson.vue";
import EditLesson from "./views/EditLesson.vue";
import Schedules from "./views/Schedules.vue";
import EditProfile from "./views/EditProfile.vue";
import EmployeeDashboard from "./views/EmployeeDashboard.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      alias: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/tutorials",
      name: "tutorials",
      component: TutorialsList,
    },
    {
      path: "/edit/:id",
      name: "edit",
      component: EditTutorial,
      props: true,
    },
    {
      path: "/add",
      name: "add",
      component: AddTutorial,
    },
    {
      path: "/view/:id",
      name: "view",
      component: ViewTutorial,
      props: true,
    },
    {
      path: "/addLesson/:tutorialId",
      name: "addLesson",
      component: AddLesson,
      props: true,
    },
    {
      path: "/editLesson/:tutorialId/:lessonId",
      name: "editLesson",
      component: EditLesson,
      props: true,
    },
    {
      path: "/schedules",
      name: "schedules",
      component: Schedules,
    },
    {
      path: "/editProfile/:id",
      name: "editProfile",
      component: EditProfile,
      props: true,
    },
    {
      path: "/employee-dashboard",
      name: "employee-dashboard",
      component: EmployeeDashboard,
    },
    
  ],
});

// Checks if user is logged in before letting the user access any other page
router.beforeEach((to, from, next) => {
  const loginUser = store.getters.getLoginUserInfo;

  if (to.name === "login") {
    if (loginUser) {
      next({ name: "schedules" });
    } else {
      next();
    }
  } else {
    if (loginUser) {
      next();
    } else {
      next({ name: "login" });
    }
  }
});

export default router;

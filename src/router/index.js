import { createRouter, createWebHistory } from "vue-router"
import { getCurrentUser } from "vuefire"
import { useCurrentUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "LoginPage",
      component: () => import("../views/Login.vue")
    },
    {
      path: "/register",
      name: "RegisterPage",
      component: () => import("../views/Register.vue")
    },
    {
      path: "/home",
      name: "HomePage",
      component: () => import("../views/HomePage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/notifications",
      name: "Notifications",
      component: () => import("../views/NotificationsPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import("../views/SettingsPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/request-collection/:uid?",
      name: "RequestCollection",
      component: () => import("../views/RequestCollection.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/success/:key?",
      name: "Success",
      component: () => import("../views/SuccessPage.vue"),
      //meta: { requiresAuth: true },
    },
    {
      path: "/collection-mode",
      name: "Collection",
      component: () => import("../views/CollectionMode.vue"),
      meta: { requiresAuth: true },
    },
  ]
})

router.beforeEach(async (to, from, next) => {
  const currentUserStore = useCurrentUserStore()
  const currentUser = await getCurrentUser()
  currentUserStore.setIsAuthenticated(currentUser)

  if (to.meta.requiresAuth) {
    // if the user is not logged in, redirect to the login page
    if (!currentUser) {
      next({path: "/"})
      return
    }

    next()
  } else if (["RegisterPage", "LoginPage"].includes(to.name) && currentUser) {
    // if the user is logged in and is trying to access login routes
    next({ name: "HomePage" });
  } else {
    next();
  }
})

export default router

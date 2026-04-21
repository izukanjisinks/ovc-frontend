<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, GraduationCap } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleSubmit() {
  const success = await authStore.login({ email: email.value, password: password.value })
  if (success) {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="min-h-screen w-full lg:grid lg:grid-cols-2">

    <!-- Left Side — Login Form -->
    <div class="flex items-center justify-center px-6 py-12 lg:px-8">
      <div class="w-full max-w-md">

        <div class="rounded-2xl border border-border/40 bg-card/70 p-8 shadow-2xl shadow-primary/5 backdrop-blur-xl">

          <!-- Logo & Title -->
          <div class="flex flex-col items-center gap-4 text-center mb-8">
            <div class="flex items-center justify-center size-14 rounded-full bg-primary/10">
              <GraduationCap class="size-8 text-primary" />
            </div>
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-foreground">
                OVC Management System
              </h1>
              <p class="mt-1 text-sm font-medium text-muted-foreground">
                Helen Kaunda Secondary School
              </p>
              <p class="mt-3 text-muted-foreground text-sm">
                Sign in to access the system
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="authStore.error"
            class="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <p class="text-sm text-destructive text-center">{{ authStore.error }}</p>
          </div>

          <!-- Form -->
          <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">

            <div class="flex flex-col gap-2">
              <Label for="email" class="text-foreground/80">Email Address</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="staff@helenkaunda.edu.zm"
                required
                autocomplete="email"
                class="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-2">
              <Label for="password" class="text-foreground/80">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                  class="h-11 pr-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                  <span class="sr-only">{{ showPassword ? 'Hide password' : 'Show password' }}</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              :disabled="authStore.loading"
              class="h-11 w-full text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <span v-if="authStore.loading" class="flex items-center gap-2">
                <Loader2 class="h-4 w-4 animate-spin" />
                Signing in...
              </span>
              <span v-else>Sign In</span>
            </Button>
          </form>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            Need assistance? Contact your system administrator.
          </p>
        </div>

        <p class="mt-8 text-center text-xs text-muted-foreground">
          OVC-MIS &copy; {{ new Date().getFullYear() }} · Helen Kaunda Secondary School
        </p>
      </div>
    </div>

    <!-- Right Side — Brand Panel -->
    <div class="relative hidden lg:flex flex-col items-center justify-center bg-primary px-12">
      <div class="max-w-md text-center">
        <div class="flex items-center justify-center size-20 rounded-full bg-white/10 mx-auto mb-8">
          <GraduationCap class="size-10 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">
          Orphan & Vulnerable Children
        </h2>
        <p class="text-white/80 text-lg leading-relaxed mb-8">
          Management Information System
        </p>
        <p class="text-white/60 text-sm leading-relaxed">
          A secure digital system for registering, tracking, and reporting on children
          receiving OVC grant support — improving data integrity, transparency, and
          accountability at Helen Kaunda Secondary School.
        </p>
      </div>
    </div>

  </div>
</template>

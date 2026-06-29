// app/(auth)/register.tsx
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Gender, Role } from "@/types/auth";
import { router } from "expo-router";
import {
  ArrowLeft,
  Car,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorModal } from "@/components/ErrorModal";

// ─── types ───────────────────────────────────────────────────────────────────

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  password: string;
  confirmPassword: string;
  role: Role;
  gender: Gender;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

const TOTAL_STEPS = 3;

// ─── step labels (used by the progress bar) ──────────────────────────────────

const STEP_LABELS = ["Role", "Profile", "Account"];

// ─── component ───────────────────────────────────────────────────────────────

export default function Register() {
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "passenger",
    gender: "male",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ── field updater ──────────────────────────────────────────────────────────

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    // clear the error for that field on change
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // ── per-step validation ────────────────────────────────────────────────────

  function validateStep(s: number): boolean {
    const next: FormErrors = {};

    if (s === 2) {
      if (!form.fullName.trim()) next.fullName = "Full name is required";
      if (!form.phone.trim()) next.phone = "Phone number is required";
      else if (!/^\+?[\d\s\-]{10,}$/.test(form.phone))
        next.phone = "Enter a valid phone number";
      // if (!form.address.trim()) next.address = "Address is required";
    }

    if (s === 3) {
      if (!form.email.trim()) next.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        next.email = "Enter a valid email";
      if (!form.password) next.password = "Password is required";
      else if (form.password.length < 6)
        next.password = "Password must be at least 6 characters";
      if (!form.confirmPassword)
        next.confirmPassword = "Please confirm your password";
      else if (form.password !== form.confirmPassword)
        next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── navigation ─────────────────────────────────────────────────────────────

  function handleBack() {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  }

  function handleNext() {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleRegister();
    }
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  async function handleRegister() {
    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        gender: form.gender as Gender,
        address: form.address?.trim() || "",
        avatarUrl: "",
      });
      // _layout.tsx auth guard handles redirect
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Something went wrong. Try again.";
      setErrorMessage(message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "android" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── top bar: back + progress ── */}
          <View className="px-6 pt-4 pb-2 flex-row items-center gap-4">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 items-center justify-center rounded-sm bg-surface border border-border"
            >
              <ArrowLeft size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* step dots */}
            <View className="flex-1 flex-row items-center gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                const idx = i + 1;
                const active = idx === step;
                const done = idx < step;
                return (
                  <View
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-pill flex-1",
                      done
                        ? "bg-dark"
                        : active
                        ? "bg-accent-dark"
                        : "bg-border"
                    )}
                  />
                );
              })}
            </View>

            <Text variant="body-sm" color="secondary">
              {step}/{TOTAL_STEPS}
            </Text>
          </View>

          {/* ── step title ── */}
          <View className="px-6 pt-6 pb-8">
            <Text
              variant="heading-md"
              weight="bold"
              color="primary"
              className="mb-2"
            >
              {step === 1 && "Who are you?"}
              {step === 2 && "Your profile"}
              {step === 3 && "Secure your account"}
            </Text>
            <Text variant="body-md" color="secondary">
              {step === 1 && "Choose how you'll use TraceRider"}
              {step === 2 && "Tell us a bit about yourself"}
              {step === 3 && "Set up your login credentials"}
            </Text>
          </View>

          {/* ══════════════════════════════════════════════════
              STEP 1 — Role selection
          ══════════════════════════════════════════════════ */}
          {step === 1 && (
            <View className="px-6 gap-4">
              {(
                [
                  {
                    value: "passenger",
                    label: "Passenger",
                    sub: "Book rides around the city",
                    Icon: Users,
                  },
                  {
                    value: "driver",
                    label: "Driver",
                    sub: "Earn by accepting ride requests",
                    Icon: Car,
                  },
                ] as {
                  value: Role;
                  label: string;
                  sub: string;
                  Icon: any;
                }[]
              ).map(({ value, label, sub, Icon }) => {
                const selected = form.role === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => update("role", value)}
                    className={cn(
                      "flex-row items-center gap-4 p-5 rounded-card border",
                      selected
                        ? "bg-dark border-dark"
                        : "bg-surface border-border"
                    )}
                    activeOpacity={0.8}
                  >
                    {/* icon circle */}
                    <View
                      className={cn(
                        "w-12 h-12 rounded-full items-center justify-center",
                        selected ? "bg-white/10" : "bg-bg"
                      )}
                    >
                      <Icon
                        size={22}
                        color={selected ? "#FFFFFF" : Colors.textPrimary}
                      />
                    </View>

                    <View className="flex-1">
                      <Text
                        variant="body-md"
                        weight="semibold"
                        color={selected ? "primary" : "primary"}
                        style={selected ? { color: "#FFFFFF" } : undefined}
                      >
                        {label}
                      </Text>
                      <Text
                        variant="body-sm"
                        color="secondary"
                        style={selected ? { color: "rgba(255,255,255,0.6)" } : undefined}
                      >
                        {sub}
                      </Text>
                    </View>

                    {/* selection ring */}
                    <View
                      className={cn(
                        "w-5 h-5 rounded-full border-2 items-center justify-center",
                        selected ? "border-white" : "border-border"
                      )}
                    >
                      {selected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 2 — Full Name, Address, Gender, Phone
          ══════════════════════════════════════════════════ */}
          {step === 2 && (
            <View className="px-6 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.fullName}
                onChangeText={(v) => update("fullName", v)}
                error={errors.fullName}
                leftIcon={<User size={18} color={Colors.textSecondary} />}
              />

              <Input
                label="Address"
                placeholder="123 Main St, City"
                value={form.address}
                onChangeText={(v) => update("address", v)}
                error={errors.address}
                leftIcon={<MapPin size={18} color={Colors.textSecondary} />}
              />

              {/* Gender toggle */}
             <View>
                <View className="flex-row p-0.5">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => update("gender", g)}
                      className="mr-3 h-10 flex-row items-center gap-2 rounded-md"
                      activeOpacity={0.7}
                    >
                      {/* radio ring */}
                      <View
                        className={cn(
                          "w-5 h-5 rounded-full border-2 items-center justify-center",
                          form.gender === g ? "border-accent-dark" : "border-border"
                        )}
                      >
                        {form.gender === g && (
                          <View className="w-2.5 h-2.5 rounded-full bg-accent-dark" />
                        )}
                      </View>

                      <Text
                        variant="body-md"
                        weight={form.gender === g ? "semibold" : "regular"}
                        color={form.gender === g ? "primary" : "secondary"}
                      >
                        {g === "male" ? "Male" : "Female"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(v) => update("phone", v)}
                error={errors.phone}
                leftIcon={<Phone size={18} color={Colors.textSecondary} />}
              />
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 3 — Email, Password, Confirm Password
          ══════════════════════════════════════════════════ */}
          {step === 3 && (
            <View className="px-6 gap-4">
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => update("email", v)}
                error={errors.email}
                leftIcon={<Mail size={18} color={Colors.textSecondary} />}
              />

              <Input
                label="Password"
                placeholder="Min. 6 characters"
                secureTextEntry
                value={form.password}
                onChangeText={(v) => update("password", v)}
                error={errors.password}
                leftIcon={<Lock size={18} color={Colors.textSecondary} />}
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                secureTextEntry
                value={form.confirmPassword}
                onChangeText={(v) => update("confirmPassword", v)}
                error={errors.confirmPassword}
                leftIcon={<Lock size={18} color={Colors.textSecondary} />}
              />
            </View>
          )}

          {/* ── bottom CTA ── */}
          <View className="px-6 pt-8 pb-6 mt-auto gap-4">
            <Button
              label={step === TOTAL_STEPS ? "Create Account" : "Continue"}
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleNext}
            />

            <View className="flex-row items-center justify-center gap-1">
              <Text variant="body-sm" color="secondary">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text variant="body-sm" weight="semibold" color="accent">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorModal
        visible={modalVisible}
        message={errorMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
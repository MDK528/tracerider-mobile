import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Gender, Role } from "@/types/auth";
import { router } from "expo-router";
import { ArrowLeft, Lock, Mail, Phone, User } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Platform,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorModal } from "@/components/ErrorModal";


interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: Role;
  gender: Gender;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "passenger",
    gender: "male",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-]{10,}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        gender: form.gender as Gender,
        address: "",
        avatarUrl: "",
      });
      // _layout.tsx auth guard handles redirect
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Something went wrong. Try again.";
      // Alert.alert("Registration Failed", message);
      setErrorMessage(message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

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
          {/* Header */}
          <View className="px-6 pt-4 pb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-sm bg-surface border border-border"
            >
              <ArrowLeft size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="px-6 pt-6 pb-8">
            <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
              Create account
            </Text>
            <Text variant="body-md" color="secondary">
              Join TraceRider today
            </Text>
          </View>

          {/* Role Toggle */}
          <View className="px-6 mb-6">
            <Text variant="body-sm" weight="medium" color="primary" className="mb-2">
              I am a
            </Text>
            <View className="flex-row bg-dark border border-border rounded-lg p-1">
              {(["passenger", "driver"] as Role[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setForm((f) => ({ ...f, role: r }))}
                  className={cn(
                    "flex-1 h-10 items-center justify-center rounded-sm",
                    form.role === r ? "bg-surface" : "bg-transparent"
                  )}
                >
                  <Text
                    variant="body-sm"
                    weight="semibold"
                    color={form.role === r ? "primary" : "secondary"}
                  >
                    {r === "passenger" ? "Passenger" : "Driver"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form */}
          <View className="px-6 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.fullName}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, fullName: v }));
                if (errors.fullName) setErrors((e) => ({ ...e, fullName: undefined }));
              }}
              error={errors.fullName}
              leftIcon={<User size={18} color={Colors.textSecondary} />}
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, email: v }));
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              error={errors.email}
              leftIcon={<Mail size={18} color={Colors.textSecondary} />}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, phone: v }));
                if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
              }}
              error={errors.phone}
              leftIcon={<Phone size={18} color={Colors.textSecondary} />}
            />

            {/* Gender Toggle */}
<View className="px-6 mb-6">
  <Text
    variant="body-sm"
    weight="medium"
    color="primary"
    className="mb-2"
  >
    Gender
  </Text>

  <View className="flex-row bg-dark border border-border rounded-lg p-1">
    {(["male", "female"] as Gender[]).map((gender) => (
      <TouchableOpacity
        key={gender}
        onPress={() =>
          setForm((f) => ({
            ...f,
            gender,
          }))
        }
        className={cn(
          "flex-1 h-10 items-center justify-center rounded-sm",
          form.gender === gender
            ? "bg-white"
            : "bg-transparent"
        )}
      >
        <Text
          variant="body-sm"
          weight="semibold"
          color={
            form.gender === gender
              ? "primary"
              : "secondary"
          }
        >
          {gender === "male" ? "Male" : "Female"}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

            <Input
              label="Password"
              placeholder="Min. 6 characters"
              secureTextEntry
              value={form.password}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, password: v }));
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              leftIcon={<Lock size={18} color={Colors.textSecondary} />}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry
              value={form.confirmPassword}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, confirmPassword: v }));
                if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              leftIcon={<Lock size={18} color={Colors.textSecondary} />}
            />
          </View>

          {/* Bottom */}
          <View className="px-6 pt-8 pb-6 mt-auto gap-4">
            <Button
              label="Create Account"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
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
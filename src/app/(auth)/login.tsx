import { useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Lock } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";
import { ErrorModal } from "@/components/ErrorModal";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const { login } = useAuth();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      // _layout.tsx auth guard handles redirect
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Something went wrong. Try again.";
      // Alert.alert("Login Failed", message);
      setErrorMessage(message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-lg bg-surface border border-border"
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View className="px-6 pt-6 pb-8">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Welcome back
          </Text>
          <Text variant="body-md" color="secondary">
            Sign in to continue your journey
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 gap-4">
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
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, password: v }));
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            leftIcon={<Lock size={18} color={Colors.textSecondary} />}
          />

          <TouchableOpacity className="self-end">
            <Text variant="body-sm" weight="medium" color="accent">
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom */}
        <View className="px-6 pt-8 pb-6 mt-auto gap-4">
          <Button
            label="Sign In"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleLogin}
          />

          <View className="flex-row items-center justify-center gap-1">
            <Text variant="body-sm" color="secondary">
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
              <Text variant="body-sm" weight="semibold" color="accent">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <ErrorModal
        visible={modalVisible}
        message={errorMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
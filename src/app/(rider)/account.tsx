import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getMe, updateUser } from "@/services/auth";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female" | null;
  address: string | null;
  role: string;
}

interface FormState {
  fullName: string;
  phone: string;
  address: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function RiderAccount() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ fullName: "", phone: "", address: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMe();
      setProfile(data);
      setForm({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address ?? "",
      });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load your profile.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  function validate() {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    try {
      await updateUser({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      await fetchProfile();
      setEditMode(false);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to save profile.");
      setModalVisible(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color={Colors.dark} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-4">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Account
          </Text>
          <Text variant="body-md" color="secondary">
            Your profile details.
          </Text>
        </View>

        <View className="px-6 gap-4 mb-6">
          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <View>
              <Text variant="body-sm" color="secondary" className="mb-1">Email</Text>
              <Text variant="body-md" weight="semibold">{profile?.email}</Text>
            </View>

            {editMode ? (
              <Input
                label="Full name"
                placeholder="Your name"
                value={form.fullName}
                error={errors.fullName}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, fullName: value }));
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Full name</Text>
                <Text variant="body-md" weight="semibold">{form.fullName}</Text>
              </View>
            )}

            {editMode ? (
              <Input
                label="Phone"
                placeholder="Phone number"
                value={form.phone}
                error={errors.phone}
                keyboardType="phone-pad"
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, phone: value }));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Phone</Text>
                <Text variant="body-md" weight="semibold">{form.phone}</Text>
              </View>
            )}

            {editMode ? (
              <Input
                label="Address"
                placeholder="Your address"
                value={form.address}
                onChangeText={(value) => setForm((prev) => ({ ...prev, address: value }))}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Address</Text>
                <Text variant="body-md" weight="semibold">{form.address || "—"}</Text>
              </View>
            )}

            {profile?.gender && (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Gender</Text>
                <Text variant="body-md" weight="semibold">
                  {profile.gender === "male" ? "Male" : "Female"}
                </Text>
              </View>
            )}

            <Button
              label={editMode ? "Save changes" : "Edit profile"}
              variant={editMode ? "primary" : "outline"}
              size="lg"
              loading={saving}
              onPress={editMode ? handleSave : () => setEditMode(true)}
            />
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Button label="Logout" variant="outline" size="md" onPress={logout} />
      </View>

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}
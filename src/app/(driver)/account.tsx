import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getDriverProfile, updateDriverProfile } from "@/services/driver";
import type { DriverProfile } from "@/types/driver";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormState {
  state: string;
  serviceArea: string;
  vehicleModel: string;
  vehicleNo: string;
  licenceNo: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const FIELDS: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: "state", label: "State", placeholder: "Enter state" },
  { key: "serviceArea", label: "Service area", placeholder: "City1, City2, City3" },
  { key: "vehicleModel", label: "Vehicle model", placeholder: "Toyota Prius" },
  { key: "vehicleNo", label: "Vehicle number", placeholder: "ABC-1234" },
  { key: "licenceNo", label: "Licence number", placeholder: "DL-001234567890" },
];

export default function DriverAccount() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({
    state: "",
    serviceArea: "",
    vehicleModel: "",
    vehicleNo: "",
    licenceNo: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDriverProfile();
      setProfile(data);
      setForm({
        state: data.state,
        serviceArea: data.serviceArea.join(", "),
        vehicleModel: data.vehicleModel,
        vehicleNo: data.vehicleNo,
        licenceNo: data.licenceNo,
      });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load driver profile.");
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
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.serviceArea.trim()) newErrors.serviceArea = "Service area is required";
    if (!form.vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required";
    if (!form.vehicleNo.trim()) newErrors.vehicleNo = "Vehicle number is required";
    if (!form.licenceNo.trim()) newErrors.licenceNo = "Licence number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Vehicle docs are locked once the driver has completed at least one trip
  const docsLocked = (profile?.totalTrips ?? 0) > 0;

  async function handleSave() {
    if (!profile || !validate()) return;

    setSaving(true);
    try {
      const payload = docsLocked
        ? {
            state: form.state.trim(),
            serviceArea: form.serviceArea.split(",").map((item) => item.trim()).filter(Boolean),
          }
        : {
            state: form.state.trim(),
            serviceArea: form.serviceArea.split(",").map((item) => item.trim()).filter(Boolean),
            vehicleModel: form.vehicleModel.trim(),
            vehicleNo: form.vehicleNo.trim(),
            licenceNo: form.licenceNo.trim(),
          };

      const updated = await updateDriverProfile(payload);

      setProfile((prev) => (prev ? { ...prev, ...updated } : (updated as DriverProfile)));
      setForm((prev) => ({
        ...prev,
        state: updated.state,
        serviceArea: updated.serviceArea.join(", "),
        vehicleModel: updated.vehicleModel,
        vehicleNo: updated.vehicleNo,
        licenceNo: updated.licenceNo,
      }));
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
            Vehicle details and service areas.
          </Text>
        </View>

        <View className="px-6 gap-4 mb-6">
          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <Text variant="heading-sm" weight="bold">
              Vehicle details & service areas
            </Text>

            {docsLocked && editMode && (
              <View className="rounded-2xl bg-bg border border-border p-3">
                <Text variant="caption" color="secondary">
                  Vehicle model, number, and licence can&apos;t be changed after completing a trip.
                </Text>
              </View>
            )}

            {FIELDS.map(({ key, label, placeholder }) => {
              const isVehicleDocField = key === "vehicleModel" || key === "vehicleNo" || key === "licenceNo";
              const isEditable = editMode && !(docsLocked && isVehicleDocField);

              if (isEditable) {
                return (
                  <Input
                    key={key}
                    label={label}
                    placeholder={placeholder}
                    value={form[key]}
                    error={errors[key]}
                    editable={isEditable}
                    onChangeText={(value) => {
                      setForm((prev) => ({ ...prev, [key]: value }));
                      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
                    }}
                  />
                );
              }

              return (
                <View key={key}>
                  <Text variant="body-sm" color="secondary" className="mb-1">
                    {label}
                  </Text>
                  <Text variant="body-md" weight="semibold">
                    {form[key]}
                  </Text>
                </View>
              );
            })}

            <Button
              label={editMode ? "Save changes" : "Edit"}
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

      <ErrorModal
        visible={modalVisible}
        message={errorMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
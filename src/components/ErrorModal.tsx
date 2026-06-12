import { Modal, View, TouchableOpacity } from "react-native";
import { CircleAlert, X } from "lucide-react-native";

import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/colors";

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function ErrorModal({
  visible,
  title = "Login Failed",
  message,
  onClose,
}: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full rounded-3xl bg-surface border border-border p-6">
          
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4 top-4"
          >
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(239,68,68,0.15)",
              }}
            >
              <CircleAlert
                size={32}
                color="#ef4444"
              />
            </View>

            <Text
              variant="heading-sm"
              weight="bold"
              color="primary"
              className="text-center mb-2"
            >
              {title}
            </Text>

            <Text
              variant="body-md"
              color="secondary"
              className="text-center mb-6"
            >
              {message}
            </Text>
          </View>

          <Button
            label="Try Again"
            variant="primary"
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}
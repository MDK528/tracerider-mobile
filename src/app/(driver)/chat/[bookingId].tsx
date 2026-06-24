import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Send } from "lucide-react-native";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/services/socket";
import { useAuth } from "@/context/AuthContext";

interface Message {
  senderId: string;
  senderRole?: "passenger" | "driver";
  message: string;
  timestamp: string;
}

export default function DriverChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: "Chat with Passenger" });

    let isMounted = true;

    const initSocket = async () => {
      const socket = await getSocket();
      if (!isMounted) return;

      socketRef.current = socket;
      socket.on("chat:receive", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
      });
    };

    initSocket();

    return () => {
      isMounted = false;
      socketRef.current?.off("chat:receive");
    };
  }, [navigation]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socketRef.current?.emit("chat:send", { rideId: bookingId, message: input.trim() });
    setInput("");
  };

  const myId = user?.id;

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.senderId === myId;
    return (
      <View className={`flex-row mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
        <View
          className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
            isMine ? "bg-dark rounded-tr-sm" : "bg-surface rounded-tl-sm"
          }`}
          style={{ elevation: isMine ? 0 : 1 }}
        >
          <Text className={`text-sm ${isMine ? "text-white" : "text-text-primary"}`}>
            {item.message}
          </Text>
          <Text
            className={`text-[10px] mt-1 ${
              isMine ? "text-white/50" : "text-text-secondary"
            }`}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "android" ? "padding" : "height"}
        keyboardVerticalOffset={10}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-text-secondary text-sm">
                No messages yet. Say hi!
              </Text>
            </View>
          }
        />

        <View className="flex-row items-center px-4 py-3 bg-surface border-t border-border gap-3">
          <TextInput
            className="flex-1 bg-bg rounded-pill px-4 py-2.5 text-text-primary text-sm"
            placeholder="Type a message..."
            placeholderTextColor="#8C9290"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            className="w-10 h-10 rounded-full bg-dark items-center justify-center"
            activeOpacity={0.8}
          >
            <Send size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

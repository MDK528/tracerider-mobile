import { View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Text } from './ui/Text';

export default function SplashScreen() {
  return (
    <View className="flex-1 bg-dark items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-dark-2 items-center justify-center mb-4">
        <MapPin size={32} color="#3F7CF6" strokeWidth={2.5} />
      </View>
      <Text className="text-white font-bold text-2xl">TraceRider</Text>
      <Text className="text-text-secondary text-sm mt-1">Your ride, on track</Text>
    </View>
  );
}
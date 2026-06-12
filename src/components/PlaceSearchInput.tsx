import { useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Input } from "./ui/Input";
import { Text } from "./ui/Text";
import { searchPlaces, type PlaceSuggestion } from "@/lib/geocoding";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (place: PlaceSuggestion) => void;
}

export function PlaceSearchInput({ label, placeholder, value, onChangeText, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(text: string) {
    onChangeText(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces(text);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }

  function handleSelect(place: PlaceSuggestion) {
    setSuggestions([]);
    onSelect(place);
  }

  return (
    <View>
      <Input label={label} placeholder={placeholder} value={value} onChangeText={handleChange} />

      {loading && (
        <View className="mt-1">
          <ActivityIndicator size="small" color="#16191A" />
        </View>
      )}

      {suggestions.length > 0 && (
        <View className="bg-surface border border-border rounded-card mt-1 overflow-hidden">
          {suggestions.map((item, idx) => (
            <TouchableOpacity
              key={`${item.latitude}-${item.longitude}-${idx}`}
              className="px-4 py-3 border-b border-border"
              onPress={() => handleSelect(item)}
            >
              <Text variant="body-sm">{item.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
import { BottomFade } from '@/components/global/BottomFade';
import { Header } from '@/components/global/Header';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  FileText,
  FlaskConical,
  Receipt,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/global/AppIcon';

const LINKS = [
  { label: 'Appointments', hint: 'Visits and bookings', icon: CalendarDays, path: '/screens/appointments' },
  { label: 'Prescriptions', hint: 'Medicines and dosage', icon: FileText, path: '/screens/prescriptions' },
  { label: 'Lab Reports', hint: 'Tests and results', icon: FlaskConical, path: '/screens/labs' },
  { label: 'Bills', hint: 'Payments and dues', icon: Receipt, path: '/screens/bills' },
] as const;

export default function ResourcesPage() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.zinc[50], colors.zinc[100]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-transparent">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Header title="Records" />
          <View className="px-6 pb-8 pt-6">
            <View className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
              <View className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
                <Text className="font-product text-base text-zinc-800">My Care</Text>
              </View>
              <View className="p-2">
                {LINKS.map((item, index) => (
                  <View key={item.label}>
                    <TouchableOpacity
                      onPress={() => router.push(item.path as never)}
                      className="flex-row items-center justify-between rounded-xl px-4 py-3 active:bg-zinc-50"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center gap-3">
                        <AppIcon Icon={item.icon} size={18} color={colors.zinc[600]} strokeWidth={1.5} />
                        <View>
                          <Text className="font-sans text-base text-zinc-800">{item.label}</Text>
                          <Text className="font-sans text-xs text-zinc-400">{item.hint}</Text>
                        </View>
                      </View>
                      <AppIcon Icon={ChevronRight} color={colors.zinc[500]} size={16} strokeWidth={1.5} />
                    </TouchableOpacity>
                    {index < LINKS.length - 1 && <View className="mx-4 h-px bg-zinc-100" />}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        <BottomFade />
      </SafeAreaView>
    </LinearGradient>
  );
}

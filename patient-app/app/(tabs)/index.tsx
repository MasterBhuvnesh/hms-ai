import { AppIcon } from '@/components/global/AppIcon';
import { BottomFade } from '@/components/global/BottomFade';
import { colors } from '@/constants/colors';
import {
  ensurePatientForClerk,
  getAppointmentsForPatient,
  getBillsForPatient,
  getLabsForPatient,
  getPrescriptionsForPatient,
  type PatientRow,
} from '@/lib/patients';
import logger from '@/utils/logger';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  FileText,
  FlaskConical,
  Receipt,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<{
    id: string;
    date: string;
    time: string;
    doctor: string;
    department: string;
    status: string;
  } | null>(null);
  const [counts, setCounts] = useState({
    appointments: 0,
    prescriptions: 0,
    pendingLabs: 0,
    pendingBills: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const fetchHome = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const clerkToken = await getTokenRef.current();
      if (!clerkToken) throw new Error('Authentication required. Please sign in.');
      if (!user?.id) throw new Error('User not loaded.');
      const client = createClerkSupabaseClient(async () => clerkToken);
      const row = await ensurePatientForClerk(client, {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? null,
        fullName: user.fullName ?? null,
      });
      setPatient(row);
      const [appts, rx, labRows, bills] = await Promise.all([
        getAppointmentsForPatient(client, row.name),
        getPrescriptionsForPatient(client, row.name),
        getLabsForPatient(client, row.name),
        getBillsForPatient(client, row.name),
      ]);
      const list = (appts as { id: string; date: string; time: string; doctor: string; department: string; status: string }[]).filter(
        (a) => a.status === 'Scheduled' || a.status === 'In Progress'
      );
      setUpcoming(list[0] ?? null);
      setCounts({
        appointments: (appts as unknown[]).length,
        prescriptions: (rx as unknown[]).length,
        pendingLabs: (labRows as { status: string }[]).filter((l) => l.status !== 'Ready').length,
        pendingBills: (bills as { status: string }[]).filter((b) => b.status !== 'Paid').length,
      });
      logger.success('Patient home loaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load home';
      setError(message);
      logger.error(`Error loading patient home: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.fullName]);

  useEffect(() => {
    if (user?.id) void fetchHome();
  }, [user?.id, fetchHome]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchHome();
    } finally {
      setRefreshing(false);
    }
  }, [fetchHome]);

  const go = (path: '/screens/appointments' | '/screens/prescriptions' | '/screens/labs' | '/screens/bills') =>
    router.push(path as never);

  return (
    <LinearGradient
      colors={[colors.zinc[50], colors.zinc[100]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-6 pt-2">
          <View>
            <Text className="font-sans text-sm text-zinc-500">Welcome</Text>
            <Text className="font-product text-2xl text-zinc-900">
              {user?.fullName || patient?.name || 'Patient'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="rounded-full bg-white px-4 py-2 shadow-sm"
            activeOpacity={0.7}
          >
            <Text className="font-product text-sm text-zinc-700">Profile</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.zinc[600]]}
              tintColor={colors.zinc[600]}
            />
          }
        >
          {loading ? (
            <View className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
              <Text className="font-sans text-sm text-zinc-500">Loading your care...</Text>
            </View>
          ) : error ? (
            <View className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <Text className="font-product text-base text-red-800">Could not load home</Text>
              <Text className="mt-2 font-sans text-sm text-red-600">{error}</Text>
              <TouchableOpacity
                onPress={() => void fetchHome()}
                className="mt-3 self-start rounded-lg bg-zinc-800 px-4 py-2"
                activeOpacity={0.7}
              >
                <Text className="font-product text-sm text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
                <Text className="mb-1 font-product text-base text-zinc-800">
                  {upcoming ? 'Upcoming Visit' : 'No Upcoming Visit'}
                </Text>
                {upcoming ? (
                  <View>
                    <Text className="font-sans text-sm text-zinc-600">
                      {upcoming.date} {upcoming.time} - {upcoming.doctor}
                    </Text>
                    <Text className="font-sans text-xs text-zinc-500">
                      {upcoming.department} - {upcoming.status}
                    </Text>
                  </View>
                ) : (
                  <Text className="font-sans text-sm text-zinc-500">
                    Nothing scheduled. Contact reception to book a visit.
                  </Text>
                )}
              </View>

              <View className="mb-6 flex-row flex-wrap gap-3">
                {[
                  { label: 'Visits', value: counts.appointments, icon: CalendarDays, path: '/screens/appointments' as const },
                  { label: 'Active Rx', value: counts.prescriptions, icon: FileText, path: '/screens/prescriptions' as const },
                  { label: 'Pending Labs', value: counts.pendingLabs, icon: FlaskConical, path: '/screens/labs' as const },
                  { label: 'Pending Bills', value: counts.pendingBills, icon: Receipt, path: '/screens/bills' as const },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.label}
                    onPress={() => go(c.path)}
                    className="min-w-[45%] flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg"
                    activeOpacity={0.7}
                  >
                    <AppIcon Icon={c.icon} size={20} color={colors.zinc[600]} strokeWidth={1.5} />
                    <Text className="mt-2 font-product text-2xl text-zinc-900">{c.value}</Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="font-sans text-sm text-zinc-500">{c.label}</Text>
                      <AppIcon Icon={ChevronRight} size={14} color={colors.zinc[400]} strokeWidth={1.5} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {patient && (patient.age === 0 || !patient.phone) && (
                <View className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-6">
                  <Text className="font-product text-base text-orange-800">
                    Complete your patient profile
                  </Text>
                  <Text className="mb-3 mt-1 font-sans text-sm text-orange-700">
                    Add your age, phone, gender, and blood group so visits and records match you.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/screens/edit-profile')}
                    className="self-start rounded-lg bg-orange-500 px-4 py-2"
                    activeOpacity={0.7}
                  >
                    <Text className="font-product text-sm text-white">Complete Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
        <BottomFade />
      </SafeAreaView>
    </LinearGradient>
  );
}

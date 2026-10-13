import { AppIcon } from '@/components/global/AppIcon';
import { BottomFade } from '@/components/global/BottomFade';
import { Header } from '@/components/global/Header';
import { GamificationCard } from '@/components/profile/GamificationCard';
import { colors } from '@/constants/colors';
import { getMyProgress } from '@/lib/api';
import {
  ensurePatientForClerk,
  getAppointmentsForPatient,
  getLabsForPatient,
  getPrescriptionsForPatient,
  type PatientRow,
} from '@/lib/patients';
import { ProfileCardProps } from '@/types';
import type { MyProgress } from '@/types';
import logger from '@/utils/logger';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Link, TriangleAlertIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dev token logger, commented out at the owner's request. Lives in
// utils/jwt.dev.ts; uncomment with its button below when needed.
// import { useLogTokenDev } from '@/utils/jwt.dev';
// import { Key } from 'lucide-react-native';

interface ExtendedProfileCardProps extends ProfileCardProps {
  onEditBio?: () => void;
}

const ProfileCard = ({
  name,
  bio,
  email,
  buttonText,
  image,
  onPress,
  onEditBio,
}: ExtendedProfileCardProps) => (
  <View className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
    <View className="flex-row items-center gap-4 px-4 pt-4">
      <Image
        source={image}
        className="h-24 w-24 rounded-full"
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
      <View className="flex-1 gap-0.5">
        <Text className="font-product text-base text-zinc-800">{name}</Text>
        <Text className="font-sans text-sm leading-5 text-zinc-600">{bio}</Text>
      </View>
    </View>

    <View className="p-6">
      <View className="mb-4 flex-row items-center gap-2">
        <AppIcon Icon={Link} size={16} color={colors.zinc[500]} />
        <Text className="font-sans text-sm leading-5 text-zinc-500">
          {email}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onPress}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-2.5 shadow-sm"
          activeOpacity={0.7}
        >
          <Text className="font-product text-base text-zinc-700">
            {buttonText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEditBio}
          className="flex-row items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 shadow-sm"
          activeOpacity={0.7}
        >
          <Text className="font-product text-base text-zinc-700">Edit Bio</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function ProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  // const logToken = useLogTokenDev();

  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<MyProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<
    { id: string; date: string; time: string; doctor: string; status: string; type: string }[]
  >([]);
  const [prescriptions, setPrescriptions] = useState<
    { id: string; date: string; diagnosis: string; status: string; prescription_medicines: { name: string; dosage: string; duration: string }[] }[]
  >([]);
  const [labs, setLabs] = useState<
    { id: string; test: string; result: string; status: string; date: string }[]
  >([]);

  // Clerk does not guarantee getToken is referentially stable. Reading it
  // through a ref keeps fetchProgress, and therefore the mount effect below,
  // from being rebuilt on every render this fetch causes itself. That
  // rebuild loop was hammering /progress/me until the global rate limiter
  // cut the app off.
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const inFlight = useRef(false);

  const fetchProgress = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setProgressLoading(true);
      setProgressError(null);

      // Get auth token from Clerk
      const token = await getTokenRef.current();
      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }

      logger.info('Fetching user progress');
      const data = await getMyProgress(token);
      setProgress(data);
      logger.success('User progress loaded successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load progress';
      setProgressError(errorMessage);
      logger.error(`Error loading progress: ${errorMessage}`);
    } finally {
      inFlight.current = false;
      setProgressLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  const fetchPatientData = useCallback(async () => {
    try {
      setPatientLoading(true);
      setPatientError(null);

      const clerkToken = await getTokenRef.current();
      if (!clerkToken) throw new Error('Authentication required. Please sign in.');
      const client = createClerkSupabaseClient(async () => clerkToken);
      if (!user?.id) throw new Error('User not loaded.');

      const row = await ensurePatientForClerk(client, {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? null,
        fullName: user.fullName ?? null,
      });
      setPatient(row);

      const [appts, rx, labRows] = await Promise.all([
        getAppointmentsForPatient(client, row.name),
        getPrescriptionsForPatient(client, row.name),
        getLabsForPatient(client, row.name),
      ]);
      setAppointments((appts as typeof appointments).slice(0, 5));
      setPrescriptions((rx as typeof prescriptions).slice(0, 5));
      setLabs((labRows as typeof labs).slice(0, 5));
      logger.success('Patient record loaded successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load patient record';
      setPatientError(errorMessage);
      logger.error(`Error loading patient record: ${errorMessage}`);
    } finally {
      setPatientLoading(false);
    }
  }, [user?.id, user?.fullName]);

  useEffect(() => {
    if (user?.id) void fetchPatientData();
  }, [user?.id, fetchPatientData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProgress(), fetchPatientData()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProgress, fetchPatientData]);

  return (
    <LinearGradient
      colors={[colors.zinc[50], colors.zinc[100]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <Header title="Profile" />
        <ScrollView
          className="flex-1 px-6 pt-6"
          // Room for the progress card to scroll clear of the bottom fade
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.zinc[800]]}
              tintColor={colors.zinc[800]}
            />
          }
        >
          {!user?.fullName && (
            <View className="mb-6 overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 shadow-lg">
              <View className="p-6">
                <View className="mb-2 flex-row items-center gap-3">
                  <AppIcon
                    Icon={TriangleAlertIcon}
                    size={20}
                    color={colors.orange[500]}
                  />
                  <Text className="font-product text-base text-orange-800">
                    Complete Your Profile
                  </Text>
                </View>
                <Text className="mb-3 font-sans text-sm leading-5 text-orange-700">
                  Please edit your profile to add your full name and complete
                  your account setup.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/screens/edit-profile')}
                  className="self-start rounded-lg bg-orange-500 px-4 py-2 shadow-sm"
                  activeOpacity={0.7}
                >
                  <Text className="font-product text-sm text-white">
                    Edit Profile Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ProfileCard
            name={user?.fullName || 'User'}
            bio={(user?.unsafeMetadata?.bio as string) || 'Studzee.in'}
            email={user?.emailAddresses[0]?.emailAddress || 'User'}
            buttonText="Edit Profile"
            image={
              user?.imageUrl ||
              require('@/assets/images/onboarding/AI-Powered Concept Mastery.png')
            }
            onPress={() => router.push('/screens/edit-profile')}
            onEditBio={() => router.push('/screens/edit-bio')}
          />

          <GamificationCard
            progress={progress}
            loading={progressLoading}
            error={progressError}
            onRetry={() => void fetchProgress()}
          />

          <View className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
            <View className="p-6">
              <Text className="mb-1 font-product text-base text-zinc-800">
                Patient Record
              </Text>
              {patientLoading ? (
                <Text className="font-sans text-sm text-zinc-500">Loading record...</Text>
              ) : patientError ? (
                <View>
                  <Text className="mb-3 font-sans text-sm text-red-500">{patientError}</Text>
                  <TouchableOpacity
                    onPress={() => void fetchPatientData()}
                    className="self-start rounded-lg bg-zinc-800 px-4 py-2"
                    activeOpacity={0.7}
                  >
                    <Text className="font-product text-sm text-white">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : !patient ? (
                <Text className="font-sans text-sm text-zinc-500">
                  No linked patient record yet.
                </Text>
              ) : (
                <View className="gap-1.5">
                  <Text className="font-sans text-sm text-zinc-600">
                    {patient.id} - {patient.name}, {patient.age} yrs, {patient.gender}
                  </Text>
                  <Text className="font-sans text-sm text-zinc-600">
                    Blood {patient.blood} - {patient.phone || 'No phone on file'}
                  </Text>
                  <Text className="font-sans text-sm text-zinc-600">
                    {patient.doctor} - {patient.department} - {patient.status}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
            <View className="p-6">
              <Text className="mb-3 font-product text-base text-zinc-800">
                Appointments
              </Text>
              {appointments.length === 0 ? (
                <Text className="font-sans text-sm text-zinc-500">No appointments found.</Text>
              ) : (
                <View className="gap-2">
                  {appointments.map((a) => (
                    <View key={a.id} className="rounded-lg bg-zinc-50 p-3">
                      <Text className="font-product text-sm text-zinc-800">
                        {a.date} {a.time} - {a.doctor}
                      </Text>
                      <Text className="font-sans text-xs text-zinc-500">
                        {a.id} - {a.type} - {a.status}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
            <View className="p-6">
              <Text className="mb-3 font-product text-base text-zinc-800">
                Prescriptions
              </Text>
              {prescriptions.length === 0 ? (
                <Text className="font-sans text-sm text-zinc-500">No prescriptions found.</Text>
              ) : (
                <View className="gap-2">
                  {prescriptions.map((r) => (
                    <View key={r.id} className="rounded-lg bg-zinc-50 p-3">
                      <Text className="font-product text-sm text-zinc-800">
                        {r.date} - {r.diagnosis}
                      </Text>
                      <Text className="font-sans text-xs text-zinc-500">
                        {r.id} - {r.status}
                      </Text>
                      {r.prescription_medicines.map((m, i) => (
                        <Text key={i} className="font-sans text-xs text-zinc-600">
                          {m.name} {m.dosage} x {m.duration}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
            <View className="p-6">
              <Text className="mb-3 font-product text-base text-zinc-800">
                Lab Reports
              </Text>
              {labs.length === 0 ? (
                <Text className="font-sans text-sm text-zinc-500">No lab reports found.</Text>
              ) : (
                <View className="gap-2">
                  {labs.map((l) => (
                    <View key={l.id} className="rounded-lg bg-zinc-50 p-3">
                      <Text className="font-product text-sm text-zinc-800">
                        {l.test} - {l.result}
                      </Text>
                      <Text className="font-sans text-xs text-zinc-500">
                        {l.id} - {l.status} - {l.date}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Dev token logger, commented out at the owner's request.
              Uncomment with the useLogTokenDev import and hook above. */}
          {/* {process.env.NODE_ENV !== 'production' && (
            <View className="flex-row items-center justify-center">
              <TouchableOpacity
                onPress={logToken}
                className="flex-row items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 shadow-sm"
                activeOpacity={0.7}
              >
                <AppIcon Icon={Key} size={16} color={colors.zinc[500]} />
                <Text className="font-product text-base text-zinc-700">
                  Log Token
                </Text>
              </TouchableOpacity>
            </View>
          )} */}
        </ScrollView>
        <BottomFade />
      </SafeAreaView>
    </LinearGradient>
  );
}

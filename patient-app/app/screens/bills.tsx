import { Header } from '@/components/global/Header';
import { colors } from '@/constants/colors';
import { ensurePatientForClerk, getBillsForPatient } from '@/lib/patients';
import logger from '@/utils/logger';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Row = {
  id: string;
  date: string;
  department: string;
  amount_text: string;
  status: string;
};

export default function BillsScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const clerkToken = await getTokenRef.current();
      if (!clerkToken) throw new Error('Authentication required. Please sign in.');
      if (!user?.id) throw new Error('User not loaded.');
      const client = createClerkSupabaseClient(async () => clerkToken);
      const patient = await ensurePatientForClerk(client, {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? null,
        fullName: user.fullName ?? null,
      });
      const data = await getBillsForPatient(client, patient.name);
      setRows(data as Row[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bills';
      setError(message);
      logger.error(`Bills failed: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.fullName]);

  useEffect(() => {
    if (user?.id) void fetchRows();
  }, [user?.id, fetchRows]);

  return (
    <LinearGradient colors={[colors.zinc[50], colors.zinc[100]]} className="flex-1">
      <SafeAreaView className="flex-1">
        <Header title="Bills" />
        <ScrollView
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                try {
                  await fetchRows();
                } finally {
                  setRefreshing(false);
                }
              }}
            />
          }
        >
          {loading ? (
            <Text className="font-sans text-sm text-zinc-500">Loading bills...</Text>
          ) : error ? (
            <View className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <Text className="font-product text-base text-red-800">{error}</Text>
              <TouchableOpacity
                onPress={() => void fetchRows()}
                className="mt-3 self-start rounded-lg bg-zinc-800 px-4 py-2"
              >
                <Text className="font-product text-sm text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : rows.length === 0 ? (
            <Text className="font-sans text-sm text-zinc-500">No bills found.</Text>
          ) : (
            <View className="gap-3">
              {rows.map((b) => (
                <View key={b.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <Text className="font-product text-base text-zinc-800">
                    {b.amount_text} - {b.status}
                  </Text>
                  <Text className="font-sans text-xs text-zinc-500">
                    {b.id} - {b.date} - {b.department}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

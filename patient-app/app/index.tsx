import { LoadingScreen } from '@/components/global/LoadingScreen';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen />;
  return <Redirect href={isSignedIn ? '/(tabs)' : '/(auth)/sign-in'} />;
}

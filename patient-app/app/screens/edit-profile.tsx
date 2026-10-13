import { CustomAlert } from '@/components/global/CustomAlert';
import { Header } from '@/components/global/Header';
import { colors } from '@/constants/colors';
import {
  getMyPatient,
  PATIENT_BLOOD_GROUPS,
  PATIENT_GENDERS,
  updatePatientProfile,
} from '@/lib/patients';
import logger from '@/utils/logger';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import * as DocumentPicker from 'expo-document-picker';
import { getInfoAsync, readAsStringAsync } from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const { user } = useUser();
  const { isLoaded, getToken } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profileImage, setProfileImage] = useState(user?.imageUrl || '');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<string>('Other');
  const [blood, setBlood] = useState<string>('O+');
  const [patientLoading, setPatientLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[];
  }>({ visible: false, title: '', message: '', buttons: [] });

  const showAlert = (
    title: string,
    message: string,
    buttons: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[]
  ) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  // Request permissions for accessing the image library
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'Permission Denied',
          'Sorry, we need camera roll permissions to upload images.',
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    })();
  }, []);

  // Prefill clinical fields from the linked Supabase patient row.
  useEffect(() => {
    if (!isLoaded || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const client = createClerkSupabaseClient(async () => token);
        const row = await getMyPatient(client, user.id);
        if (cancelled || !row) return;
        if (!firstName && !lastName && row.name) {
          const parts = row.name.trim().split(/\s+/);
          if (parts.length > 0) {
            setFirstName((prev) => prev || parts[0]);
            setLastName((prev) => prev || parts.slice(1).join(' '));
          }
        }
        if (row.age > 0) setAge(String(row.age));
        if (row.phone) setPhone(row.phone);
        if (row.gender) setGender(row.gender);
        if (row.blood) setBlood(row.blood);
      } catch (err) {
        logger.error(
          `Failed to load patient profile: ${err instanceof Error ? err.message : err}`
        );
      } finally {
        if (!cancelled) setPatientLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  // Convert image URI to base64
  const convertImageToBase64 = async (uri: string) => {
    try {
      const fileInfo = await getInfoAsync(uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        showAlert('Error', 'Image size must be less than 5MB.', [
          { text: 'OK', style: 'cancel' },
        ]);
        return null;
      }

      const base64 = await readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      showAlert('Error', 'Failed to process image. Please try again.', [
        { text: 'OK', style: 'cancel' },
      ]);
      return null;
    }
  };

  // Handle image selection from the gallery
  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Ensure 1:1 aspect ratio
        quality: 0.7, // Compress image to reduce size
      });

      if (!result.canceled) {
        // Resize and compress the image
        const manipulatedImage = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 500, height: 500 } }], // Resize to 500x500 (1:1 aspect ratio)
          { compress: 0.7, format: SaveFormat.JPEG }
        );

        // Convert the image to base64
        const base64Image = await convertImageToBase64(manipulatedImage.uri);
        if (base64Image) {
          setProfileImage(base64Image);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert('Error', 'Failed to pick image. Please try again.', [
        { text: 'OK', style: 'cancel' },
      ]);
    }
  };

  // Handle GIF selection from the document picker
  const handleGifPicker = async () => {
    try {
      setUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/gif', // Allow only GIF files
      });

      if (result.canceled) {
        console.log('User cancelled file picker.');
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No file selected.');
      }

      const file = result.assets[0];
      if (!file.uri) {
        throw new Error('No file URI found.');
      }

      // Convert the file to base64
      const base64Gif = await convertImageToBase64(file.uri);
      if (base64Gif) {
        setProfileImage(base64Gif);
      }
    } catch (error) {
      console.error('Error picking GIF:', error);
      showAlert('Error', 'Failed to pick GIF. Please try again.', [
        { text: 'OK', style: 'cancel' },
      ]);
    } finally {
      setUploading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!isLoaded || !user) {
      showAlert('Error', 'User not loaded. Please try again.', [
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }

    const parsedAge = age.trim() === '' ? 0 : Number(age.trim());
    if (age.trim() !== '' && (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 130)) {
      showAlert('Error', 'Age must be a whole number between 0 and 130.', [
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      // Update profile image if changed
      if (profileImage !== user.imageUrl) {
        await user.setProfileImage({ file: profileImage });
      }

      // Update first and last name
      await user.update({ firstName, lastName });

      // Update the linked Supabase patient row. Never inserts a second row.
      const token = await getToken();
      if (!token) {
        throw new Error('Sign-in expired. Please sign in again.');
      }
      const client = createClerkSupabaseClient(async () => token);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updatePatientProfile(client, user.id, {
        name: fullName || undefined,
        age: parsedAge,
        gender,
        phone,
        blood,
      });

      showAlert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          style: 'default',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showAlert(
        'Error',
        error.errors?.[0]?.message ||
          error.message ||
          'Failed to update profile. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LinearGradient
        colors={[colors.zinc[50], colors.zinc[100]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <Header title="Edit Profile" />
          <ScrollView className="flex-1 px-6 pt-6">
            <View className="items-center">
              {/* Profile Image */}
              <View className="mb-6 items-center">
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require('@/assets/images/onboarding/AI-Powered Concept Mastery.png')
                  }
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                  }}
                  className="mb-4 border-4 border-white shadow-lg"
                />
                <View className="mt-6 w-full flex-row gap-3">
                  <Pressable
                    onPress={handleImagePicker}
                    disabled={uploading || isLoading}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm active:opacity-70 disabled:opacity-50"
                  >
                    <Text className="text-center font-product text-sm text-zinc-700">
                      Change Photo
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleGifPicker}
                    disabled={uploading || isLoading}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm active:opacity-70 disabled:opacity-50"
                  >
                    <Text className="text-center font-product text-sm text-zinc-700">
                      Upload GIF
                    </Text>
                  </Pressable>
                </View>

                {(uploading || isLoading) && (
                  <ActivityIndicator
                    size="small"
                    color={colors.zinc[700]}
                    className="mt-2"
                  />
                )}
              </View>

              {/* First Name Input */}
              <View className="mb-4 w-full">
                <Text className="mb-2 font-product text-sm text-zinc-600">
                  First Name
                </Text>
                <TextInput
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 font-sans text-base text-zinc-800"
                  value={firstName}
                  placeholder="First Name"
                  placeholderTextColor={colors.zinc[400]}
                  onChangeText={setFirstName}
                  editable={!isLoading}
                />
              </View>

              {/* Last Name Input */}
              <View className="mb-6 w-full">
                <Text className="mb-2 font-product text-sm text-zinc-600">
                  Last Name
                </Text>
                <TextInput
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 font-sans text-base text-zinc-800"
                  value={lastName}
                  placeholder="Last Name"
                  placeholderTextColor={colors.zinc[400]}
                  onChangeText={setLastName}
                  editable={!isLoading}
                />
              </View>

              {/* Age Input */}
              <View className="mb-4 w-full">
                <Text className="mb-2 font-product text-sm text-zinc-600">
                  Age
                </Text>
                <TextInput
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 font-sans text-base text-zinc-800"
                  value={age}
                  placeholder={patientLoading ? 'Loading...' : 'Age'}
                  placeholderTextColor={colors.zinc[400]}
                  keyboardType="number-pad"
                  onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
                  editable={!isLoading}
                />
              </View>

              {/* Phone Input */}
              <View className="mb-4 w-full">
                <Text className="mb-2 font-product text-sm text-zinc-600">
                  Phone
                </Text>
                <TextInput
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 font-sans text-base text-zinc-800"
                  value={phone}
                  placeholder={patientLoading ? 'Loading...' : 'Phone'}
                  placeholderTextColor={colors.zinc[400]}
                  keyboardType="phone-pad"
                  onChangeText={setPhone}
                  editable={!isLoading}
                />
              </View>

              {/* Gender Selector */}
              <View className="mb-4 w-full">
                <Text className="mb-2 font-product text-sm text-zinc-600">
                  Gender
                </Text>
                <View className="flex-row gap-2">
                  {PATIENT_GENDERS.map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      disabled={isLoading}
                      className={`flex-1 rounded-xl border px-4 py-3.5 ${
                        gender === g
                          ? 'border-zinc-800 bg-zinc-800'
                          : 'border-zinc-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-center font-product text-sm ${
                          gender === g ? 'text-white' : 'text-zinc-700'
                        }`}
                      >
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Blood Group Selector */}
              <View className="mb-6 w-full">
                <Text className="mb-2 font-product text-sm text-zinc-600">
                  Blood Group
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {PATIENT_BLOOD_GROUPS.map((b) => (
                    <Pressable
                      key={b}
                      onPress={() => setBlood(b)}
                      disabled={isLoading}
                      className={`rounded-xl border px-4 py-2.5 ${
                        blood === b
                          ? 'border-zinc-800 bg-zinc-800'
                          : 'border-zinc-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`font-product text-sm ${
                          blood === b ? 'text-white' : 'text-zinc-700'
                        }`}
                      >
                        {b}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Update Button */}
              <Pressable
                onPress={handleUpdateProfile}
                disabled={isLoading || uploading}
                className="w-full rounded-xl bg-zinc-800 px-6 py-4 shadow-lg active:bg-zinc-700 disabled:opacity-50"
              >
                <Text className="text-center font-product text-base text-white">
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={hideAlert}
      />
    </>
  );
}

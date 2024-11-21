import React, { useState } from 'react';
import { Appbar } from 'react-native-paper';
import { View, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';

export default function RootLayout() {
  const [selectedValue, setSelectedValue] = useState('chat');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    // justifyContent: 'center',
    // alignItems: 'center',
    // width: 120, // Adjust based on your Appbar size
  },
  picker: {
    // color: 'white', // Ensures the text matches the Appbar theme
    // backgroundColor: 'transparent', // Blend with Appbar
    // height: 40, // Adjust for Picker display
  },
});

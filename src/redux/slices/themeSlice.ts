import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Appearance, ColorSchemeName} from 'react-native';
import {DefaultTheme, MD3DarkTheme} from 'react-native-paper';

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0066cc',
    background: '#ffffff',
    text: '#000000',
    surface: '#f5f5f5',
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#1e90ff',
    background: '#121212',
    text: '#ffffff',
    surface: '#1e1e1e',
  },
};

export type Theme = typeof LightTheme | typeof DarkTheme;

export interface ThemeState {
  value: Theme;
}

const initialState: ThemeState = {
  value: Appearance.getColorScheme() === 'dark' ? DarkTheme : LightTheme,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ColorSchemeName>) => {
      state.value = action.payload === 'dark' ? DarkTheme : LightTheme;
    },
    toggleTheme: state => {
      state.value = state?.value?.dark ? LightTheme : DarkTheme;
    },
  },
});

export const {setTheme, toggleTheme} = themeSlice.actions;

export default themeSlice.reducer;

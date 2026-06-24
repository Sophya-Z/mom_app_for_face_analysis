import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AnalysisHistoryScreen } from '../screens/AnalysisHistoryScreen';
import { AnalysisResultScreen } from '../screens/AnalysisResultScreen';
import { CameraCaptureScreen } from '../screens/CameraCaptureScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PhotoSourceScreen } from '../screens/PhotoSourceScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: '#F4FDFD' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PhotoSource"
        component={PhotoSourceScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CameraCapture"
        component={CameraCaptureScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AnalysisHistory"
        component={AnalysisHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AnalysisResult"
        component={AnalysisResultScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

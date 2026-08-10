import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { AppShell } from './src/components/layout/AppShell';
import { HomeScreen } from './src/components/screens/HomeScreen';
import { EquipmentSetupScreen } from './src/components/screens/EquipmentSetupScreen';
import { SessionScreen } from './src/components/screens/SessionScreen';
import { FaultScreen } from './src/components/screens/FaultScreen';
import { ScanScreen } from './src/components/screens/ScanScreen';
import { CalcScreen } from './src/components/screens/CalcScreen';
import { HistoryScreen } from './src/components/screens/HistoryScreen';
import { TrainingScreen } from './src/components/screens/TrainingScreen';
import { ReportScreen } from './src/components/screens/ReportScreen';
import { KeypadSheet } from './src/components/sheets/KeypadSheet';
import { RepairSheet } from './src/components/sheets/RepairSheet';
import { VoiceOverlay } from './src/components/sheets/VoiceOverlay';
import { useHvacueState } from './src/state/useHvacueState';
import { color, fontAssets } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const { state, actions } = useHvacueState();

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: color.appBg }} />;
  }

  let screen;
  switch (state.screen) {
    case 'home': screen = <HomeScreen state={state} actions={actions} />; break;
    case 'equipmentSetup': screen = <EquipmentSetupScreen state={state} actions={actions} />; break;
    case 'session': screen = <SessionScreen state={state} actions={actions} />; break;
    case 'fault': screen = <FaultScreen actions={actions} />; break;
    case 'scan': screen = <ScanScreen state={state} actions={actions} />; break;
    case 'calc': screen = <CalcScreen state={state} actions={actions} />; break;
    case 'history': screen = <HistoryScreen actions={actions} />; break;
    case 'training': screen = <TrainingScreen actions={actions} />; break;
    case 'report': screen = <ReportScreen state={state} actions={actions} />; break;
  }

  return (
    <AppShell>
      {screen}
      <KeypadSheet state={state} actions={actions} />
      <RepairSheet state={state} actions={actions} />
      <VoiceOverlay state={state} actions={actions} />
    </AppShell>
  );
}

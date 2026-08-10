import { AppShell } from './components/layout/AppShell';
import { HomeScreen } from './components/screens/HomeScreen';
import { EquipmentSetupScreen } from './components/screens/EquipmentSetupScreen';
import { SessionScreen } from './components/screens/SessionScreen';
import { FaultScreen } from './components/screens/FaultScreen';
import { ScanScreen } from './components/screens/ScanScreen';
import { CalcScreen } from './components/screens/CalcScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { TrainingScreen } from './components/screens/TrainingScreen';
import { ReportScreen } from './components/screens/ReportScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { KeypadSheet } from './components/sheets/KeypadSheet';
import { RepairSheet } from './components/sheets/RepairSheet';
import { VoiceOverlay } from './components/sheets/VoiceOverlay';
import { useHvacueState } from './state/useHvacueState';

function App() {
  const { state, actions } = useHvacueState();

  let screen;
  switch (state.screen) {
    case 'home': screen = <HomeScreen state={state} actions={actions} />; break;
    case 'equipmentSetup': screen = <EquipmentSetupScreen state={state} actions={actions} />; break;
    case 'session': screen = <SessionScreen state={state} actions={actions} />; break;
    case 'fault': screen = <FaultScreen state={state} actions={actions} />; break;
    case 'scan': screen = <ScanScreen state={state} actions={actions} />; break;
    case 'calc': screen = <CalcScreen state={state} actions={actions} />; break;
    case 'history': screen = <HistoryScreen actions={actions} />; break;
    case 'training': screen = <TrainingScreen state={state} actions={actions} />; break;
    case 'report': screen = <ReportScreen state={state} actions={actions} />; break;
    case 'settings': screen = <SettingsScreen state={state} actions={actions} />; break;
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

export default App;

import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { LESSONS, lessonById } from '../../engine/training';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton, ProgressBar, ScreenHeader } from '../ui/primitives';

const toneColor = { green: color.green, amber: color.amber, red: color.red };

function LessonDetail({ topic, actions }: { topic: string; actions: HvacueActions }) {
  const lesson = lessonById(topic);
  if (!lesson) return null;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={actions.closeTraining} />
        <View style={{ flex: 1 }}>
          <Text style={mono({ weight: 500, size: 9.5, letterSpacing: 1, color: color.cyan })}>LEVEL {lesson.level} · {lesson.minutes} MIN READ</Text>
          <Text style={[heading({ weight: 600, size: 16, lineHeight: 19 }), { marginTop: 5 }]}>{lesson.title}</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 18 }}>
        <Text style={heading({ weight: 500, size: 13, lineHeight: 20, color: color.textBody })}>{lesson.summary}</Text>
        {lesson.sections.map((s) => (
          <View key={s.heading} style={{ marginTop: 20 }}>
            <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.2, color: color.amber })}>{s.heading.toUpperCase()}</Text>
            <Text style={[heading({ weight: 400, size: 13, lineHeight: 21, color: color.textBody }), { marginTop: 9 }]}>{s.body}</Text>
          </View>
        ))}
        <View style={{ marginTop: 24, borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 16 }}>
          <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.3, color: color.textDim })}>TAKEAWAYS</Text>
          {lesson.takeaways.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Text style={mono({ weight: 600, size: 12, lineHeight: 17, color: color.amber })}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[heading({ weight: 500, size: 12.5, lineHeight: 18, color: color.textBody }), { flex: 1 }]}>{t}</Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => actions.go('session')}
          style={{ marginTop: 16, height: 50, borderRadius: 12, backgroundColor: color.cyan, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={mono({ weight: 700, size: 11.5, letterSpacing: 1, color: color.cyanOn })}>PRACTICE ON A LIVE SESSION</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export function TrainingScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  if (state.trainingTopic) return <LessonDetail topic={state.trainingTopic} actions={actions} />;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Training · skill map" subtitle="Tap a topic to open the lesson" onBack={() => actions.go('home')} />
      <View style={{ paddingHorizontal: 18, gap: 10 }}>
        {LESSONS.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => actions.openTraining(l.id)}
            style={{ borderRadius: 12, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, padding: 15 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <Text style={[heading({ weight: 600, size: 14 }), { flex: 1 }]}>{l.title}</Text>
              <Text style={mono({ weight: 600, size: 12, color: toneColor[l.tone] })}>{l.progress}%</Text>
            </View>
            <View style={{ marginTop: 10, marginBottom: 9 }}>
              <ProgressBar pct={l.progress} fillColor={toneColor[l.tone]} height={5} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[heading({ weight: 500, size: 11, lineHeight: 15, color: color.textMuted }), { flex: 1 }]}>{l.summary}</Text>
              <Text style={mono({ weight: 600, size: 9, letterSpacing: 0.8, color: color.cyan })}>OPEN ›</Text>
            </View>
          </Pressable>
        ))}
        <View style={{ marginTop: 4, borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 15 }}>
          <Text style={heading({ weight: 600, size: 14 })}>Weakest area: VRF</Text>
          <Text style={[heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.textMuted }), { marginTop: 8 }]}>
            Level 7 covers branch controllers, addressing and EEV faults — and manufacturer procedures are not interchangeable here.
          </Text>
          <Pressable
            onPress={() => actions.openTraining('vrf')}
            style={{ marginTop: 14, height: 48, borderRadius: 11, backgroundColor: color.cyan, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={mono({ weight: 700, size: 11.5, letterSpacing: 1, color: color.cyanOn })}>OPEN THE VRF LESSON</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

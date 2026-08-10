import { color, font } from '../../theme';
import { LESSONS, lessonById } from '../../engine/training';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton, ProgressBar, ScreenHeader } from '../ui/primitives';

const toneColor = { green: color.green, amber: color.amber, red: color.red };

function LessonDetail({ topic, actions }: { topic: string; actions: HvacueActions }) {
  const lesson = lessonById(topic);
  if (!lesson) return null;
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={actions.closeTraining} />
        <div style={{ flex: 1 }}>
          <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.12em' }}>LEVEL {lesson.level} · {lesson.minutes} MIN READ</div>
          <div style={{ font: `600 16px/1.2 ${font.heading}`, marginTop: 5 }}>{lesson.title}</div>
        </div>
      </div>
      <div style={{ padding: '0 18px' }}>
        <div style={{ font: `500 13px/1.5 ${font.heading}`, color: color.textBody }}>{lesson.summary}</div>
        {lesson.sections.map((s) => (
          <div key={s.heading} style={{ marginTop: 20 }}>
            <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.amber, letterSpacing: '.12em' }}>{s.heading.toUpperCase()}</div>
            <div style={{ font: `400 13px/1.65 ${font.heading}`, color: color.textBody, marginTop: 9 }}>{s.body}</div>
          </div>
        ))}
        <div style={{ marginTop: 24, borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 16 }}>
          <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.14em' }}>TAKEAWAYS</div>
          {lesson.takeaways.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <div style={{ font: `600 12px/1.4 ${font.mono}`, color: color.amber }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ flex: 1, font: `500 12.5px/1.5 ${font.heading}`, color: color.textBody }}>{t}</div>
            </div>
          ))}
        </div>
        <div
          onClick={() => actions.go('session')}
          style={{ marginTop: 16, height: 50, borderRadius: 12, background: color.cyan, color: color.cyanOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11.5px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}
        >
          PRACTICE ON A LIVE SESSION
        </div>
      </div>
    </div>
  );
}

export function TrainingScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  if (state.trainingTopic) return <LessonDetail topic={state.trainingTopic} actions={actions} />;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <ScreenHeader title="Training · skill map" subtitle="Tap a topic to open the lesson" onBack={() => actions.go('home')} />
      <div style={{ padding: '0 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LESSONS.map((l) => (
            <div
              key={l.id}
              onClick={() => actions.openTraining(l.id)}
              style={{ borderRadius: 12, background: color.card, border: `1px solid ${color.borderStrong}`, padding: 15, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ flex: 1, font: `600 14px/1.2 ${font.heading}` }}>{l.title}</div>
                <div style={{ font: `600 12px/1 ${font.mono}`, color: toneColor[l.tone] }}>{l.progress}%</div>
              </div>
              <div style={{ margin: '10px 0 9px' }}>
                <ProgressBar pct={l.progress} fillColor={toneColor[l.tone]} height={5} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, font: `500 11px/1.4 ${font.heading}`, color: color.textMuted }}>{l.summary}</div>
                <div style={{ font: `600 9px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.08em' }}>OPEN ›</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 15 }}>
          <div style={{ font: `600 14px/1.2 ${font.heading}` }}>Weakest area: VRF</div>
          <div style={{ font: `500 11.5px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 8 }}>
            Level 7 covers branch controllers, addressing and EEV faults — and manufacturer procedures are not interchangeable here.
          </div>
          <div
            onClick={() => actions.openTraining('vrf')}
            style={{ marginTop: 14, height: 48, borderRadius: 11, background: color.cyan, color: color.cyanOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11.5px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}
          >
            OPEN THE VRF LESSON
          </div>
        </div>
      </div>
    </div>
  );
}

# Learn progress: MongoDB + localStorage

## Signed-in users (MongoDB)

Progress for every allowlisted course is stored in the `CourseProgress` collection
(`userId` + `courseId`).

### Document fields (high level)

| Field | Purpose |
|-------|---------|
| `completedLessons` | Lesson completions + XP |
| `savedCode` / `notes` | Private editor state (omitted from public APIs) |
| `bookmarks` / `lastLessonId` | Navigation state |
| `totalXp` / `totalMinutesSpent` / `currentStreak` / `lastActiveDate` | Aggregates |
| `lessonEngagement[]` | Per-lesson read / confidence / quiz / challenge telemetry |

`lessonEngagement` shape:

```js
{
  lessonId: String,
  read: Boolean,
  confidence: String,      // e.g. review | almost | ready
  quizAttempts: Object,    // legacy: { [quizIndex]: number }
                           // preferred: { [quizIndex]: { selectedIndex, correct, answeredAt } }
  challengeAttempts: Number,     // failed challenge runs
  challengeLastResult: String,   // pass | fail
  lastTab: String,               // theory | challenge
  updatedAt: Date,
}
```

Lesson ink annotations live in a **separate** `LessonAnnotation` collection
(`userId` + `courseId` + `lessonId` + `tab`), not on `CourseProgress`.

API (Bearer JWT required unless noted):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/learn/progress` | List my course progress (includes engagement) |
| GET | `/api/auth/learn/dashboard` | Learner dashboard overview + all courses |
| POST | `/api/auth/learn/progress/merge` | Upload browser local progress on login (incl. engagement) |
| GET | `/api/auth/learn/:courseId/progress` | Load one course |
| POST | `/api/auth/learn/:courseId/progress/complete` | Mark lesson complete |
| POST | `.../last-lesson`, `/code`, `/note`, `/bookmark`, `/time` | Other writes |
| POST | `/api/auth/learn/:courseId/progress/engagement` | Upsert one lesson’s engagement |
| GET/PUT | `/api/auth/learn/:courseId/annotations/:lessonId?tab=` | Private annotation CRUD (100KB cap; server may downsample) |
| POST | `/api/auth/learn/annotations/merge` | Upload local annotations on login |
| GET | `/api/auth/username/:username/learn/progress` | Public read (no code/notes/engagement detail) |
| GET | `/api/auth/username/:username/learn/dashboard` | Public dashboard (no engagement counts) |

Legacy OOP C++ routes under `/api/auth/learn/oops-cpp/progress/*` still work and
read/write the same `CourseProgress` doc (`courseId: oops-cpp`), migrating from
the old `OopsCppProgress` collection on first touch.

Daily XP / activity heatmap remains in `DailyXpProgress` via
`/api/auth/progress/daily-xp*`.

Daily challenge submit requires auth; streak updates `User.currentStreak`.

### Time tracking

Signed-in learners accrue `totalMinutesSpent` via `useLessonTimeTracking` inside
`useCourseProgress` (1 minute every 60s while `rememberLesson` has set an active
lesson). Guests do not write minutes until login.

### Dashboard overview fields

`GET /api/auth/learn/dashboard` returns:

- `overview.totalXp`, `dailyXpTotal`, `totalMinutesSpent`
- `coursesStarted` / `coursesCompleted`
- `bestStreak` / `activeStreak`
- `lessonsRead` / `quizAnswered` / `quizCorrect` / `challengeFails` (own only;
  stripped on public route)
- `courses[]`: per-course XP, completed count, bookmarks, minutes, streak,
  last lesson, last active, plus engagement counts when private

Polycoder progress (`/api/auth/polycoder/...`) also loads **all** `CourseProgress`
rows into `courses` (keyed by `courseId`) with aggregate stats.

## Guests (localStorage)

Unsigned visitors still use localStorage keys from
`frontend/src/features/learn/shared/courseRegistry.js`.

Engagement keys (also merged on login):

- `{prefix}_read_{lessonId}`
- `{prefix}_confidence_{lessonId}`
- `{prefix}_quiz_attempts_{lessonId}`

Annotations:

- `polycode_annotations_{courseOrPrefix}:{lessonId}:{theory|challenge}`

On login/register/session restore, `mergeLearnProgressOnLogin` uploads completions,
code, notes, bookmarks, engagement maps, and annotations into Mongo, then
`isolateLearnProgressForUser` clears shared guest buckets.

## Frontend entry points

- `useCourseProgress` — shared hook (includes time tracking + challenge reporters)
- `useLessonReadGate` / `useLessonQuizAttempts` — engagement → Mongo when signed in
- `LessonContentShell` — challenge telemetry context + lastTab + annotation course ids
- `LessonAnnotator` — local cache + debounced Mongo sync when signed in
- `mergeLearnProgressOnLogin` — called from `AuthContext` before isolating keys
- `useProfileLearnProgress` / `useLearnDashboard` — profile dashboard

## Still local-only (by design)

- Theme / IDE chrome / assistant dock position / annotation FAB position & color prefs
- Playground files + run history
- Language docs hub `UserProgress` API (exists on backend, unused by learn hooks)

## Deprecated backend path

`UserDailyProgress` + `dailyXpProgressService` + `dailyXpProgressController`
are **not** mounted. Prefer `DailyXpProgress` / `dailyXpService`.

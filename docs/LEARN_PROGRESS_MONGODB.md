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
| `lessonEngagement[]` | Per-lesson read gate, confidence, quiz attempts |

`lessonEngagement` shape:

```js
{
  lessonId: String,
  read: Boolean,
  confidence: String,      // e.g. review | almost | ready
  quizAttempts: Object,    // { [quizIndex]: selectedIndex }
  updatedAt: Date,
}
```

API (Bearer JWT required unless noted):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/learn/progress` | List my course progress (includes engagement) |
| GET | `/api/auth/learn/dashboard` | Learner dashboard overview + all courses |
| POST | `/api/auth/learn/progress/merge` | Upload browser local progress on login (incl. engagement) |
| GET | `/api/auth/learn/:courseId/progress` | Load one course |
| POST | `/api/auth/learn/:courseId/progress/complete` | Mark lesson complete |
| POST | `.../last-lesson`, `/code`, `/note`, `/bookmark`, `/time` | Other writes |
| POST | `/api/auth/learn/:courseId/progress/engagement` | Upsert one lesson’s read / confidence / quiz |
| GET | `/api/auth/username/:username/learn/progress` | Public read (no code/notes/engagement detail) |
| GET | `/api/auth/username/:username/learn/dashboard` | Public dashboard (no engagement counts) |

Legacy OOP C++ routes under `/api/auth/learn/oops-cpp/progress/*` still work and
read/write the same `CourseProgress` doc (`courseId: oops-cpp`), migrating from
the old `OopsCppProgress` collection on first touch.

Daily XP / activity heatmap remains in `DailyXpProgress` via
`/api/auth/progress/daily-xp*`.

Daily challenge submit requires auth; streak updates `User.currentStreak`.

### Dashboard overview fields

`GET /api/auth/learn/dashboard` returns:

- `overview.totalXp`, `dailyXpTotal`, `totalMinutesSpent`
- `coursesStarted` / `coursesCompleted`
- `bestStreak` / `activeStreak`
- `lessonsRead` / `quizAnswered` (own profile only; stripped on public route)
- `courses[]`: per-course XP, completed count, bookmarks, minutes, streak,
  last lesson, last active, plus engagement counts when private

Polycoder progress (`/api/auth/polycoder/...`) also loads **all** `CourseProgress`
rows into `courses` (keyed by `courseId`) with the same aggregate stats.

## Guests (localStorage)

Unsigned visitors still use localStorage keys from
`frontend/src/features/learn/shared/courseRegistry.js`.

Engagement keys (also merged on login):

- `{prefix}_read_{lessonId}`
- `{prefix}_confidence_{lessonId}`
- `{prefix}_quiz_attempts_{lessonId}`

On login/register/session restore, `mergeLearnProgressOnLogin` uploads completions,
code, notes, bookmarks, and engagement maps into Mongo, then
`isolateLearnProgressForUser` clears shared guest buckets.

## Frontend entry points

- `useCourseProgress` — shared hook used by every course progress hook
- `useLessonReadGate` / `useLessonQuizAttempts` — engagement → Mongo when signed in
- `mergeLearnProgressOnLogin` — called from `AuthContext` before isolating keys
- `useProfileLearnProgress` — profile featured track cards / certificates
- `useLearnDashboard` — profile stats row + all-courses list

## Still local-only (by design)

- Theme / IDE chrome / assistant dock position
- Lesson annotations (`polycode_annotations_*`) — deferred (large blobs)
- Language docs hub `UserProgress` API (exists on backend, unused by learn hooks)

## Deprecated backend path

`UserDailyProgress` + `dailyXpProgressService` + `dailyXpProgressController`
are **not** mounted. Prefer `DailyXpProgress` / `dailyXpService`.

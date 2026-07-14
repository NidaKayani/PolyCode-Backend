# Learn progress: MongoDB + localStorage

## Signed-in users (MongoDB)

Progress for every allowlisted course is stored in the `CourseProgress` collection
(`userId` + `courseId`).

API (Bearer JWT required unless noted):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/learn/progress` | List my course progress |
| POST | `/api/auth/learn/progress/merge` | Upload browser local progress on login |
| GET | `/api/auth/learn/:courseId/progress` | Load one course |
| POST | `/api/auth/learn/:courseId/progress/complete` | Mark lesson complete |
| POST | `.../last-lesson`, `/code`, `/note`, `/bookmark`, `/time` | Other writes |
| GET | `/api/auth/username/:username/learn/progress` | Public read (no saved code/notes) |

Legacy OOP C++ routes under `/api/auth/learn/oops-cpp/progress/*` still work and
read/write the same `CourseProgress` doc (`courseId: oops-cpp`), migrating from
the old `OopsCppProgress` collection on first touch.

Daily XP / activity heatmap remains in `DailyXpProgress` via
`/api/auth/progress/daily-xp*`.

Daily challenge submit requires auth; streak updates `User.currentStreak`.

## Guests (localStorage)

Unsigned visitors still use localStorage keys from
`frontend/src/features/learn/shared/courseRegistry.js`.
On login/register/session restore, `mergeLearnProgressOnLogin` uploads those
keys into Mongo, then `isolateLearnProgressForUser` clears shared guest buckets.

## Frontend entry points

- `useCourseProgress` — shared hook used by every course progress hook
- `mergeLearnProgressOnLogin` — called from `AuthContext` before isolating keys
- `useProfileLearnProgress` — profile certificates / track cards from Mongo

## Still local-only (by design)

- Theme / IDE chrome / assistant dock position
- Lesson annotations (`polycode_annotations_*`)
- Theory read gates / quiz attempt maps (`*_read_*`, `*_quiz_attempts_*`)
- Language docs hub `UserProgress` API (exists on backend, unused by learn hooks)

## Deprecated backend path

`UserDailyProgress` + `dailyXpProgressService` + `dailyXpProgressController`
are **not** mounted. Prefer `DailyXpProgress` / `dailyXpService`.

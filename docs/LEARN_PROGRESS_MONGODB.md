# Learn progress: single `learner_progress` collection

## Layout

Auth users stay in `users`. All learner data for a user lives in **one Mongo document**
in the collection `learner_progress` (model `LearnerProgress`).

```js
{
  userId: ObjectId,           // unique
  courses: [{
    courseId,
    completedLessons, savedCode, notes,
    lessonEngagement,         // read / confidence / quiz / challenge / lastTab
    bookmarks, lastLessonId,
    totalXp, totalMinutesSpent, currentStreak, lastActiveDate,
  }],
  dailyXp: { days: [...], totalXp },
  annotations: [{ courseId, lessonId, tab, strokes, labels, updatedAt }],
}
```

### Size limits

- Per-annotation payload: **100KB** (strokes may be downsampled).
- Whole learner document: **10MB** soft ceiling (Mongo hard limit is 16MB).

## API (unchanged shapes)

Bearer JWT required unless noted:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/learn/progress` | List my courses (embedded slice) |
| GET | `/api/auth/learn/dashboard` | Learner dashboard overview |
| POST | `/api/auth/learn/progress/merge` | Merge browser local progress on login |
| GET | `/api/auth/learn/:courseId/progress` | Load one course |
| POST | `.../complete`, `/last-lesson`, `/code`, `/note`, `/bookmark`, `/time`, `/engagement` | Course writes |
| GET/PUT | `/api/auth/learn/:courseId/annotations/:lessonId?tab=` | Private annotations |
| POST | `/api/auth/learn/annotations/merge` | Merge local annotations on login |
| GET | `/api/auth/username/:username/learn/progress` | Public courses (no code/notes) |
| GET | `/api/auth/username/:username/learn/dashboard` | Public dashboard (no engagement counts) |
| GET | `/api/auth/polycoder/:username/progress` | Full polycoder aggregate |
| GET/POST | `/api/auth/progress/daily-xp*` | Daily XP heatmap |

Legacy OOP aliases under `/api/auth/learn/oops-cpp/progress/*` still work.

## Guests (localStorage)

Unsigned visitors still use localStorage keys from
`frontend/src/features/learn/shared/courseRegistry.js`.
On login, `mergeLearnProgressOnLogin` uploads completions, engagement, and
annotations into the single learner document.

## Frontend entry points

- `useCourseProgress` — completions + time tracking
- `useLessonReadGate` / `useLessonQuizAttempts` — engagement
- `LessonAnnotator` — annotations
- `useLearnDashboard` / `useProfileLearnProgress` — profile UI

## Still local-only (by design)

- Theme / IDE chrome / FAB position / annotation color prefs
- Playground files + run history

## Clean database

Wipe the entire MongoDB database (all collections):

```bash
cd backend
npm run clean-db -- --yes
```

After wipe, register/login again. The app recreates `users` and `learner_progress`
on first use.

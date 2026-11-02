# tidboka

Fictional booking software for a physiotherapy clinic: a day calendar with a
column per staff member across the current week, a clients list and the
clinic's services. It is a demo product that [feedhack](https://feedhack.ai)
is shown on, so a visitor can ask for a change and see it built on these
pages.

Everything here is made up. The clinic, staff, clients, phone numbers and
prices are fictional, and any resemblance to a real business is accidental.
There is no backend: records live in memory and reset on reload.

## Run

```
npm ci
npm run dev -- --host --port 5173
```

The calendar is always the current week. Appointments carry
`data-appointment`, `data-client`, `data-service`, `data-date`, `data-start`,
`data-end`, `data-status`, `data-cancellations` and `data-no-shows`; the
calendar, staff columns (`column-<id>`), day picker, tables, sidebar and top
bar have ids, so a change built on the page has something stable to attach
to.

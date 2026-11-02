// tidboka's seed data: a physiotherapy clinic's staff, services, clients and
// this week's appointments. All of it is fictional. The week is the current
// one, so the calendar is always full and today always has gaps.

export function isoDate(d: Date) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

export const TODAY = isoDate(new Date());

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

// Monday of the current week; on a weekend, the coming week.
export const WEEK_START = (() => {
  const day = new Date(`${TODAY}T12:00:00`).getDay();
  return addDays(TODAY, day === 0 ? 1 : day === 6 ? 2 : 1 - day);
})();

export const WEEK_DAYS = [0, 1, 2, 3, 4].map((i) => addDays(WEEK_START, i));

// The day the calendar opens on: today on a weekday, Monday otherwise.
export const START_DAY = WEEK_DAYS.includes(TODAY) ? TODAY : WEEK_START;

export const OPEN_MIN = 8 * 60;
export const CLOSE_MIN = 17 * 60;

export function formatTime(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export function formatDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export type Staff = { id: string; name: string; role: string };

export const STAFF: Staff[] = [
  { id: "st1", name: "Hanna Lund", role: "Physiotherapist" },
  { id: "st2", name: "Omar Said", role: "Physiotherapist" },
  { id: "st3", name: "Klara Eriksson", role: "Massage therapist" },
  { id: "st4", name: "Leo Björk", role: "Naprapath" },
];

export type Service = { id: string; name: string; minutes: number; price: number };

export const SERVICES: Service[] = [
  { id: "sv1", name: "First assessment", minutes: 60, price: 950 },
  { id: "sv2", name: "Follow-up", minutes: 30, price: 650 },
  { id: "sv3", name: "Sports massage", minutes: 45, price: 790 },
  { id: "sv4", name: "Rehab session", minutes: 45, price: 720 },
  { id: "sv5", name: "Naprapathy", minutes: 45, price: 850 },
];

export type Client = { id: string; name: string; phone: string; email: string; visits: number; cancellations: number; noShows: number };

const CLIENTS_RAW: [string, number, number, number][] = [
  ["Agnes Holm", 12, 0, 0],
  ["Benjamin Ali", 3, 2, 1],
  ["Cecilia Strand", 8, 1, 0],
  ["Daniel Engström", 1, 0, 0],
  ["Elsa Grönlund", 15, 0, 1],
  ["Filip Andersson", 6, 3, 0],
  ["Greta Mattsson", 4, 0, 0],
  ["Hugo Norén", 9, 1, 2],
  ["Isabella Rossi", 2, 0, 0],
  ["Jakob Lindblom", 7, 0, 0],
  ["Kerstin Falk", 20, 1, 0],
  ["Lukas Wahlberg", 5, 2, 0],
  ["Mira Hedlund", 3, 0, 0],
  ["Noah Sjögren", 11, 0, 1],
  ["Olivia Berglund", 6, 0, 0],
  ["Rasmus Vik", 2, 1, 1],
  ["Selma Karlsson", 10, 0, 0],
  ["Theo Nilsson", 4, 0, 0],
  ["Ulrika Dahlberg", 13, 1, 0],
  ["Wilma Ekström", 1, 0, 0],
];

export const CLIENTS: Client[] = CLIENTS_RAW.map(([name, visits, cancellations, noShows], i) => {
  const [first, last] = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ");
  return {
    id: `cl${i + 1}`,
    name,
    phone: `07${(i * 3) % 10}-${String(200 + i * 41).slice(0, 3)} ${String(11 + i * 4).slice(0, 2)} ${String(30 + i * 3).slice(0, 2)}`,
    email: `${first}.${last}@mail.se`,
    visits,
    cancellations,
    noShows,
  };
});

export type Status = "booked" | "checked-in" | "done" | "cancelled" | "no-show";

export type Appointment = { id: string; staffId: string; clientId: string; serviceId: string; date: string; start: number; status: Status };

// Per staff member, per weekday: [start "HH:MM", service index, client index].
// Gaps of 30 minutes or more are left on purpose, today included.
const DAY_PLANS: [string, number, number][][] = [
  [["08:00", 0, 0], ["09:15", 1, 1], ["10:00", 3, 2], ["11:30", 1, 3], ["13:00", 0, 4], ["15:00", 3, 5]],
  [["08:30", 1, 6], ["09:00", 3, 7], ["10:30", 0, 8], ["13:00", 1, 9], ["14:00", 3, 10], ["15:30", 1, 11]],
  [["08:00", 2, 12], ["09:00", 2, 13], ["10:30", 2, 14], ["13:00", 2, 15], ["14:30", 2, 16]],
  [["09:00", 4, 17], ["10:00", 4, 18], ["11:00", 4, 19], ["13:30", 4, 1], ["15:00", 4, 5]],
];

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

export const APPOINTMENTS: Appointment[] = WEEK_DAYS.flatMap((date, d) =>
  STAFF.flatMap((staff, s) => {
    // Each day shifts the plan a little so the week does not repeat itself.
    const plan = DAY_PLANS[s].filter((_, k) => (k + d + s) % 6 !== 5);
    return plan.map(([start, service, client], k): Appointment => {
      const clientIndex = (client + d * 3) % CLIENTS.length;
      const past = date < TODAY || (date === TODAY && toMin(start) < 11 * 60);
      const flaky = CLIENTS[clientIndex].cancellations + CLIENTS[clientIndex].noShows >= 2;
      const status: Status =
        flaky && (k + d) % 3 === 0 ? (past ? "no-show" : "cancelled") : past ? "done" : date === TODAY && k === 2 ? "checked-in" : "booked";
      return {
        id: `ap${d}${s}${k}`,
        staffId: staff.id,
        clientId: CLIENTS[clientIndex].id,
        serviceId: SERVICES[service].id,
        date,
        start: toMin(start),
        status,
      };
    });
  }),
);

export const clientOf = (id: string) => CLIENTS.find((c) => c.id === id)!;
export const serviceOf = (id: string) => SERVICES.find((s) => s.id === id)!;

import { useState, type ReactNode } from "react";
import { cn } from "./lib/cn";
import {
  APPOINTMENTS,
  CLIENTS,
  CLOSE_MIN,
  OPEN_MIN,
  SERVICES,
  STAFF,
  START_DAY,
  TODAY,
  WEEK_DAYS,
  clientOf,
  formatDay,
  formatTime,
  serviceOf,
  type Appointment,
  type Status,
} from "./data";

// tidboka: fictional booking software for a clinic, the demo product feedhack
// is shown on. A day calendar with a column per staff member, clients and
// services, in in-memory state: no routing, no backend.

type Page = "calendar" | "clients" | "services";

export function App() {
  const [page, setPage] = useState<Page>("calendar");
  return (
    <div className="flex h-full bg-stone-50 text-[13px] text-stone-800">
      <Sidebar page={page} go={setPage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-auto">
          {page === "calendar" && <CalendarPage />}
          {page === "clients" && <ClientsPage />}
          {page === "services" && <ServicesPage />}
        </main>
      </div>
    </div>
  );
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4", className)}>
      <path d={d} />
    </svg>
  );
}

const NAV: { page: Page; label: string; icon: string }[] = [
  { page: "calendar", label: "Calendar", icon: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4" },
  { page: "clients", label: "Clients", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" },
  { page: "services", label: "Services", icon: "M4 7h16M4 12h16M4 17h10" },
];

function Sidebar({ page, go }: { page: Page; go: (page: Page) => void }) {
  return (
    <aside id="sidebar" className="flex w-52 shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="flex h-14 items-center gap-2 px-4">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-7 w-7" />
        <span className="text-[17px] font-bold tracking-tight text-stone-900">tidboka</span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 pt-2">
        {NAV.map((item) => (
          <button
            key={item.page}
            type="button"
            onClick={() => go(item.page)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-medium",
              page === item.page ? "bg-violet-50 text-violet-800" : "text-stone-600 hover:bg-stone-100",
            )}
          >
            <Icon d={item.icon} />
            {item.label}
          </button>
        ))}
        {["Payments", "Reports", "Settings"].map((label) => (
          <span key={label} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-stone-400">
            <Icon d="M6 12h12" />
            {label}
          </span>
        ))}
      </nav>
      <div className="mt-auto border-t border-stone-200 px-4 py-3 text-[12px] text-stone-500">Rörelse Fysio Södermalm</div>
    </aside>
  );
}

function Topbar() {
  return (
    <header id="topbar" className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6">
      <div className="flex h-8 w-80 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-2.5 text-stone-400">
        <Icon d="M11 18a7 7 0 100-14 7 7 0 000 14zm9 2l-4-4" />
        Search clients or bookings
      </div>
      <div className="flex items-center gap-3">
        <span className="text-stone-500">Front desk</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-700 text-[12px] font-semibold text-white">FD</span>
      </div>
    </header>
  );
}

function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-4">
      <h1 className="text-[20px] font-bold tracking-tight text-stone-900">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Button({ children, primary, onClick }: { children: ReactNode; primary?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-md px-3 font-medium",
        primary ? "bg-violet-700 text-white hover:bg-violet-800" : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
      )}
    >
      {children}
    </button>
  );
}

// Pixels per minute in the calendar grid.
const PX = 1.4;

const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  "checked-in": "Checked in",
  done: "Done",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

// Colour per service, used by appointment blocks and the legend above the calendar.
const SERVICE_COLOR: Record<string, { block: string; swatch: string }> = {
  sv1: { block: "border-violet-300 bg-violet-100 hover:border-violet-500", swatch: "border-violet-300 bg-violet-100" },
  sv2: { block: "border-sky-300 bg-sky-100 hover:border-sky-500", swatch: "border-sky-300 bg-sky-100" },
  sv3: { block: "border-emerald-300 bg-emerald-100 hover:border-emerald-500", swatch: "border-emerald-300 bg-emerald-100" },
  sv4: { block: "border-amber-300 bg-amber-100 hover:border-amber-500", swatch: "border-amber-300 bg-amber-100" },
  sv5: { block: "border-rose-300 bg-rose-100 hover:border-rose-500", swatch: "border-rose-300 bg-rose-100" },
};

function ServiceLegend() {
  return (
    <div id="service-legend" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-6 pb-3 text-[12px] text-stone-600">
      {SERVICES.map((s) => (
        <span key={s.id} data-service={s.name} className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded-sm border", SERVICE_COLOR[s.id]?.swatch ?? "border-stone-300 bg-stone-100")} />
          {s.name}
        </span>
      ))}
    </div>
  );
}

function CalendarPage() {
  const [day, setDay] = useState(START_DAY);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const appointments = APPOINTMENTS.filter((a) => a.date === day);
  const hours = Array.from({ length: (CLOSE_MIN - OPEN_MIN) / 60 }, (_, i) => OPEN_MIN + i * 60);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Calendar">
        <Button primary>New booking</Button>
      </PageHeader>
      <div id="day-picker" className="flex gap-1.5 px-6 pb-3">
        {WEEK_DAYS.map((d) => (
          <button
            key={d}
            type="button"
            data-date={d}
            onClick={() => setDay(d)}
            className={cn(
              "h-8 rounded-md border px-3 font-medium",
              d === day ? "border-violet-300 bg-violet-50 text-violet-800" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50",
            )}
          >
            {formatDay(d)}
            {d === TODAY && <span className="ml-1.5 text-[11px] text-violet-600">Today</span>}
          </button>
        ))}
      </div>
      <ServiceLegend />
      <div className="flex min-h-0 flex-1 gap-4 px-6 pb-6">
        <div id="calendar" data-date={day} className="min-h-0 flex-1 overflow-auto rounded-lg border border-stone-200 bg-white">
          <div className="sticky top-0 z-10 grid grid-cols-[56px_repeat(4,1fr)] border-b border-stone-200 bg-white">
            <div />
            {STAFF.map((s) => (
              <div key={s.id} className="border-l border-stone-100 px-3 py-2.5">
                <div className="font-semibold text-stone-900">{s.name}</div>
                <div className="text-[12px] text-stone-500">{s.role}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[56px_repeat(4,1fr)]" style={{ height: (CLOSE_MIN - OPEN_MIN) * PX }}>
            <div className="relative">
              {hours.map((h) => (
                <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] text-stone-400" style={{ top: (h - OPEN_MIN) * PX }}>
                  {h === OPEN_MIN ? "" : formatTime(h)}
                </span>
              ))}
            </div>
            {STAFF.map((staff) => (
              <div key={staff.id} id={`column-${staff.id}`} data-staff={staff.name} className="staff-column relative border-l border-stone-100">
                {hours.map((h) => (
                  <div key={h} className="absolute inset-x-0 border-t border-stone-100" style={{ top: (h - OPEN_MIN) * PX }} />
                ))}
                {appointments
                  .filter((a) => a.staffId === staff.id)
                  .map((a) => (
                    <AppointmentBlock key={a.id} appointment={a} onClick={() => setSelected(a)} />
                  ))}
              </div>
            ))}
          </div>
        </div>
        {selected && <AppointmentPanel appointment={selected} close={() => setSelected(null)} />}
      </div>
    </div>
  );
}

function AppointmentBlock({ appointment: a, onClick }: { appointment: Appointment; onClick: () => void }) {
  const service = serviceOf(a.serviceId);
  const client = clientOf(a.clientId);
  const off = a.status === "cancelled" || a.status === "no-show";
  return (
    <button
      type="button"
      onClick={onClick}
      data-appointment={a.id}
      data-client={client.name}
      data-client-id={client.id}
      data-service={service.name}
      data-date={a.date}
      data-start={formatTime(a.start)}
      data-end={formatTime(a.start + service.minutes)}
      data-status={a.status}
      data-cancellations={client.cancellations}
      data-no-shows={client.noShows}
      className={cn(
        "appointment absolute inset-x-1 flex flex-col overflow-hidden rounded-md border px-2 py-1 text-left",
        off
          ? "border-stone-200 bg-stone-50 text-stone-400 line-through"
          : cn("text-stone-800", SERVICE_COLOR[service.id]?.block ?? "border-violet-200 bg-violet-50 hover:border-violet-400"),
      )}
      style={{ top: (a.start - OPEN_MIN) * PX + 1, height: service.minutes * PX - 2 }}
    >
      <span className="truncate font-semibold">{client.name}</span>
      <span className="truncate text-[11px] opacity-80">
        {formatTime(a.start)}–{formatTime(a.start + service.minutes)} · {service.name}
      </span>
    </button>
  );
}

function AppointmentPanel({ appointment: a, close }: { appointment: Appointment; close: () => void }) {
  const service = serviceOf(a.serviceId);
  const client = clientOf(a.clientId);
  const staff = STAFF.find((s) => s.id === a.staffId)!;
  return (
    <aside id="appointment-panel" className="flex w-72 shrink-0 flex-col gap-4 rounded-lg border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[16px] font-semibold text-stone-900">{client.name}</div>
          <div className="text-stone-500">{service.name}</div>
        </div>
        <button type="button" onClick={close} className="text-stone-400 hover:text-stone-700" aria-label="Close">
          ✕
        </button>
      </div>
      <dl className="grid grid-cols-[80px_1fr] gap-y-2">
        <dt className="text-stone-500">When</dt>
        <dd>
          {formatDay(a.date)}, {formatTime(a.start)}–{formatTime(a.start + service.minutes)}
        </dd>
        <dt className="text-stone-500">With</dt>
        <dd>{staff.name}</dd>
        <dt className="text-stone-500">Status</dt>
        <dd>{STATUS_LABEL[a.status]}</dd>
        <dt className="text-stone-500">Price</dt>
        <dd>{service.price} kr</dd>
        <dt className="text-stone-500">Phone</dt>
        <dd className="tabular-nums">{client.phone}</dd>
      </dl>
      <div className="mt-auto flex gap-2">
        <Button primary>Check in</Button>
        <Button>Reschedule</Button>
      </div>
    </aside>
  );
}

function Table({ id, head, children }: { id: string; head: string[]; children: ReactNode }) {
  return (
    <div className="px-6 pb-6">
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table id={id} className="w-full text-left">
          <thead className="border-b border-stone-200 bg-stone-50 text-[12px] text-stone-500">
            <tr>
              {head.map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function ClientsPage() {
  return (
    <div>
      <PageHeader title="Clients">
        <Button primary>Add client</Button>
      </PageHeader>
      <Table id="clients-table" head={["Name", "Phone", "Email", "Visits", "Cancellations", "No-shows"]}>
        {CLIENTS.map((c) => (
          <tr
            key={c.id}
            data-client={c.name}
            data-client-id={c.id}
            data-cancellations={c.cancellations}
            data-no-shows={c.noShows}
            className="border-b border-stone-100 last:border-0"
          >
            <td className="px-4 py-2.5 font-medium text-stone-900">{c.name}</td>
            <td className="px-4 py-2.5 tabular-nums">{c.phone}</td>
            <td className="px-4 py-2.5 text-violet-700">{c.email}</td>
            <td className="px-4 py-2.5 tabular-nums">{c.visits}</td>
            <td className="px-4 py-2.5 tabular-nums">{c.cancellations}</td>
            <td className="px-4 py-2.5 tabular-nums">{c.noShows}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function ServicesPage() {
  return (
    <div>
      <PageHeader title="Services">
        <Button primary>Add service</Button>
      </PageHeader>
      <Table id="services-table" head={["Service", "Length", "Price"]}>
        {SERVICES.map((s) => (
          <tr key={s.id} data-service={s.name} className="border-b border-stone-100 last:border-0">
            <td className="px-4 py-2.5 font-medium text-stone-900">{s.name}</td>
            <td className="px-4 py-2.5">{s.minutes} min</td>
            <td className="px-4 py-2.5 tabular-nums">{s.price} kr</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

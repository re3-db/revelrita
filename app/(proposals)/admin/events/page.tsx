import type { Metadata } from "next";
import EventLog from "@/components/events/EventLog";
import { requireAdmin } from "@/lib/admin-auth";
import { listEvents } from "@/lib/event-store";
import { todayInCardiff, type LoggedEvent } from "@/lib/events";
import { storeConfigured } from "@/lib/redis";

export const metadata: Metadata = { title: "Revelrita event log" };

export default async function EventsPage() {
  await requireAdmin("/admin/events");

  let events: LoggedEvent[] = [];
  let failed = false;
  if (storeConfigured()) {
    try {
      events = await listEvents();
    } catch (error) {
      console.error(error);
      failed = true;
    }
  }
  return <EventLog initialEvents={events} today={todayInCardiff()} configured={storeConfigured()} failed={failed} />;
}

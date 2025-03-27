'use client'
import { Toaster } from 'sonner';
import EventsPage from "@/app/EventPage";


export default function Home() {
  return (
      <>
        <EventsPage />
        <Toaster richColors position="top-right" />
      </>
  );
}

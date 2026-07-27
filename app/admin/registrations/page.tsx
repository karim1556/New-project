import { Section } from "@/components/section";
import { readDb } from "@/lib/db";
import { RegistrationsClient } from "./registrations-client";

export default async function AdminRegistrationsPage() {
  const db = await readDb();
  const registrations = db.clubRegistrations ?? [];

  return (
    <>
      <Section
        title="Hackathon Club 2026 Registrations"
        subtitle={`Total Registered Candidates: ${registrations.length}`}
      >
        <RegistrationsClient initialRegistrations={registrations} />
      </Section>
    </>
  );
}

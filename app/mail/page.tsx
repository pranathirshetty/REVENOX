import { Suspense } from "react";
import MailClient from "./MailClient";

export default function MailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--text-secondary)" }}>
          Loading…
        </div>
      }
    >
      <MailClient />
    </Suspense>
  );
}

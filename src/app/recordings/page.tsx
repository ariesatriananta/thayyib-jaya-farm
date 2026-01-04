import { Suspense } from "react";
import RecordingsClient from "./RecordingsClient";

export default function RecordingsPage() {
  return (
    <Suspense>
      <RecordingsClient />
    </Suspense>
  );
}

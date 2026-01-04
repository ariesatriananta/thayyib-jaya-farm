import { Suspense } from "react";
import RecordingsClient from "./RecordingsClient";
import Loading from "./loading";

export default function RecordingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RecordingsClient />
    </Suspense>
  );
}

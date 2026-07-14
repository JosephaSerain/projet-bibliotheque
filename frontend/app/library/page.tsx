import { Suspense } from "react";
import { LibraryPage } from "./LibraryPage";

export default function LibraryRoute() {
  return (
    <Suspense>
      <LibraryPage />
    </Suspense>
  );
}
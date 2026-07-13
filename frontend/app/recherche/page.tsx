import { Suspense } from "react";
import { SearchPage } from "./SearchPage";

export default function RecherchePage() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
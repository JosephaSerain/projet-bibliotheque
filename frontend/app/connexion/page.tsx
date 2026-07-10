import { Suspense } from "react";
import { AuthTabs } from "./AuthTabs";

export default function ConnexionPage() {
  return (
    <Suspense>
      <AuthTabs />
    </Suspense>
  );
}
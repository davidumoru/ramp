import { Suspense } from "react";
import { ProjectionCanvas } from "@/components/ProjectionCanvas";

export default function Home() {
  return (
    <Suspense>
      <ProjectionCanvas />
    </Suspense>
  );
}

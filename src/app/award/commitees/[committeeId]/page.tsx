// app/committees/[committeeId]/page.tsx
import { use } from "react";
import { notFound } from "next/navigation";

interface Params {
  params: {
    committeeId: string;
  };
}

export default function CommitteePage({ params }: Params) {
  const { committeeId } = params;



  return (
    <div>
      <h1>Committee ID: {committeeId}</h1>
    </div>
  );
}

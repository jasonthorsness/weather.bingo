import { notFound } from "next/navigation";
import ResolvedAddress from "components/resolvedAddress";

import { getName } from "app/e/getName";

export const runtime = "nodejs";
export const dynamic = "force-static";

async function getNameFromParams(lk: string) {
  let name = "";
  try {
    name = await getName(parseInt(lk));
  } catch {
    notFound();
  }
  return name;
}

export default async function Layout({
  children,
  params: { lk },
}: Readonly<{
  children: React.ReactNode;
  params: { lk: string };
}>) {
  const name = await getNameFromParams(lk);
  return (
    <div className="flex flex-col">
      <div className="pb-2">
        <div className="pb-2 px-2">
          <ResolvedAddress name={name} />
        </div>
      </div>
      {children}
    </div>
  );
}

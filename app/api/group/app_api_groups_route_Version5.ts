import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Group = {
  id: string;
  name: string;
  emoji: string;
  members: number;
  color: string;
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "groups.json");

async function readGroups(): Promise<Group[]> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [
      { id: "demo-1", name: "Apartment 4B", emoji: "🏡", members: 4, color: "bg-violet-100" },
      { id: "demo-2", name: "Goa getaway", emoji: "🌴", members: 6, color: "bg-orange-100" },
      { id: "demo-3", name: "House groceries", emoji: "🥑", members: 3, color: "bg-emerald-100" },
    ];
  }
}

export async function GET() {
  const groups = await readGroups();
  return Response.json({ ok: true, groups });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.name !== "string") {
    return Response.json({ error: "Group name is required." }, { status: 400 });
  }

  const name = body.name.trim();
  if (!name) {
    return Response.json({ error: "Group name is required." }, { status: 400 });
  }

  const groups = await readGroups();
  const newGroup: Group = {
    id: crypto.randomUUID(),
    name,
    emoji: typeof body.emoji === "string" && body.emoji ? body.emoji : "🏠",
    members: typeof body.members === "number" ? body.members : 1,
    color: typeof body.color === "string" ? body.color : "bg-violet-100",
  };

  groups.unshift(newGroup);

  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(groups, null, 2), "utf8");

  return Response.json({ ok: true, group: newGroup }, { status: 201 });
}
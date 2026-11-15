import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Expense = {
  id: string;
  description: string;
  amount: number;
  group: string;
  paidBy: string;
  date: string;
  splitAmong: string[];
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "expenses.json");

async function readExpenses(): Promise<Expense[]> {
  try {
    const contents = await readFile(dataFile, "utf8");
    const parsed: unknown = JSON.parse(contents);
    return Array.isArray(parsed) ? (parsed as Expense[]) : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const expenses = await readExpenses();
  return Response.json({ ok: true, expenses });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request must contain valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Enter an expense description and amount." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const amount = Number(input.amount);
  const group = typeof input.group === "string" && input.group.trim() ? input.group.trim() : "Apartment 4B";
  const paidBy = typeof input.paidBy === "string" && input.paidBy.trim() ? input.paidBy.trim() : "You";
  const date = typeof input.date === "string" && input.date ? input.date : new Date().toISOString().slice(0, 10);

  const splitAmong = Array.isArray(input.splitAmong)
    ? input.splitAmong.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    return Response.json(
      { error: "Enter a valid description and amount greater than zero." },
      { status: 400 }
    );
  }

  const expense: Expense = {
    id: crypto.randomUUID(),
    description,
    amount,
    group,
    paidBy,
    date,
    splitAmong: splitAmong.length > 0 ? splitAmong : [paidBy],
    createdAt: new Date().toISOString(),
  };

  const expenses = await readExpenses();
  expenses.unshift(expense);

  try {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, JSON.stringify(expenses, null, 2), "utf8");
  } catch {
    return Response.json({ error: "Could not save the expense." }, { status: 500 });
  }

  return Response.json({ ok: true, expense }, { status: 201 });
}
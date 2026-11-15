"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Home,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  Wallet,
  X,
} from "lucide-react";

type Roommate = { name: string; email: string };
type Profile = {
  name: string;
  email: string;
  household: string;
  currency: string;
  openingBalance: number;
  monthlyTarget: number;
  monthlyTargets: Record<string, number>;
  roommates: Roommate[];
};
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
type Group = {
  id?: string;
  name: string;
  emoji: string;
  members: number;
  spent?: string;
  color: string;
};

const defaultGroups: Group[] = [
  { name: "Apartment 4B", emoji: "🏡", members: 4, spent: "₹18,450", color: "bg-violet-100" },
  { name: "Goa getaway", emoji: "🌴", members: 6, spent: "₹32,800", color: "bg-orange-100" },
  { name: "House groceries", emoji: "🥑", members: 3, spent: "₹6,240", color: "bg-emerald-100" },
];

const EXTRA_EXPENSES_KEY = "nestmate-expense-details";
const PROFILE_KEY = "nestmate-profile";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  return new Date(`${key}-01T12:00:00`).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
}

function money(value: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toLocaleString("en-IN")}`;
  }
}

function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ring-2 ring-white ${className}`}>
      {initials}
    </div>
  );
}

function readExtraExpenses(): Expense[] {
  try {
    const value = localStorage.getItem(EXTRA_EXPENSES_KEY);
    return value ? (JSON.parse(value) as Expense[]) : [];
  } catch {
    return [];
  }
}

function mergeExpenseDetails(apiExpenses: Expense[], localExpenses: Expense[]) {
  const details = new Map(localExpenses.map((expense) => [expense.id, expense]));
  return apiExpenses.map((expense) => {
    const saved = details.get(expense.id);
    return saved ? { ...expense, ...saved } : expense;
  });
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<Group[]>(defaultGroups);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [query, setQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()));
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseGroup, setExpenseGroup] = useState(defaultGroups[0].name);
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [targetInput, setTargetInput] = useState("");

  function notify(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  }

  const members = useMemo(() => {
    if (!profile) return [{ name: "You", email: "" }];
    return [
      { name: profile.name, email: profile.email },
      ...profile.roommates.filter((person) => person.name.trim()),
    ];
  }, [profile]);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        const saved = JSON.parse(savedProfile) as Partial<Profile>;
        setProfile({
          name: saved.name ?? "",
          email: saved.email ?? "",
          household: saved.household ?? "",
          currency: saved.currency ?? "INR",
          openingBalance: Number(saved.openingBalance ?? 0),
          monthlyTarget: Number(saved.monthlyTarget ?? 0),
          monthlyTargets: saved.monthlyTargets ?? {},
          roommates: Array.isArray(saved.roommates) ? saved.roommates : [],
        });
      } else {
        setSetupOpen(true);
      }
    } catch {
      localStorage.removeItem(PROFILE_KEY);
      setSetupOpen(true);
    }

    fetch("/api/groups", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && Array.isArray(data.groups) && data.groups.length > 0) {
          setGroups(data.groups);
        }
      })
      .catch(() => {});

    fetch("/api/expenses", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && Array.isArray(data.expenses)) {
          setExpenses(mergeExpenseDetails(data.expenses, readExtraExpenses()));
        }
      })
      .catch(() => notify("Could not load expenses."));
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (!profile.monthlyTargets?.[selectedMonth]) {
      setTargetInput(String(profile.monthlyTarget || ""));
      setTargetOpen(true);
    }
  }, [profile, selectedMonth]);

  useEffect(() => {
    if (!members.length) return;
    setPaidBy((current) => current || members[0].name);
    setSplitAmong((current) => current.length ? current : members.map((member) => member.name));
  }, [members]);

  const monthlyTarget = Number(
    profile?.monthlyTargets?.[selectedMonth] ?? profile?.monthlyTarget ?? 0
  );

  const monthExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const date = expense.date || expense.createdAt;
        return date && monthKey(new Date(date)) === selectedMonth;
      }),
    [expenses, selectedMonth]
  );

  const totalSpent = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const targetPercent = monthlyTarget > 0 ? Math.min(100, (totalSpent / monthlyTarget) * 100) : 0;

  const memberTotals = useMemo(
    () =>
      members.map((member) => {
        let paid = 0;
        let share = 0;
        monthExpenses.forEach((expense) => {
          if (expense.paidBy === member.name) paid += Number(expense.amount);
          const split = expense.splitAmong?.length
            ? expense.splitAmong
            : members.map((person) => person.name);
          if (split.includes(member.name)) share += Number(expense.amount) / split.length;
        });
        return { ...member, paid, share };
      }),
    [members, monthExpenses]
  );

  const monthOptions = useMemo(() => {
    const result = new Set<string>();
    for (let offset = 0; offset < 12; offset++) {
      result.add(monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - offset, 1)));
    }
    expenses.forEach((expense) => {
      const date = expense.date || expense.createdAt;
      if (date) result.add(monthKey(new Date(date)));
    });
    return Array.from(result).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const visibleExpenses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return monthExpenses.filter((expense) => {
      const matchesSearch =
        !search ||
        expense.description.toLowerCase().includes(search) ||
        expense.group.toLowerCase().includes(search) ||
        (expense.paidBy || "").toLowerCase().includes(search);
      const matchesGroup = !selectedGroup || expense.group === selectedGroup;
      const matchesPerson =
        !selectedPerson ||
        expense.paidBy === selectedPerson ||
        expense.splitAmong?.includes(selectedPerson);
      return matchesSearch && matchesGroup && matchesPerson;
    });
  }, [monthExpenses, query, selectedGroup, selectedPerson]);

  const chartData = useMemo(() => {
    const values = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - 5 + index, 1);
      const key = monthKey(date);
      const total = expenses
        .filter((expense) => monthKey(new Date(expense.date || expense.createdAt)) === key)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      return { label: date.toLocaleString("en", { month: "short" }), total };
    });
    const maximum = Math.max(...values.map((item) => item.total), 1);
    return values.map((item) => ({
      ...item,
      height: `${Math.max(8, (item.total / maximum) * 100)}%`,
    }));
  }, [expenses]);

  async function refreshExpenses() {
    try {
      const response = await fetch("/api/expenses", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && Array.isArray(data.expenses)) {
        setExpenses(mergeExpenseDetails(data.expenses, readExtraExpenses()));
      }
    } catch {
      notify("Could not refresh expenses.");
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const household = String(form.get("household") ?? "").trim();
    const roommatesText = String(form.get("roommates") ?? "").trim();
    const roommates = roommatesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(.*?)\s*<([^>]+)>$/);
        return match
          ? { name: match[1].trim(), email: match[2].trim() }
          : { name: line, email: "" };
      })
      .filter((person) => person.name);

    if (!name || !email || !household) {
      notify("Enter your name, email, and household.");
      return;
    }

    const target = Number(form.get("monthlyTarget") || 0);
    if (target <= 0) {
      notify("Enter a monthly target greater than zero.");
      return;
    }

    const profileData: Profile = {
      name,
      email,
      household,
      currency: String(form.get("currency") ?? "INR"),
      openingBalance: Number(form.get("openingBalance") || 0),
      monthlyTarget: target,
      monthlyTargets: { [monthKey(new Date())]: target },
      roommates,
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
    setProfile(profileData);
    setPaidBy(name);
    setSplitAmong([name, ...roommates.map((person) => person.name)]);
    setSetupOpen(false);
    setProfileOpen(false);
    notify("Profile saved in this browser.");
  }

  function saveTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const value = Number(targetInput);
    if (!Number.isFinite(value) || value <= 0) {
      notify("Enter a target greater than zero.");
      return;
    }
    const updated: Profile = {
      ...profile,
      monthlyTarget: value,
      monthlyTargets: { ...profile.monthlyTargets, [selectedMonth]: value },
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setProfile(updated);
    setTargetOpen(false);
    notify(`Monthly target saved for ${monthLabel(selectedMonth)}.`);
  }

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const details: Expense = {
        id: crypto.randomUUID(),
        description: description.trim(),
        amount: Number(amount),
        group: expenseGroup,
        paidBy,
        date: expenseDate,
        splitAmong: splitAmong.length ? splitAmong : [paidBy],
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: details.description,
          amount: details.amount,
          group: details.group,
          paidBy: details.paidBy,
          date: details.date,
          splitAmong: details.splitAmong,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        notify(data.error ?? "Could not save expense.");
        return;
      }

      const saved: Expense = { ...details, id: data.expense?.id ?? details.id };
      const extra = readExtraExpenses().filter((item) => item.id !== saved.id);
      localStorage.setItem(EXTRA_EXPENSES_KEY, JSON.stringify([saved, ...extra]));
      setExpenses((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setDescription("");
      setAmount("");
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setExpenseOpen(false);
      notify("Expense saved.");
    } catch {
      notify("Could not connect to the expenses API.");
    } finally {
      setSaving(false);
    }
  }

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const emoji = String(form.get("emoji") ?? "🏠").trim() || "🏠";
    if (!name) return;

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, members: members.length, color: "bg-violet-100" }),
      });
      const data = await response.json();
      if (!response.ok) {
        notify(data.error ?? "Could not create group.");
        return;
      }
      setGroups((current) => [data.group, ...current]);
      setExpenseGroup(name);
      setSelectedGroup("");
      setGroupOpen(false);
      notify("Group created.");
    } catch {
      notify("Could not connect to the groups API.");
    }
  }

  const currency = profile?.currency || "INR";

  return (
    <main className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#f7f8fc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <div className="mx-auto flex min-h-screen max-w-[1440px]">
          <aside className="hidden w-[245px] shrink-0 border-r border-slate-200/70 bg-white/80 px-5 py-7 dark:border-slate-800 dark:bg-slate-900/80 lg:flex lg:flex-col">
            <a href="/" className="mb-10 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-200"><Wallet size={20} /></div>
              <div>
                <div className="text-[17px] font-extrabold tracking-tight">nest<span className="text-violet-600">mate</span></div>
                <div className="text-[11px] text-slate-400">Roommates, in sync.</div>
              </div>
            </a>

            <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
            <nav className="space-y-1">
              {[
                { label: "Overview", icon: Home, id: "" },
                { label: "My groups", icon: Users, id: "groups" },
                { label: "Expenses", icon: Wallet, id: "expenses" },
              ].map(({ label, icon: Icon, id }) => (
                <button key={label} onClick={() => {
                  setActiveTab(label);
                  if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                  else window.scrollTo({ top: 0, behavior: "smooth" });
                }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${activeTab === label ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
                  <Icon size={18} /> {label}
                  {label === "My groups" && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">{groups.length}</span>}
                </button>
              ))}
            </nav>

            <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Your spaces</div>
            <div className="space-y-1">
              {groups.map((item) => (
                <button key={item.id ?? item.name} onClick={() => {
                  setSelectedGroup(item.name);
                  document.getElementById("expenses")?.scrollIntoView({ behavior: "smooth" });
                }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                  <span className={`grid h-8 w-8 place-items-center rounded-xl text-base ${item.color}`}>{item.emoji}</span>
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Sparkles size={16} /> Monthly target</div>
              <p className="text-xs leading-5 text-violet-100">{money(monthlyTarget, currency)}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${targetPercent}%` }} />
              </div>
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-[#f7f8fc]/90 px-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white"><Wallet size={18} /></div>
                <span className="font-extrabold">nest<span className="text-violet-600">mate</span></span>
              </div>

              <div className="relative hidden w-full max-w-sm sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search expenses, groups..." aria-label="Search expenses and groups" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-violet-950" />
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => setDarkMode((value) => !value)} aria-label="Toggle dark mode" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-800"><Sun size={18} /></button>
                <div className="relative">
                  <button onClick={() => setNotificationsOpen((value) => !value)} aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-800"><Bell size={18} /></button>
                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      <p className="font-bold">Monthly target</p>
                      <p className="mt-2 text-xs text-slate-500">{monthLabel(selectedMonth)}: {money(monthlyTarget, currency)}</p>
                      <button onClick={() => { setNotificationsOpen(false); setTargetInput(String(monthlyTarget || "")); setTargetOpen(true); }} className="mt-3 text-xs font-bold text-violet-600">Update target</button>
                    </div>
                  )}
                </div>
                <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                <div className="relative">
                  <button onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-white dark:hover:bg-slate-800">
                    <Avatar initials={profile?.name ? profile.name.slice(0, 2).toUpperCase() : "KS"} className="bg-violet-100 text-violet-700" />
                    <span className="hidden text-sm font-semibold sm:block">{profile?.name || "Profile"}</span>
                    <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      <p className="px-3 py-2 text-xs text-slate-500">{profile?.email || "Profile setup"}</p>
                      <button onClick={() => { setProfileOpen(false); setSetupOpen(true); }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800">{profile ? "Edit profile" : "First-time setup"}</button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 lg:pb-10">
              {message && <div role="status" className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200">{message}</div>}

              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-500">Your shared spending</p>
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-[34px]">Hey {profile?.name || "there"} <span>👋</span></h1>
                  <p className="mt-1 text-sm text-slate-500">{profile?.household || "Set up your profile to get started."}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                    <CalendarDays size={16} className="text-violet-600" />
                    <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="bg-transparent text-sm font-semibold outline-none">
                      {monthOptions.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}
                    </select>
                  </label>
                  <button onClick={() => setExpenseOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 dark:shadow-none"><Plus size={18} /> Add expense</button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 p-5 text-white shadow-lg shadow-violet-200/60 dark:shadow-none">
                  <div className="absolute -right-7 -top-10 h-36 w-36 rounded-full border-[22px] border-white/10" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-violet-100">Monthly target · {monthLabel(selectedMonth)}</p>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight">{money(monthlyTarget, currency)}</p>
                      <p className="mt-2 text-xs text-violet-100">Spent {money(totalSpent, currency)}</p>
                    </div>
                    <div className="rounded-xl bg-white/15 p-2.5"><Wallet size={20} /></div>
                  </div>
                  <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${targetPercent}%` }} /></div>
                  <button onClick={() => { setTargetInput(String(monthlyTarget || "")); setTargetOpen(true); }} className="relative mt-3 text-xs font-semibold text-white/90">Update target <ArrowRight size={14} className="ml-1 inline" /></button>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm font-medium text-slate-500">Total expenses · {monthLabel(selectedMonth)}</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{money(totalSpent, currency)}</p>
                  <p className="mt-2 text-xs text-slate-400">{monthExpenses.length} expense{monthExpenses.length === 1 ? "" : "s"} recorded</p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm font-medium text-slate-500">Opening balance</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{money(profile?.openingBalance ?? 0, currency)}</p>
                  <p className="mt-2 text-xs text-slate-400">Entered manually in profile setup</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <h2 className="font-bold">Spending overview</h2>
                  <p className="mt-1 text-xs text-slate-400">Your group expenses over the last 6 months</p>
                  <div className="relative mt-7 flex h-48 items-end justify-around border-b border-slate-100 px-3 dark:border-slate-800">
                    {chartData.map((item, index) => (
                      <div key={item.label} className="flex h-full w-[10%] flex-col items-center justify-end">
                        <span className="mb-2 text-[10px] text-slate-400">{item.total ? money(item.total, currency) : ""}</span>
                        <div style={{ height: item.height }} className={`w-full rounded-t-lg ${index === 5 ? "bg-gradient-to-t from-violet-600 to-fuchsia-400" : "bg-violet-100 dark:bg-violet-500/20"}`} />
                        <span className="mt-2 text-[11px] text-slate-400">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400"><span className="h-2 w-2 rounded-full bg-violet-500" /> Monthly expense history</div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <h2 className="font-bold">Individual totals</h2>
                  <p className="mt-1 text-xs text-slate-400">{monthLabel(selectedMonth)} · paid and share</p>
                  <div className="mt-4 space-y-3">
                    {memberTotals.map((member) => (
                      <button key={`${member.name}-${member.email}`} onClick={() => { setSelectedPerson(selectedPerson === member.name ? "" : member.name); document.getElementById("expenses")?.scrollIntoView({ behavior: "smooth" }); }} className="w-full rounded-xl bg-slate-50 p-3 text-left transition hover:bg-violet-50 dark:bg-slate-800/60 dark:hover:bg-violet-500/10">
                        <div className="flex items-center gap-3">
                          <Avatar initials={member.name.slice(0, 2).toUpperCase()} className="bg-violet-100 text-violet-700" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">{member.name}</p>
                            <p className="truncate text-[11px] text-slate-400">{member.email || "No email provided"}</p>
                          </div>
                          <Users size={16} className="text-violet-600" />
                        </div>
                        <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                          <span>Paid: {money(member.paid, currency)}</span>
                          <span>Share: {money(member.share, currency)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div id="groups" className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div><h2 className="text-lg font-extrabold tracking-tight">Your groups</h2><p className="mt-1 text-xs text-slate-400">All the people and plans you share</p></div>
                  <button onClick={() => setGroupOpen(true)} className="text-xs font-bold text-violet-600">Create group <Plus size={13} className="ml-1 inline" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {groups.map((item) => {
                    const groupTotal = monthExpenses.filter((expense) => expense.group === item.name).reduce((sum, expense) => sum + expense.amount, 0);
                    return (
                      <button key={item.id ?? item.name} onClick={() => { setSelectedGroup(item.name); document.getElementById("expenses")?.scrollIntoView({ behavior: "smooth" }); }} className="group rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between"><span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${item.color}`}>{item.emoji}</span><ArrowRight size={14} className="text-violet-600" /></div>
                        <h3 className="mt-4 font-bold">{item.name}</h3>
                        <p className="mt-1 text-xs text-slate-400">{item.members} members · {money(groupTotal, currency)} this month</p>
                      </button>
                    );
                  })}
                  <button onClick={() => setGroupOpen(true)} className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 text-slate-400 hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900/40">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"><Plus size={19} /></span>
                    <span className="mt-2 text-sm font-bold">Create a group</span><span className="mt-1 text-[11px]">Bring your people together</span>
                  </button>
                </div>
              </div>

              <div id="expenses" className="mt-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="text-lg font-extrabold tracking-tight">{selectedGroup || "Recent expenses"}</h2><p className="mt-1 text-xs text-slate-400">{monthLabel(selectedMonth)} · individual records and shares</p></div>
                  <div className="flex items-center gap-2">
                    <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                      <option value="">All roommates</option>
                      {members.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
                    </select>
                    {selectedGroup && <button onClick={() => setSelectedGroup("")} className="text-xs font-bold text-violet-600">Clear group</button>}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {visibleExpenses.length ? visibleExpenses.map((expense) => {
                    const split = expense.splitAmong?.length ? expense.splitAmong : members.map((member) => member.name);
                    const share = expense.amount / Math.max(split.length, 1);
                    return (
                      <div key={expense.id} className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{expense.description}</p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {expense.paidBy || "Not specified"} paid · {expense.group} · {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {split.map((person) => <span key={person} className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{person}: {money(share, currency)}</span>)}
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-extrabold">{money(expense.amount, currency)}</span>
                      </div>
                    );
                  }) : <div className="py-5 text-center text-xs text-slate-400">{query ? "No matching expenses." : "No expenses saved for this month."}</div>}
                  <button onClick={() => void refreshExpenses()} className="mt-2 w-full rounded-lg py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-violet-600 dark:hover:bg-slate-800">Refresh expenses</button>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-500/20 dark:bg-violet-500/5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-violet-600 dark:bg-slate-800"><CircleHelp size={18} /></div>
                <div className="flex-1"><p className="text-xs font-bold">Need a hand?</p><p className="mt-0.5 text-[11px] text-slate-500">Profile and roommate details can be edited from your profile menu.</p></div>
                <button aria-label="Edit profile" onClick={() => setSetupOpen(true)}><Settings size={16} className="text-slate-400" /></button>
              </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-slate-200 bg-white/95 px-5 py-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
              <button onClick={() => { setActiveTab("Overview"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex flex-col items-center gap-1 p-2 text-violet-600"><Home size={19} /><span className="text-[10px] font-semibold">Home</span></button>
              <button onClick={() => { setActiveTab("My groups"); document.getElementById("groups")?.scrollIntoView({ behavior: "smooth" }); }} className="flex flex-col items-center gap-1 p-2 text-slate-400"><Users size={19} /><span className="text-[10px] font-semibold">Groups</span></button>
              <button onClick={() => setExpenseOpen(true)} aria-label="Add expense" className="-mt-7 grid h-14 w-14 place-items-center rounded-2xl border-4 border-[#f7f8fc] bg-violet-600 text-white shadow-lg dark:border-slate-950"><Plus size={24} /></button>
              <button onClick={() => document.getElementById("expenses")?.scrollIntoView({ behavior: "smooth" })} className="flex flex-col items-center gap-1 p-2 text-slate-400"><Wallet size={19} /><span className="text-[10px] font-semibold">Expenses</span></button>
              <button onClick={() => setSetupOpen(true)} className="flex flex-col items-center gap-1 p-2 text-slate-400"><Settings size={19} /><span className="text-[10px] font-semibold">Profile</span></button>
            </nav>
          </section>
        </div>

        {expenseOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpenseOpen(false); }}>
            <form onSubmit={addExpense} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Add an expense</h2><p className="mt-1 text-xs text-slate-500">Select who paid and who shares it.</p></div><button type="button" aria-label="Close" onClick={() => setExpenseOpen(false)}><X size={18} /></button></div>
              <label className="mb-2 block text-xs font-semibold">Description</label>
              <input required maxLength={120} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Groceries" className="mb-4 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-2 block text-xs font-semibold">Amount</label><input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></div>
                <div><label className="mb-2 block text-xs font-semibold">Date</label><input required type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className="mb-2 block text-xs font-semibold">Paid by</label><select value={paidBy} onChange={(event) => setPaidBy(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">{members.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}</select></div>
                <div><label className="mb-2 block text-xs font-semibold">Group</label><select value={expenseGroup} onChange={(event) => setExpenseGroup(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">{groups.map((item) => <option key={item.id ?? item.name} value={item.name}>{item.name}</option>)}</select></div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold">Split equally among</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const chosen = splitAmong.includes(member.name);
                    return <button type="button" key={member.name} onClick={() => setSplitAmong((current) => chosen ? current.filter((name) => name !== member.name) : [...current, member.name])} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${chosen ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{member.name}</button>;
                  })}
                </div>
              </div>
              <button disabled={saving} className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Save expense"}</button>
            </form>
          </div>
        )}

        {groupOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setGroupOpen(false); }}>
            <form onSubmit={createGroup} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Create a group</h2><p className="mt-1 text-xs text-slate-500">Add a shared expense space.</p></div><button type="button" onClick={() => setGroupOpen(false)}><X size={18} /></button></div>
              <label className="mb-2 block text-xs font-semibold">Group name</label>
              <input name="name" required maxLength={60} placeholder="e.g. Weekend trip" className="mb-4 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <label className="mb-2 block text-xs font-semibold">Emoji</label>
              <input name="emoji" defaultValue="🏠" className="mb-5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <button className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">Create group</button>
            </form>
          </div>
        )}

        {setupOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4">
            <form onSubmit={saveProfile} className="my-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">{profile ? "Edit profile" : "First-time setup"}</h2><p className="mt-1 text-xs text-slate-500">Demo profile saved in this browser—not secure account login.</p></div>{profile && <button type="button" onClick={() => setSetupOpen(false)}><X size={18} /></button>}</div>
              <label className="mb-2 block text-xs font-semibold">Your name</label>
              <input name="name" required defaultValue={profile?.name ?? ""} className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <label className="mb-2 block text-xs font-semibold">Your email</label>
              <input name="email" type="email" required defaultValue={profile?.email ?? ""} className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <label className="mb-2 block text-xs font-semibold">Household or group</label>
              <input name="household" required defaultValue={profile?.household ?? ""} placeholder="Apartment 4B" className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <label className="mb-2 block text-xs font-semibold">Currency</label>
              <select name="currency" defaultValue={profile?.currency ?? "INR"} className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option></select>
              <label className="mb-2 block text-xs font-semibold">Monthly target</label>
              <input name="monthlyTarget" required type="number" min="1" step="0.01" defaultValue={profile?.monthlyTarget ?? ""} className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <label className="mb-2 block text-xs font-semibold">Opening balance (optional, enter manually)</label>
              <input name="openingBalance" type="number" min="0" step="0.01" defaultValue={profile?.openingBalance ?? 0} className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <label className="mb-2 block text-xs font-semibold">Roommates: one per line as Name &lt;email&gt;</label>
              <textarea name="roommates" defaultValue={profile?.roommates.map((person) => `${person.name}${person.email ? ` <${person.email}>` : ""}`).join("\n") ?? ""} placeholder={"Alex <alex@example.com>\nSam <sam@example.com>"} className="mb-4 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <p className="mb-4 text-[11px] text-slate-400">Do not enter bank passwords, PINs, card details, or verification codes.</p>
              <button className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">Save profile</button>
            </form>
          </div>
        )}

        {targetOpen && profile && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
            <form onSubmit={saveTarget} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Set monthly target</h2><p className="mt-1 text-xs text-slate-500">{monthLabel(selectedMonth)}</p></div>{profile.monthlyTargets?.[selectedMonth] && <button type="button" onClick={() => setTargetOpen(false)}><X size={18} /></button>}</div>
              <label className="mb-2 block text-xs font-semibold">Target amount</label>
              <input required type="number" min="1" step="0.01" value={targetInput} onChange={(event) => setTargetInput(event.target.value)} className="mb-5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <button className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">Save target</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
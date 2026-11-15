"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  Home,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  Wallet
} from "lucide-react";

const groups = [
  { name: "Apartment 4B", emoji: "🏡", members: 4, spent: "₹18,450", color: "bg-violet-100" },
  { name: "Goa getaway", emoji: "🌴", members: 6, spent: "₹32,800", color: "bg-orange-100" },
  { name: "House groceries", emoji: "🥑", members: 3, spent: "₹6,240", color: "bg-emerald-100" }
];

const activity = [
  { initials: "AK", name: "Aarav", detail: "added a bill in Apartment 4B", item: "Electricity bill", amount: "₹2,400", color: "bg-indigo-100 text-indigo-700", emoji: "💡", time: "10 min ago" },
  { initials: "MS", name: "Maya", detail: "paid for Goa getaway", item: "Beachside dinner", amount: "₹3,650", color: "bg-pink-100 text-pink-700", emoji: "🍜", time: "2 hours ago" },
  { initials: "RJ", name: "Rohan", detail: "settled up with you", item: "UPI payment", amount: "₹850", color: "bg-amber-100 text-amber-700", emoji: "✨", time: "Yesterday" }
];

const bars = [
  { month: "Jun", height: "43%", value: "₹14.2k" },
  { month: "Jul", height: "62%", value: "₹20.1k" },
  { month: "Aug", height: "51%", value: "₹16.4k" },
  { month: "Sep", height: "78%", value: "₹25.3k" },
  { month: "Oct", height: "58%", value: "₹18.7k" },
  { month: "Nov", height: "68%", value: "₹22.1k" }
];

function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <div className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold ring-2 ring-white ${className}`}>
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <main className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#f7f8fc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <div className="mx-auto flex min-h-screen max-w-[1440px]">
          <aside className="hidden w-[245px] shrink-0 border-r border-slate-200/70 bg-white/80 px-5 py-7 dark:border-slate-800 dark:bg-slate-900/80 lg:flex lg:flex-col">
            <a href="#" className="mb-10 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-200">
                <Wallet size={20} />
              </div>
              <div>
                <div className="text-[17px] font-extrabold tracking-tight">nest<span className="text-violet-600">mate</span></div>
                <div className="text-[11px] text-slate-400">Roommates, in sync.</div>
              </div>
            </a>

            <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
            <nav className="space-y-1">
              {[
                { label: "Overview", icon: Home },
                { label: "My groups", icon: Users }
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    activeTab === label
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                  {label === "My groups" && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">3</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Your spaces</div>
            <div className="space-y-1">
              {groups.map((group) => (
                <button
                  key={group.name}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span className={`grid h-8 w-8 place-items-center rounded-xl text-base ${group.color}`}>{group.emoji}</span>
                  <span className="truncate">{group.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Sparkles size={16} /> Good things add up</div>
              <p className="text-xs leading-5 text-violet-100">You’ve kept your shared spending organized for 12 weeks. Nice work!</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/4 rounded-full bg-white" />
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
                <input
                  placeholder="Search expenses, groups..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-violet-950"
                />
                <kbd className="absolute right-3 top-2.5 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700">⌘ K</kbd>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white dark:hover:bg-slate-800">
                  <Sun size={18} />
                </button>
                <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white dark:hover:bg-slate-800">
                  <Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#f7f8fc]" />
                </button>
                <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                <button className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white dark:hover:bg-slate-800">
                  <Avatar initials="KS" className="h-8 w-8 bg-violet-100 text-violet-700" />
                  <span className="hidden text-sm font-semibold sm:block">Krishna</span>
                  <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
                </button>
              </div>
            </header>

            <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 lg:pb-10">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-500">Sunday, November 15</p>
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-[34px]">Hey Krishna <span>👋</span></h1>
                  <p className="mt-1 text-sm text-slate-500">Here’s the latest on your shared expenses.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 dark:shadow-none">
                  <Plus size={18} /> Add expense
                  <kbd className="ml-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[10px]">N</kbd>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 p-5 text-white shadow-lg shadow-violet-200/60 dark:shadow-none">
                  <div className="absolute -right-7 -top-10 h-36 w-36 rounded-full border-[22px] border-white/10" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-violet-100">Your total balance</p>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">+₹4,250</p>
                      <p className="mt-2 text-xs text-violet-100">You’re owed across all groups</p>
                    </div>
                    <div className="rounded-xl bg-white/15 p-2.5"><ArrowDownLeft size={20} /></div>
                  </div>
                  <div className="relative mt-5 flex items-center gap-1.5 text-xs font-semibold text-white/90">View balances <ArrowRight size={14} /></div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">November spending</p>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">₹22,100</p>
                      <p className="mt-2 text-xs text-slate-400">of ₹25,000 monthly goal</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/10"><Sparkles size={20} /></div>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>88% of budget</span><span>₹2,900 left</span></div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">You owe</p>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">₹1,280</p>
                      <p className="mt-2 text-xs text-slate-400">Across 2 people</p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-500/10"><ArrowUpRight size={20} /></div>
                  </div>
                  <button className="mt-4 text-xs font-bold text-violet-600 hover:text-violet-700">Settle up <ArrowRight size={12} className="ml-1 inline" /></button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold">Spending overview</h2>
                      <p className="mt-1 text-xs text-slate-400">Your group expenses over the last 6 months</p>
                    </div>
                    <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Last 6 months <ChevronDown size={13} className="ml-1 inline" /></button>
                  </div>
                  <div className="relative mt-7 h-48">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3].map((line) => <div key={line} className="border-t border-dashed border-slate-100 dark:border-slate-800" />)}
                    </div>
                    <div className="absolute inset-0 flex items-end justify-around px-3">
                      {bars.map((bar, i) => (
                        <div key={bar.month} className="group flex h-full w-[10%] flex-col items-center justify-end">
                          <span className="mb-2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 dark:bg-white dark:text-slate-900">{bar.value}</span>
                          <div
                            style={{ height: bar.height }}
                            className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${i === 5 ? "bg-gradient-to-t from-violet-600 to-fuchsia-400" : "bg-violet-100 dark:bg-violet-500/20"}`}
                          />
                          <span className="mt-2 text-[11px] text-slate-400">{bar.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400"><span className="h-2 w-2 rounded-full bg-violet-500" /> Monthly group spending <span className="ml-auto font-semibold text-slate-600 dark:text-slate-300">Goal: ₹25,000</span></div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-bold">Quick settle-up</h2>
                      <p className="mt-1 text-xs text-slate-400">A little less owing, a little more living.</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-500/10">2 pending</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {[
                      { from: "You", to: "Aarav", amount: "₹850", a: "KS", b: "AK" },
                      { from: "You", to: "Maya", amount: "₹430", a: "KS", b: "MS" }
                    ].map((item) => (
                      <div key={item.to} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                        <div className="flex -space-x-2">
                          <Avatar initials={item.a} className="bg-violet-100 text-violet-700" />
                          <Avatar initials={item.b} className="bg-orange-100 text-orange-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold">{item.from} <span className="font-normal text-slate-400">owe</span> {item.to}</p>
                          <p className="mt-0.5 text-sm font-extrabold tabular-nums">{item.amount}</p>
                        </div>
                        <button className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-violet-600 shadow-sm transition hover:bg-violet-600 hover:text-white dark:bg-slate-700">Pay</button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition hover:border-violet-200 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300">See all balances</button>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight">Your groups</h2>
                      <p className="mt-1 text-xs text-slate-400">All the people and plans you share</p>
                    </div>
                    <button className="text-xs font-bold text-violet-600 hover:text-violet-700">View all <ArrowRight size={13} className="ml-1 inline" /></button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {groups.map((group, i) => (
                      <button key={group.name} className="group rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20">
                        <div className="flex items-start justify-between">
                          <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${group.color}`}>{group.emoji}</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">On track</span>
                        </div>
                        <h3 className="mt-4 font-bold">{group.name}</h3>
                        <p className="mt-1 text-xs text-slate-400">{group.members} members · {group.spent} this month</p>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                          <div className="flex -space-x-2">
                            {["AK", "MS", "RJ", "KS"].slice(0, group.members).map((person, j) => (
                              <Avatar key={person} initials={person} className={`h-7 w-7 ${["bg-indigo-100 text-indigo-700", "bg-pink-100 text-pink-700", "bg-amber-100 text-amber-700", "bg-violet-100 text-violet-700"][j]}`} />
                            ))}
                          </div>
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-violet-50 group-hover:text-violet-600 dark:bg-slate-800"><ArrowRight size={14} /></span>
                        </div>
                      </button>
                    ))}
                    <button className="flex min-h-[178px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 text-slate-400 transition hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900/40">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"><Plus size={19} /></span>
                      <span className="mt-2 text-sm font-bold">Create a group</span>
                      <span className="mt-1 text-[11px]">Bring your people together</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight">Recent activity</h2>
                      <p className="mt-1 text-xs text-slate-400">The latest from your groups</p>
                    </div>
                    <button className="text-xs font-bold text-violet-600">See all</button>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {activity.map((item, index) => (
                      <div key={item.item} className={`flex gap-3 py-3 ${index < activity.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base ${item.emoji === "✨" ? "bg-amber-50" : "bg-slate-50 dark:bg-slate-800"}`}>{item.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs"><span className="font-bold">{item.name}</span> <span className="text-slate-400">{item.detail}</span></p>
                          <p className="mt-1 text-[11px] text-slate-400">{item.item} · {item.time}</p>
                        </div>
                        <span className="shrink-0 text-xs font-extrabold tabular-nums">{item.amount}</span>
                      </div>
                    ))}
                    <button className="mt-2 w-full rounded-lg py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-violet-600 dark:hover:bg-slate-800">View activity feed</button>
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-500/20 dark:bg-violet-500/5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-violet-600 dark:bg-slate-800"><CircleHelp size={18} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold">Need a hand?</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Check out our quick guide to splitting bills.</p>
                    </div>
                    <Settings size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-slate-200 bg-white/95 px-5 py-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
              <button className="flex flex-col items-center gap-1 p-2 text-violet-600"><Home size={19} /><span className="text-[10px] font-semibold">Home</span></button>
              <button className="flex flex-col items-center gap-1 p-2 text-slate-400"><Users size={19} /><span className="text-[10px] font-semibold">Groups</span></button>
              <button className="-mt-7 grid h-14 w-14 place-items-center rounded-2xl border-4 border-[#f7f8fc] bg-violet-600 text-white shadow-lg shadow-violet-300 dark:border-slate-950"><Plus size={24} /></button>
              <button className="flex flex-col items-center gap-1 p-2 text-slate-400"><Wallet size={19} /><span className="text-[10px] font-semibold">Activity</span></button>
              <button className="flex flex-col items-center gap-1 p-2 text-slate-400"><Settings size={19} /><span className="text-[10px] font-semibold">Settings</span></button>
            </nav>
          </section>
        </div>
      </div>
    </main>
  );
}
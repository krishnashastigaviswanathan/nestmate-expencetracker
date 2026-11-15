"use client";

import { useEffect, useState } from "react";

type Expense = {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
};

export default function Page() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [message, setMessage] = useState("");

  const loadExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data.expenses ?? []);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        amount: Number(amount),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      return;
    }

    setDescription("");
    setAmount("");
    setMessage("Expense added successfully");
    loadExpenses();
  };

  return (
    <main style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>NestMate Dashboard</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 420,
          marginBottom: 30,
        }}
      >
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Expense description"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#7c3aed",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Add Expense
        </button>
      </form>

      {message && <p style={{ marginBottom: 20 }}>{message}</p>}

      <h2>Expenses</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {expenses.map((expense) => (
          <li
            key={expense.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{expense.description}</span>
            <strong>₹{expense.amount}</strong>
          </li>
        ))}
      </ul>
    </main>
  );
}
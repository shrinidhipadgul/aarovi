"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ORDER_STATUSES,
  statusBadgeColor,
} from "@/lib/order-status";

interface OrderRow {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  total: number;
  status: string;
  statusLabel: string;
  badgeColor: string;
  paymentMethod: string;
  paymentId: string | null;
  paymentProof: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrdersListClientProps {
  initialOrders: OrderRow[];
  initialTotal: number;
  initialLimit: number;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const formatMoney = (n: number) => `\u20B9${n.toLocaleString("en-IN")}`;

export function OrdersListClient({
  initialOrders,
  initialTotal,
  initialLimit,
}: OrdersListClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const limit = initialLimit;

  const fetchOrders = useCallback(
    async (q: string, status: string, p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (status) params.set("status", status);
        params.set("page", String(p));
        params.set("limit", String(limit));

        const res = await fetch(`/api/admin/orders?${params}`);
        const json = await res.json();

        if (json.success) {
          setOrders(json.data.orders);
          setTotal(json.data.pagination.total);
        }
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders(search, statusFilter, 1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mt-6">
      <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order id or customer…"
          className="flex-1 rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
            fetchOrders(search, e.target.value, 1);
          }}
          className="rounded-lg border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending Verification</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
            </option>
          ))}
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-brand-primary/15">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-primary/15 bg-brand-primary/5">
              <th className="px-3 py-2 font-medium text-brand-text/70">Order</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Customer</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Date</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Items</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Total</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Payment</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Status</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className={`border-b border-brand-primary/5 transition-colors hover:bg-brand-primary/[0.02] ${
                  order.status === "pending" ? "bg-amber-50/40" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <span className="font-mono text-xs text-brand-text font-semibold">
                    {order.id.slice(-8)}
                  </span>
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 text-brand-text/80">
                  {order.userName ?? order.userEmail ?? "—"}
                </td>
                <td className="px-3 py-2 text-xs text-brand-text/80">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-3 py-2 text-brand-text/80">{order.itemCount}</td>
                <td className="px-3 py-2 font-medium text-brand-text">
                  {formatMoney(order.total)}
                </td>
                <td className="px-3 py-2 text-xs text-brand-text/80">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">
                      {order.paymentMethod === "UPI_QR"
                        ? "UPI / QR"
                        : order.paymentMethod}
                    </span>
                    {order.paymentProof && (
                      <span
                        className="inline-flex items-center rounded bg-brand-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-gold"
                        title="Payment screenshot attached"
                      >
                        📷 Proof
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      order.badgeColor ?? statusBadgeColor(order.status)
                    }`}
                  >
                    {order.statusLabel}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="rounded-md bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                  >
                    {order.status === "pending" ? "Verify" : "View"}
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-brand-text/40">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => p - 1);
              fetchOrders(search, statusFilter, page - 1);
            }}
            className="rounded-lg px-3 py-1.5 text-brand-text/60 transition-colors hover:bg-brand-primary/5 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-brand-text/60">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => {
              setPage((p) => p + 1);
              fetchOrders(search, statusFilter, page + 1);
            }}
            className="rounded-lg px-3 py-1.5 text-brand-text/60 transition-colors hover:bg-brand-primary/5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
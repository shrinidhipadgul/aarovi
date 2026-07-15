"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { resetCart } from "@/lib/stores/cart";
import { resetWishlist } from "@/lib/stores/wishlist";
import { validateAddress } from "@/lib/checkout";

interface AddressData {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phone: string | null;
  addresses: AddressData[];
}

type EditField = "name" | "email" | "phone";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session } = authClient.useSession();
  const loggedIn = !!session;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState("");

  const [editing, setEditing] = useState<EditField | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [newAddress, setNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedIn) return;

    if (params.id !== session?.user?.id) {
      router.replace(`/profile/${session?.user?.id}`);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/user/profile");
        if (cancelled) return;
        if (res.status === 401) {
          router.push("/sign-in");
          return;
        }
        if (!res.ok) throw new Error("Failed to load profile");
        const json = await res.json();
        if (!cancelled) setProfile(json.data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [loggedIn, params.id, session?.user?.id, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const startEdit = (field: EditField) => {
    if (!profile) return;
    setEditing(field);
    setEditValues({ [field]: profile[field] ?? "" });
    setSaveError("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValues({});
    setSaveError("");
  };

  const saveField = async () => {
    if (!editing || !profile) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json?.message ?? "Failed to save");
        setSaving(false);
        return;
      }
      setProfile((prev) =>
        prev ? { ...prev, ...json.data } : prev,
      );
      setEditing(null);
      setEditValues({});
      showToast(
        editing === "name"
          ? "Name updated!"
          : editing === "email"
            ? "Email updated!"
            : "Phone updated!",
      );
    } catch {
      setSaveError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    resetCart();
    resetWishlist();
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const openNewAddress = () => {
    setNewAddress(true);
    setAddressForm({ fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
    setAddressErrors({});
    setEditingAddress(null);
  };

  const openEditAddress = (addr: AddressData) => {
    setEditingAddress(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setAddressErrors({});
    setNewAddress(false);
  };

  const cancelAddressForm = () => {
    setNewAddress(false);
    setEditingAddress(null);
    setAddressForm({});
    setAddressErrors({});
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAddress(addressForm);
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    setSubmittingAddress(true);
    try {
      const isEdit = !!editingAddress;
      const url = isEdit ? `/api/addresses/${editingAddress}` : "/api/addresses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json?.errors) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(json.errors as Record<string, string[]>)) {
            flat[k] = Array.isArray(v) ? v[0] ?? "" : String(v);
          }
          setAddressErrors(flat);
        }
        setSubmittingAddress(false);
        return;
      }

      const profileRes = await fetch("/api/user/profile");
      if (profileRes.ok) {
        const pj = await profileRes.json();
        setProfile(pj.data);
      }

      cancelAddressForm();
      showToast(isEdit ? "Address updated!" : "Address added!");
    } catch {
      setAddressErrors({ _form: "Something went wrong" });
    } finally {
      setSubmittingAddress(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: "DELETE" });
      if (!res.ok) return;
      const profileRes = await fetch("/api/user/profile");
      if (profileRes.ok) {
        const pj = await profileRes.json();
        setProfile(pj.data);
      }
      showToast("Address deleted.");
    } catch {
      // ignore
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) return;
      const profileRes = await fetch("/api/user/profile");
      if (profileRes.ok) {
        const pj = await profileRes.json();
        setProfile(pj.data);
      }
      showToast("Default address updated.");
    } catch {
      // ignore
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-brand-primary">My Profile</h1>
        <p className="mt-3 text-brand-text/60">Sign in to view your profile.</p>
        <Link href="/sign-in" className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 py-20 text-center">
          <p className="text-lg font-medium text-red-600">Could not load profile</p>
          <p className="mt-2 text-sm text-brand-text/60">Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed right-4 top-24 z-50 animate-fade-in rounded-lg bg-green-700 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <h1 className="text-3xl font-semibold text-brand-primary">My Profile</h1>

      <section className="mt-8 rounded-xl border border-brand-primary/10 p-6">
        <h2 className="text-lg font-semibold text-brand-primary">Personal Info</h2>
        <div className="mt-6 space-y-5">
          <EditableField
            label="Name"
            value={profile.name}
            editing={editing === "name"}
            editValue={editValues.name ?? ""}
            onChange={(v) => setEditValues({ name: v })}
            onEdit={() => startEdit("name")}
            onCancel={cancelEdit}
            onSave={saveField}
            saving={saving}
            error={editing === "name" ? saveError : ""}
          />
          <EditableField
            label="Email"
            value={profile.email}
            editing={editing === "email"}
            editValue={editValues.email ?? ""}
            onChange={(v) => setEditValues({ email: v })}
            onEdit={() => startEdit("email")}
            onCancel={cancelEdit}
            onSave={saveField}
            saving={saving}
            error={editing === "email" ? saveError : ""}
          />
          <EditableField
            label="Phone"
            value={profile.phone ?? "Not set"}
            editing={editing === "phone"}
            editValue={editValues.phone ?? ""}
            onChange={(v) => setEditValues({ phone: v })}
            onEdit={() => startEdit("phone")}
            onCancel={cancelEdit}
            onSave={saveField}
            saving={saving}
            error={editing === "phone" ? saveError : ""}
          />
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-brand-primary/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-primary">Saved Addresses</h2>
          {!newAddress && !editingAddress && (
            <button
              onClick={openNewAddress}
              className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary/90"
            >
              + Add Address
            </button>
          )}
        </div>

        {newAddress || editingAddress ? (
          <AddressForm
            values={addressForm}
            errors={addressErrors}
            onChange={(field, value) => setAddressForm((prev) => ({ ...prev, [field]: value }))}
            onSubmit={submitAddress}
            onCancel={cancelAddressForm}
            submitting={submittingAddress}
            isEdit={!!editingAddress}
          />
        ) : profile.addresses.length === 0 ? (
          <p className="mt-6 text-sm text-brand-text/60">No saved addresses.</p>
        ) : (
          <ul className="mt-6 divide-y divide-brand-primary/10">
            {profile.addresses.map((addr) => (
              <li key={addr.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-text">
                    {addr.fullName}
                    {addr.isDefault && (
                      <span className="ml-2 rounded-full bg-brand-gold/10 px-2 py-0.5 text-[10px] font-medium text-brand-gold">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-text/60">{addr.line1}</p>
                  <p className="text-xs text-brand-text/60">
                    {addr.city}, {addr.state} &mdash; {addr.pincode}
                  </p>
                  <p className="text-xs text-brand-text/60">Phone: {addr.phone}</p>
                </div>
                <div className="flex flex-none items-start gap-2 pt-0.5">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="rounded border border-brand-primary/15 px-2 py-1 text-[10px] text-brand-text/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
                      title="Set as default"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => openEditAddress(addr)}
                    className="rounded border border-brand-primary/15 px-2 py-1 text-[10px] text-brand-text/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="rounded border border-red-100 px-2 py-1 text-[10px] text-red-400 transition-colors hover:border-red-200 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-brand-primary/10 p-6">
        <h2 className="text-lg font-semibold text-brand-primary">Account</h2>
        <p className="mt-2 text-sm text-brand-text/60">
          Signed in as <span className="font-medium">{profile.email}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="rounded-lg border border-brand-primary/15 px-4 py-2 text-sm text-brand-text transition-colors hover:bg-brand-bg"
          >
            My Orders
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-red-100 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

function EditableField({
  label,
  value,
  editing,
  editValue,
  onChange,
  onEdit,
  onCancel,
  onSave,
  saving,
  error,
}: {
  label: string;
  value: string;
  editing: boolean;
  editValue: string;
  onChange: (v: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string;
}) {
  if (editing) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-text">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full max-w-sm rounded-lg border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold ${
              error ? "border-red-300" : "border-brand-primary/15"
            }`}
            autoFocus
          />
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-brand-primary/15 px-4 py-2.5 text-sm text-brand-text transition-colors hover:bg-brand-bg"
          >
            Cancel
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-brand-text/60">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-brand-text">{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="flex-none rounded border border-brand-primary/15 px-3 py-1.5 text-xs text-brand-text/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
      >
        Edit
      </button>
    </div>
  );
}

function AddressForm({
  values,
  errors,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  isEdit,
}: {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  isEdit: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Full Name" value={values.fullName ?? ""} error={errors.fullName} onChange={(v) => onChange("fullName", v)} />
      <Field label="Phone" value={values.phone ?? ""} error={errors.phone} onChange={(v) => onChange("phone", v)} inputMode="tel" />
      <Field label="Address Line" value={values.line1 ?? ""} error={errors.line1} onChange={(v) => onChange("line1", v)} className="sm:col-span-2" />
      <Field label="City" value={values.city ?? ""} error={errors.city} onChange={(v) => onChange("city", v)} />
      <Field label="State" value={values.state ?? ""} error={errors.state} onChange={(v) => onChange("state", v)} />
      <Field label="Pincode" value={values.pincode ?? ""} error={errors.pincode} onChange={(v) => onChange("pincode", v)} inputMode="numeric" />
      {errors._form && <p className="col-span-full text-xs text-red-500">{errors._form}</p>}
      <div className="col-span-full flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : isEdit ? "Update Address" : "Add Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-brand-primary/15 px-6 py-2.5 text-sm text-brand-text transition-colors hover:bg-brand-bg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
  inputMode,
  className,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  inputMode?: "text" | "tel" | "numeric";
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-brand-text">{label}</label>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold ${
          error ? "border-red-300" : "border-brand-primary/15"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-8 w-40 rounded bg-brand-primary/10" />
      <div className="mt-8 space-y-8">
        <div className="rounded-xl border border-brand-primary/10 p-6">
          <div className="h-5 w-28 rounded bg-brand-primary/10" />
          <div className="mt-6 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-12 rounded bg-brand-primary/5" />
                  <div className="h-4 w-32 rounded bg-brand-primary/5" />
                </div>
                <div className="h-7 w-14 rounded bg-brand-primary/5" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-brand-primary/10 p-6">
          <div className="h-5 w-36 rounded bg-brand-primary/10" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded bg-brand-primary/5" />
                  <div className="h-3 w-48 rounded bg-brand-primary/5" />
                  <div className="h-3 w-36 rounded bg-brand-primary/5" />
                </div>
                <div className="h-7 w-14 rounded bg-brand-primary/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

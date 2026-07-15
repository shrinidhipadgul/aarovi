"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { resetCart } from "@/lib/stores/cart";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  validateAddress,
} from "@/lib/checkout";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
} from "@/lib/razorpay-client";

interface CartItem {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
}

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

interface AddressForm {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

const formatMoney = (n: number) => `\u20B9${n.toLocaleString("en-IN")}`;

export default function PlaceOrderPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const loggedIn = !!session;

  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loggedIn) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const [cartRes, addrRes] = await Promise.all([
          fetch("/api/cart"),
          fetch("/api/addresses"),
        ]);
        if (cancelled) return;
        if (cartRes.status === 401) {
          const callbackURL = encodeURIComponent("/place-order");
          router.push(`/sign-in?callbackURL=${callbackURL}`);
          return;
        }
        if (!cartRes.ok || !addrRes.ok) throw new Error("Failed to load");
        const cartJson = await cartRes.json();
        const addrJson = await addrRes.json();
        if (!cancelled) {
          setItems(cartJson.data ?? []);
          setAddresses(addrJson.data ?? []);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loggedIn, router]);

  const handleAddressSelect = (addr: SavedAddress) => {
    setAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setAddressErrors({});
  };

  const handleFieldChange = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const errors = validateAddress(address);
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      setSubmitError("Please correct the address fields.");
      return;
    }

    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          paymentMethod,
          saveAddress,
        }),
      });

      const createJson = await createRes.json();

      if (!createRes.ok) {
        const msg =
          createJson?.message ?? "Failed to place order. Please try again.";
        if (createJson?.errors && typeof createJson.errors === "object") {
          const flat: Record<string, string> = {};
          for (const [key, value] of Object.entries(
            createJson.errors as Record<string, string[]>,
          )) {
            flat[key] = Array.isArray(value) ? value[0] ?? "" : String(value);
          }
          setAddressErrors(flat);
          setSubmitError(msg);
        } else {
          setSubmitError(msg);
        }
        setSubmitting(false);
        return;
      }

      const data = createJson.data;

      if (paymentMethod === "COD") {
        resetCart();
        router.push(`/place-order/success?orderId=${data.orderId}`);
        return;
      }

      await loadRazorpayScript();

      openRazorpayCheckout({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Aarovi",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: "#4F200D" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/orders/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyJson = await verifyRes.json();
              router.push(
                `/place-order/failure?orderId=${data.orderId}&reason=${encodeURIComponent(verifyJson?.message ?? "Verification failed")}`,
              );
              return;
            }

            resetCart();
            router.push(`/place-order/success?orderId=${data.orderId}`);
          } catch {
            router.push(
              `/place-order/failure?orderId=${data.orderId}&reason=${encodeURIComponent("Payment verification error")}`,
            );
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setSubmitError("Payment was cancelled. You can retry.");
          },
        },
      });
    } catch {
      setSubmitting(false);
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-brand-primary">Checkout</h1>
        <p className="mt-3 text-brand-text/60">
          Sign in to place your order.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded bg-brand-primary/10" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-brand-primary/5"
              />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-brand-primary/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 py-20 text-center">
          <p className="text-lg font-medium text-red-600">
            Could not load checkout
          </p>
          <p className="mt-2 text-sm text-brand-text/60">
            Something went wrong. Please try again.
          </p>
          <Link
            href="/place-order"
            className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-brand-primary">Checkout</h1>
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-primary/15 py-20 text-center">
          <p className="text-lg font-medium text-brand-text">
            Your cart is empty
          </p>
          <p className="mt-2 text-sm text-brand-text/60">
            Add items to your cart before placing an order.
          </p>
          <Link
            href="/shop/collection"
            className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-brand-primary">Checkout</h1>

      <form
        onSubmit={handlePlaceOrder}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]"
      >
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-brand-primary">
              Delivery Address
            </h2>

            {addresses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleAddressSelect(addr)}
                    className="rounded-lg border border-brand-primary/15 px-3 py-2 text-left text-xs transition-colors hover:border-brand-gold hover:bg-brand-bg"
                  >
                    <span className="font-medium text-brand-text">
                      {addr.fullName}
                    </span>
                    <span className="block text-brand-text/60">
                      {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Full Name"
                value={address.fullName}
                error={addressErrors.fullName}
                onChange={(v) => handleFieldChange("fullName", v)}
                placeholder="John Doe"
              />
              <FieldInput
                label="Phone"
                value={address.phone}
                error={addressErrors.phone}
                onChange={(v) => handleFieldChange("phone", v)}
                placeholder="10-digit mobile number"
                inputMode="tel"
              />
              <FieldInput
                label="Address Line"
                value={address.line1}
                error={addressErrors.line1}
                onChange={(v) => handleFieldChange("line1", v)}
                placeholder="House no., street, area"
                className="sm:col-span-2"
              />
              <FieldInput
                label="City"
                value={address.city}
                error={addressErrors.city}
                onChange={(v) => handleFieldChange("city", v)}
                placeholder="e.g. Bengaluru"
              />
              <FieldInput
                label="State"
                value={address.state}
                error={addressErrors.state}
                onChange={(v) => handleFieldChange("state", v)}
                placeholder="e.g. Karnataka"
              />
              <FieldInput
                label="Pincode"
                value={address.pincode}
                error={addressErrors.pincode}
                onChange={(v) => handleFieldChange("pincode", v)}
                placeholder="6-digit pincode"
                inputMode="numeric"
              />
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-brand-text/70">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 rounded border-brand-primary/20 accent-brand-primary"
              />
              Save this address to my profile
            </label>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-primary">
              Payment Method
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              <PaymentOption
                selected={paymentMethod === "COD"}
                onClick={() => setPaymentMethod("COD")}
                title="Cash on Delivery"
                description="Pay with cash when your order arrives"
              />
              <PaymentOption
                selected={paymentMethod === "RAZORPAY"}
                onClick={() => setPaymentMethod("RAZORPAY")}
                title="Online Payment"
                description="Pay securely via Razorpay"
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-primary">
              Order Summary
            </h2>
            <ul className="mt-4 divide-y divide-brand-primary/10">
              {items.map((item) => {
                const image = item.product.images?.[0];
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="h-16 w-14 flex-none overflow-hidden rounded-lg border border-brand-primary/10 bg-brand-bg">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-brand-text/30">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-text">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-brand-text/60">
                        Size: {item.size} &middot; Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-brand-text">
                      {formatMoney(item.product.price * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-2 border-t border-brand-primary/10 pt-4">
              <div className="flex justify-between text-sm text-brand-text/70">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-text/70">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? "Free" : formatMoney(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-brand-primary">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
            {deliveryFee > 0 && (
              <p className="mt-1 text-xs text-brand-text/60">
                Get free delivery on orders over {formatMoney(FREE_DELIVERY_THRESHOLD)}.
              </p>
            )}
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-brand-primary/10 bg-white p-6">
            {submitError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}
            <div className="mb-4 flex justify-between text-lg font-semibold">
              <span className="text-brand-text">Total</span>
              <span className="text-brand-primary">{formatMoney(total)}</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Processing..."
                : paymentMethod === "COD"
                  ? "Place Order"
                  : "Pay & Place Order"}
            </button>
            <p className="mt-3 text-center text-xs text-brand-text/60">
              By placing your order you agree to our terms.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

interface FieldInputProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "numeric";
  className?: string;
}

function FieldInput({
  label,
  value,
  error,
  onChange,
  placeholder,
  inputMode = "text",
  className,
}: FieldInputProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-brand-text">
        {label}
      </label>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold ${
          error ? "border-red-300" : "border-brand-primary/15"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PaymentOption({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-colors ${
        selected
          ? "border-brand-gold bg-brand-bg"
          : "border-brand-primary/15 hover:border-brand-primary/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border-2 ${
            selected ? "border-brand-gold" : "border-brand-primary/20"
          }`}
        >
          {selected && (
            <span className="h-2 w-2 rounded-full bg-brand-gold" />
          )}
        </span>
        <span className="text-sm font-semibold text-brand-text">{title}</span>
      </div>
      <p className="mt-1.5 pl-6 text-xs text-brand-text/60">{description}</p>
    </button>
  );
}

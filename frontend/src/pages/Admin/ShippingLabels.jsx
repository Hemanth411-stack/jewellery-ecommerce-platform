import { useEffect, useRef, useState } from "react";
import { Printer, X } from "lucide-react";
import Input from "../../components/common/Input.jsx";
import api from "../../services/api.js";
import { buildShippingLabel } from "../../utils/shippingLabel.js";

const blankAddress = { fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India" };
const fields = [
  ["fullName", "Sender / business name", 150], ["phone", "Phone number", 30],
  ["addressLine1", "Address line 1", 250], ["addressLine2", "Address line 2 (optional)", 250],
  ["city", "City", 100], ["state", "State", 100], ["postalCode", "PIN / postal code", 20], ["country", "Country", 100],
];

function SenderForm({ provider, address, onSaved }) {
  const [draft, setDraft] = useState({ ...blankAddress, ...address });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await api.put(`/orders/admin/sender-addresses/${provider}`, draft);
      onSaved(provider, data.address);
      setFeedback({ text: data.message });
    } catch (error) {
      setFeedback({ error: true, text: error.response?.data?.message || "Could not save the address. Please try again." });
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="rounded-md border border-ink/10 bg-pearl p-4">
      <h3 className="mb-4 font-semibold text-ink">{provider} — From address</h3>
      <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
        {fields.map(([field, label, maxLength]) => (
          <Input key={field} label={label} name={`${provider}-${field}`} value={draft[field]} maxLength={maxLength} required={field !== "addressLine2"} type={field === "phone" ? "tel" : "text"} onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))} />
        ))}
      </fieldset>
      {feedback && <p role="status" className={`mt-3 text-sm ${feedback.error ? "text-red-700" : "text-green-700"}`}>{feedback.text}</p>}
      <button type="submit" disabled={busy} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : `Save ${provider} address`}</button>
    </form>
  );
}

export default function ShippingLabels({ order, onClose }) {
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(false);
  const [printError, setPrintError] = useState("");
  const frame = useRef(null);
  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/orders/admin/sender-addresses");
      setAddresses(Object.fromEntries(data.addresses.map((address) => [address._id, address])));
    } catch {
      setLoadError("Could not load saved sender addresses.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    setReady(false);
    setPrintError("");
  }, [order, addresses]);
  useEffect(() => {
    if (!order) return;
    const close = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [order, onClose]);

  let html = "";
  let labelError = "";
  if (order && !loading && !loadError) {
    try { html = buildShippingLabel(order, addresses); }
    catch (error) { labelError = error.message; }
  }
  const print = () => {
    try {
      frame.current.contentWindow.focus();
      frame.current.contentWindow.print();
    } catch { setPrintError("Could not open printing. Please try again in your browser."); }
  };

  return <>
    <details className="mb-6 rounded-md border border-ink/10 bg-white p-5 shadow-soft">
      <summary className="cursor-pointer font-semibold text-ink">Shipping labels — saved sender addresses</summary>
      <p className="mt-3 text-sm text-ink/60">Save a separate From address for each service. These addresses are shared across admin accounts and reused when printing labels.</p>
      {loading ? <p className="mt-4 text-sm">Loading sender addresses...</p> : loadError ? <p role="alert" className="mt-4 text-sm text-red-700">{loadError} <button type="button" onClick={load} className="underline">Retry</button></p> : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {["DTDC", "Postman"].map((provider) => <SenderForm key={provider} provider={provider} address={addresses[provider]} onSaved={(key, address) => setAddresses((current) => ({ ...current, [key]: address }))} />)}
        </div>
      )}
    </details>
    {order && <div role="dialog" aria-modal="true" aria-labelledby="shipping-label-title" className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/70 p-4">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col rounded-md bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="shipping-label-title" className="text-xl font-bold">Shipping label — {order.deliveryProvider || "DTDC"}</h2>
          <button type="button" autoFocus onClick={onClose} aria-label="Close shipping label" className="rounded-full border p-2"><X size={20} /></button>
        </div>
        {loading ? <p>Loading sender addresses...</p> : (loadError || labelError) ? <p role="alert" className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">{loadError || labelError} Close this preview and open “Shipping labels — saved sender addresses” above the orders.</p> : (
          <iframe ref={frame} title="Shipping label preview" srcDoc={html} onLoad={() => setReady(true)} className="min-h-0 w-full flex-1 border border-ink/10 bg-white" style={{ height: "65vh", flexBasis: "65vh" }} />
        )}
        {printError && <p role="alert" className="mt-3 text-sm text-red-700">{printError}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-sm text-ink/60">Print on A4 white paper, or choose “Save as PDF” in the print dialog. Turn off browser headers and footers.</p>
          <button type="button" onClick={print} disabled={!html || !ready} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Printer size={17} /> Print / Save PDF</button>
        </div>
      </div>
    </div>}
  </>;
}

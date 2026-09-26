const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

const addressBlock = (heading, address) => `<section><h2>${heading}</h2>
  <p class="name">${escapeHtml(address.fullName)}</p>
  <p>${escapeHtml(address.addressLine1)}</p>
  ${address.addressLine2 ? `<p>${escapeHtml(address.addressLine2)}</p>` : ""}
  <p>${escapeHtml(address.city)}, ${escapeHtml(address.state)}</p>
  <p class="pin">PIN: ${escapeHtml(address.postalCode)}</p>
  <p>${escapeHtml(address.country)}</p>
  <p class="phone">Phone: ${escapeHtml(address.phone)}</p></section>`;

export const buildShippingLabel = (order, addresses) => {
  const provider = order.deliveryProvider || "DTDC";
  const sender = addresses[provider];
  const required = ["fullName", "phone", "addressLine1", "city", "state", "postalCode", "country"];
  if (!sender || required.some((field) => !sender[field]?.trim())) throw new Error(`Save the ${provider} sender address before printing.`);
  if (!order.deliveryAddress || required.some((field) => !order.deliveryAddress[field]?.trim())) throw new Error("This order has an incomplete delivery address.");
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Shipping-label-${escapeHtml(order._id)}</title>
  <style>@page{size:A4 portrait;margin:15mm}*{box-sizing:border-box}body{margin:0;padding:20px;background:white;color:black;font-family:Arial,sans-serif}.label{max-width:180mm;margin:0 auto;border:2px solid black;break-inside:avoid}header{padding:16px 22px;border-bottom:2px solid black;display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}header strong{font-size:20px}header span{font-size:13px;overflow-wrap:anywhere}section{padding:20px 22px;overflow-wrap:anywhere}section+section{border-top:1px solid black}h2{font-size:16px;margin:0 0 12px;letter-spacing:2px}p{font-size:17px;line-height:1.5;margin:2px 0;white-space:pre-line}.name{font-size:21px;font-weight:bold}.pin{font-size:22px;font-weight:bold;margin-top:8px}.phone{margin-top:8px}footer{padding:12px 22px;border-top:1px solid black;font-size:13px;overflow-wrap:anywhere}@media print{body{padding:0}.label{max-width:none}}</style></head>
  <body><main class="label"><header><strong>${escapeHtml(provider)}</strong><span>Order #${escapeHtml(order._id)}</span></header>
  ${addressBlock("TO", order.deliveryAddress)}${addressBlock("FROM / RETURN ADDRESS", sender)}
  ${order.trackingReference ? `<footer>Tracking reference: ${escapeHtml(order.trackingReference)}</footer>` : ""}
  </main></body></html>`;
};

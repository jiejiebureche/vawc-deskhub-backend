// utils/phone.js
export function formatContactNum(localNumber) {
  // Accepts forms like "09223456789" or "9223456789" or "+639223456789"
  if (!localNumber || typeof localNumber !== "string") return null;

  const cleaned = localNumber.replace(/\s|-/g, ""); // remove spaces/dashes
  if (cleaned.startsWith("+")) {
    return cleaned; // already in international form
  }
  // If starts with 0 -> drop leading 0 and add +63
  if (/^0\d{10}$/.test(cleaned)) {
    return "+63" + cleaned.slice(1);
  }
  // If already starts with 9 and 10 digits (like 9223456789)
  if (/^9\d{9}$/.test(cleaned)) {
    return "+63" + cleaned;
  }
  // Fallback: return null so caller can handle invalid format
  return null;
}

export function formatCurrency(value) {
  const amount = Number(value) || 0; // ensure it's a number
  return `₦${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

export function formatNumber(value, decimals = 2) {
  const num = Number(value) || 0;
  return num.toFixed(decimals);
}

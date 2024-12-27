export const formatNumber = (n: number | undefined) => {
  if (!n) return n;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
};

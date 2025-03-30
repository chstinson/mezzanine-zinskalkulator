/**
 * Formatiert einen Wert als Währung (EUR)
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

/**
 * Formatiert einen Wert als Prozent
 */
export const formatPercent = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Formatiert einen Wert als Zahl
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat('de-DE').format(value);
};

/**
 * Formatiert einen Monatswert als Quartal
 */
export const formatQuartal = (monat) => {
  if (monat === 0) return "Initial";
  const jahr = Math.floor(monat / 12) + 1;
  const quartal = Math.ceil((monat % 12) / 3);
  return `Jahr ${jahr}, Q${quartal}`;
};

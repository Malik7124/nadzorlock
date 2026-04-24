// Номера в/ч в учебной работе маскируются — реальные номера не используются
// и не должны отображаться в интерфейсе.
export const MASK = "•••••";
export function maskNumber(_n?: string): string {
  return MASK;
}

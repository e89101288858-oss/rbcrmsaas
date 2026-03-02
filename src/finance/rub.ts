export function roundRub(value: number): number {
  const factor = 100;
  const scaled = value * factor;
  const sign = Math.sign(scaled) || 1;
  const abs = Math.abs(scaled);
  const rounded = Math.floor(abs + 0.5);
  return (rounded * sign) / factor;
}

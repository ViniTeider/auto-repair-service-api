const checkDigit = (digits: number[], weight: number): number => {
  const sum = digits.reduce(
    (total, digit, index) => total + digit * (weight - index),
    0,
  );
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
};

export const randomCpf = (): string => {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  if (new Set(base).size === 1) base[0] = (base[0] + 1) % 10;
  const first = checkDigit(base, 10);
  const second = checkDigit([...base, first], 11);
  return [...base, first, second].join('');
};

export const randomPlate = (): string => {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join('');
  return `${letters}${Math.floor(1000 + Math.random() * 9000)}`;
};

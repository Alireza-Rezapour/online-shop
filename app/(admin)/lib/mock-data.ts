let idCounter = 1000;
export function generateMockId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

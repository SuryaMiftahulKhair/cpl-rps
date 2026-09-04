export const compareText = (first: unknown, second: unknown) =>
  String(first ?? "").localeCompare(String(second ?? ""), "id", {
    numeric: true,
    sensitivity: "base",
  });

export const compareCode = (first: unknown, second: unknown) => {
  const firstParts = String(first ?? "").match(/\d+/g)?.map(Number) || [];
  const secondParts = String(second ?? "").match(/\d+/g)?.map(Number) || [];
  const length = Math.max(firstParts.length, secondParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (firstParts[index] ?? -1) - (secondParts[index] ?? -1);
    if (difference !== 0) return difference;
  }

  return compareText(first, second);
};

export const sortByText = <T>(items: T[], getValue: (item: T) => unknown) =>
  [...items].sort((first, second) => compareText(getValue(first), getValue(second)));

export const sortByCode = <T>(items: T[], getValue: (item: T) => unknown) =>
  [...items].sort((first, second) => compareCode(getValue(first), getValue(second)));
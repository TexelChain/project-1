//Omit
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keysToOmit: K[]
): Omit<T, K> {
  const newObj: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentKey = key as keyof T;
      if (!keysToOmit.includes(currentKey as K)) {
        newObj[currentKey] = obj[currentKey];
      }
    }
  }
  return newObj as Omit<T, K>;
}

export function formatAddress(str: string) {
  if (str.length < 8) {
    return str;
  }
  const firstFour = str.substring(0, 4);
  const lastFour = str.substring(str.length - 4);

  return `${firstFour}...${lastFour}`;
}

export const arrayToObject = (sources: string[]) => {
  const target: { [key: string]: boolean } = {};

  for (const current of sources) {
    target[current] = true;
  }

  return target;
};

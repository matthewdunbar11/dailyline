export const createId = (): string => {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

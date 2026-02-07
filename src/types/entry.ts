export type Entry = {
  id: string;
  date: string;
  text: string;
  mood?: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

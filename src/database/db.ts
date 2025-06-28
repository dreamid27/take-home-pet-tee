import Dexie, { type EntityTable } from "dexie";

interface Image {
  id: number;
  url: string;
  prompt: string;
  kind: string;
  created_at: string;
}

const db = new Dexie("ImageDatabase") as Dexie & {
  images: EntityTable<
    Image,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  images: "++id, url, prompt, kind, created_at", // primary key "id" (for the runtime!)
});

export type { Image };
export { db };

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { KeyValueStorage } from "./storage.js";

export class JsonFileStorage implements KeyValueStorage {
  constructor(private readonly baseDir: string) {}

  private pathFor(key: string): string {
    return join(this.baseDir, `${key}.json`);
  }

  async read<T>(key: string, fallback: T): Promise<T> {
    const path = this.pathFor(key);
    try {
      const raw = await readFile(path, "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  async write<T>(key: string, value: T): Promise<void> {
    const path = this.pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(value, null, 2), "utf-8");
  }
}

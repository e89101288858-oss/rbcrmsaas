import type { Document } from "../domain/types.js";
import { InMemoryRepository } from "./base-repository.js";

export class DocumentsRepository extends InMemoryRepository<Document> {}

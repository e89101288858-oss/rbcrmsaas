import type { Client } from "../domain/types.js";
import { InMemoryRepository } from "./base-repository.js";

export class ClientsRepository extends InMemoryRepository<Client> {}

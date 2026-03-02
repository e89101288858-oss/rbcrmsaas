import type { Rental } from "../domain/types.js";
import { InMemoryRepository } from "./base-repository.js";

export class RentalsRepository extends InMemoryRepository<Rental> {}

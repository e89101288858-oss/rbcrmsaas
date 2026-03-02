import type { Bike } from "../domain/types.js";
import { InMemoryRepository } from "./base-repository.js";

export class BikesRepository extends InMemoryRepository<Bike> {}

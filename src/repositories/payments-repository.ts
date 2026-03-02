import type { Payment } from "../domain/types.js";
import { InMemoryRepository } from "./base-repository.js";

export class PaymentsRepository extends InMemoryRepository<Payment> {}

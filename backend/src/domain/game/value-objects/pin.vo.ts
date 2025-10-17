/**
 * PIN Value Object
 * Represents a game session PIN with validation
 */
export class PIN {
  private readonly value: string;

  constructor(pin: string) {
    this.validate(pin);
    this.value = pin;
  }

  private validate(pin: string): void {
    if (!/^\d{6}$/.test(pin)) {
      throw new Error('PIN must be exactly 6 digits');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PIN): boolean {
    return this.value === other.getValue();
  }

  static generate(): PIN {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    return new PIN(pin);
  }
}

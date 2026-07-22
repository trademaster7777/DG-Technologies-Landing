import { describe, it, expect } from "vitest";
import { parseAvailability } from "./availability";

describe("parseAvailability", () => {
  it("defaults-style rule offers hourly slots, end exclusive", () => {
    const days = parseAvailability("Mon-Sun 09:00-17:00");
    for (const d of days) {
      expect(d.slots[0]).toBe("09:00");
      expect(d.slots[d.slots.length - 1]).toBe("16:00");
      expect(d.slots).toHaveLength(8);
    }
  });

  it("handles day ranges, lists, and multiple rules", () => {
    const days = parseAvailability("Mon-Fri 09:00-12:00; Sat 10:00-11:00");
    expect(days[0]!.slots).toEqual([]); // Sunday closed
    expect(days[1]!.slots).toEqual(["09:00", "10:00", "11:00"]);
    expect(days[5]!.slots).toEqual(["09:00", "10:00", "11:00"]);
    expect(days[6]!.slots).toEqual(["10:00"]);

    const listed = parseAvailability("Mon,Wed 14:00-16:00");
    expect(listed[1]!.slots).toEqual(["14:00", "15:00"]);
    expect(listed[2]!.slots).toEqual([]);
    expect(listed[3]!.slots).toEqual(["14:00", "15:00"]);
  });

  it("wraps day ranges across the week boundary", () => {
    const days = parseAvailability("Fri-Mon 09:00-10:00");
    expect(days.filter((d) => d.slots.length > 0).map((d) => d.dayOfWeek)).toEqual([
      0, 1, 5, 6,
    ]);
  });

  it("merges overlapping rules without duplicates and sorts", () => {
    const days = parseAvailability("Mon 10:00-12:00; Mon 09:00-11:00");
    expect(days[1]!.slots).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("throws on invalid config", () => {
    expect(() => parseAvailability("")).toThrow();
    expect(() => parseAvailability("Funday 09:00-17:00")).toThrow();
    expect(() => parseAvailability("Mon 09:30-17:00")).toThrow();
    expect(() => parseAvailability("Mon 17:00-09:00")).toThrow();
    expect(() => parseAvailability("Mon")).toThrow();
  });
});

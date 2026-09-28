import { bookSlot, getOpenSlots } from "../lib/slots";

async function main() {
  const serviceId = "cmue3cc1m000rya2mj0k9l1m4";
  const stylistId = "cmue3cc1q000xya2m3jd6js5q";
  const startsAt = new Date("2026-09-24T04:15:00.000Z");

  const first = await bookSlot({
    guestName: "Test One",
    phone: "9800000001",
    serviceId,
    stylistId,
    startsAt,
  });
  console.log("first", first.id, first.status);

  try {
    await bookSlot({
      guestName: "Test Two",
      phone: "9800000002",
      serviceId,
      stylistId,
      startsAt,
    });
    console.log("SECOND_SUCCEEDED_BUG");
  } catch (error) {
    console.log("second_blocked", error instanceof Error ? error.message : error);
  }

  const slots = await getOpenSlots({ date: "2026-09-24", serviceId, stylistId });
  console.log("still_has_10am", slots.some((slot) => slot.startsAt === startsAt.toISOString()));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

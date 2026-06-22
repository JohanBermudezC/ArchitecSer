export const RESERVATION_START_HOUR = 15;
export const RESERVATION_END_HOUR = 23;

const padHour = (hour) => String(hour).padStart(2, "0");

export const RESERVATION_SLOTS = Array.from(
  { length: RESERVATION_END_HOUR - RESERVATION_START_HOUR },
  (_, index) => {
    const startHour = RESERVATION_START_HOUR + index;
    const endHour = startHour + 1;

    return {
      start: `${padHour(startHour)}:00`,
      end: `${padHour(endHour)}:00`,
      label: `${formatHour(startHour)} - ${formatHour(endHour)}`,
    };
  },
);

export function formatHour(hour) {
  if (hour === 12) return "12:00 PM";
  if (hour === 24) return "12:00 AM";
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
}

export function getSlotByStart(start) {
  return RESERVATION_SLOTS.find((slot) => slot.start === start);
}

export function isValidReservationSlot(start, end) {
  const selectedSlot = getSlotByStart(start);
  return Boolean(selectedSlot && selectedSlot.end === end);
}

export function getReservationSlotMessage() {
  return "Selecciona un bloque de una hora entre 3:00 PM y 11:00 PM.";
}

export function hasReservationOverlap(reservations, start, end, ignoredId = null) {
  return reservations.some((reservation) => {
    if (ignoredId && reservation.id === ignoredId) return false;

    return start < reservation.horaFin && end > reservation.horaInicio;
  });
}

export function getUnavailableSlotStarts(reservations, ignoredId = null) {
  return RESERVATION_SLOTS.filter((slot) =>
    hasReservationOverlap(reservations, slot.start, slot.end, ignoredId),
  ).map((slot) => slot.start);
}

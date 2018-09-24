import { Trip, TripState } from "./models";

export const take = (before: Trip, after: Trip, tripId: string) => {
  console.log("Handle trip take: ", tripId);

  const passengerId = after.passenger.id;
  const targetDriver = after.driver;
  const updates = {};

  if (targetDriver.id) {
    const drivers = after.notifiedDrivers || {};

    for (const driverId in drivers) {
      if (drivers.hasOwnProperty(driverId)) {
        updates[`/tripsByDrivers/${driverId}/${tripId}/driver`] = targetDriver;
        updates[`/tripsByDrivers/${driverId}/${tripId}/state`] =
          driverId === targetDriver.id ? TripState.ACCEPTED : TripState.TAKED;
      }
    }
  }

  updates[`/tripsByPassengers/${passengerId}/${tripId}/driver`] = targetDriver;
  updates[`/tripsByPassengers/${passengerId}/${tripId}/state`] =
    TripState.ACCEPTED;

  return updates;
};

export const cancel = (before: Trip, after: Trip, tripId: string) => {
  console.log("Handle trip cancel: ", tripId);

  const updates = {};

  if (after.notifiedDrivers) {
    const drivers = after.notifiedDrivers;

    for (const driverId in drivers) {
      if (drivers.hasOwnProperty(driverId)) {
        updates[`/tripsByDrivers/${driverId}/${tripId}/state`] =
          TripState.CANCEL;
      }
    }
  }

  updates[`/tripsByPassengers/${after.passenger.id}/${tripId}/state`] =
    TripState.CANCEL;

  console.log("Trip cancel updates:", updates);

  return updates;
};

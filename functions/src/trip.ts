import { Trip, TripState } from "./models";

export const take = (trip: Trip, tripId: string) => {
  console.log("Handle trip take: ", tripId);

  const passengerId = trip.passenger.id;
  const targetDriver = trip.driver;
  const updates = {};

  if (targetDriver.id) {
    const drivers = trip.notifiedDrivers || {};

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

export const cancel = (trip: Trip, tripId: string) => {
  console.log("Handle trip cancel: ", tripId);

  const updates = {};

  if (trip.notifiedDrivers) {
    const drivers = trip.notifiedDrivers;

    for (const driverId in drivers) {
      if (drivers.hasOwnProperty(driverId)) {
        updates[`/tripsByDrivers/${driverId}/${tripId}/state`] =
          TripState.CANCEL;
      }
    }
  }

  updates[`/tripsByPassengers/${trip.passenger.id}/${tripId}/state`] =
    TripState.CANCEL;

  console.log("Trip cancel updates:", updates);

  return updates;
};

export const arrive = (trip: Trip, tripId: string) => {
  console.log("Handle trip arrive: ", tripId);

  const updates = {};

  updates[`tripsByDrivers/${trip.driver.id}/${tripId}/state`] =
    TripState.ARRIVED;
  updates[`tripsByPassengers/${trip.passenger.id}/${tripId}/state`] =
    TripState.ARRIVED;

  console.log("Trip arrive updates: ", updates);

  return updates;
};

export const boarded = (trip: Trip, tripId: string) => {
  console.log("Handle trip boarded: ", tripId);

  const updates = {};

  updates[`tripsByDrivers/${trip.driver.id}/${tripId}/state`] =
    TripState.BOARDED;
  updates[`tripsByPassengers/${trip.passenger.id}/${tripId}/state`] =
    TripState.BOARDED;

  console.log("Trip boarded updates: ", updates);

  return updates;
};

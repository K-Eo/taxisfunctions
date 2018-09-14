interface Position {
  latitude: number;
  longitude: number;
}

export enum TripState {
  ACCEPTED = "accepted",
  ARRIVED = "arrived",
  BOARDED = "boarded",
  CANCEL = "cancel",
  FINALIZE = "finalize",
  PENDING = "pending",
  TAKED = "taked",
  TRAVELING = "traveling"
}

export interface Trip {
  driverId?: string;
  notifiedDrivers?: { [key: string]: boolean };
  position: Position;
  state: string;
  userId: string;
}

export const take = (before: Trip, after: Trip, tripId: string) => {
  console.log("Handle trip take: ", tripId);

  const userId = after.userId;
  const targetDriverId = after.driverId;
  const updates = {};

  if (targetDriverId) {
    const drivers = after.notifiedDrivers || {};

    for (const driverId in drivers) {
      if (drivers.hasOwnProperty(driverId)) {
        updates[`/tripsByDrivers/${driverId}/${tripId}/state`] =
          driverId === targetDriverId ? TripState.ACCEPTED : TripState.TAKED;
      }
    }
  }

  updates[`/tripsByPassengers/${userId}/${tripId}/state`] = TripState.ACCEPTED;
  updates[`/tripsByPassengers/${userId}/${tripId}/driverId`] = targetDriverId;

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

  updates[`/tripsByPassengers/${after.userId}/${tripId}/state`] =
    TripState.CANCEL;

  console.log("Trip cancel updates:", updates);

  return updates;
};

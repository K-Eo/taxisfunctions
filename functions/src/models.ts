export interface User {
  id: string;
  name: string;
}

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
  driver: User;
  notifiedDrivers?: { [key: string]: boolean };
  passenger: User;
  position: Position;
  state: string;
  userId: string;
}

/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as utils from "./utils";
import * as trips from "./trip";

admin.initializeApp();

export const updateTrip = functions.database
  .ref("/trips/{tripId}")
  .onUpdate((change, context) => {
    const before = change.before.val() as trips.Trip;
    const after = change.after.val() as trips.Trip;
    const tripId = context.params.tripId as string;
    let updates = null;

    if (before.state === after.state) {
      console.log(`Trip state dind't change`, after.state);
      return null;
    }

    if (after.state === trips.TripState.CANCEL) {
      updates = trips.cancel(before, after, tripId);
    } else if (after.state === trips.TripState.ACCEPTED) {
      updates = trips.take(before, after, tripId);
    }

    return admin
      .database()
      .ref()
      .update(updates);
  });

export const notifyDrivers = functions.database
  .ref("/trips/{tripId}")
  .onCreate(async (snapshot, context) => {
    const original = snapshot.val();
    const passengerId = original.userId;
    const tripId = context.params.tripId as string;

    console.log("Creating new trip", tripId, original);

    const drivers = await admin
      .database()
      .ref("drivers")
      .limitToFirst(10)
      .once("value");

    const driversIds = [];

    drivers.forEach(snap => {
      driversIds.push(snap.key);
      return true;
    });

    const insertions = {};

    for (const driverId of driversIds) {
      insertions[`/tripsByDrivers/${driverId}/${tripId}`] = original;
    }

    insertions[`/trips/${tripId}/notifiedDrivers`] = utils.arrayToObject(
      driversIds
    );

    insertions[`/tripsByPassengers/${passengerId}/${tripId}`] = original;

    console.log("Notify updates", insertions);

    return admin
      .database()
      .ref()
      .update(insertions);
  });

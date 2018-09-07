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
'use strict';

import * as functions from 'firebase-functions'

// if you need to use the Firebase Admin SDK, uncomment the following:
import * as admin from 'firebase-admin'
admin.initializeApp()

const arrayToObject = (sources: string[]) => {
    const target: { [key:string]: boolean } = {}

    for (const current of sources) {
        target[current] = true
    }

    return target
}

// Create and Deploy Cloud Function with TypeScript using script that is
// defined in functions/package.json:
//    cd functions
//    npm run deploy

export const notifyDrivers = functions.database.ref('/trips/{tripId}')
    .onCreate(async (snapshot, context) => {
        const original = snapshot.val()
        const passengerId = original.userId
        const tripId = context.params.tripId as string

        console.log('Creating new trip', tripId, original)

        const drivers = await admin.database()
                             .ref('drivers')
                             .limitToFirst(10)
                             .once('value')

        const driversIds = []
        
        drivers.forEach(snapshot => {
            driversIds.push(snapshot.key)
            return true
        })

        const insertions = {}

        for (const driverId of driversIds) {
            insertions[`/tripsByDrivers/${driverId}/${tripId}`] = original
        }

        insertions[`/trips/${tripId}/notifiedDrivers`] = arrayToObject(driversIds)
        insertions[`/tripsByPassengers/${passengerId}/${tripId}`] = original

        console.log('Notify updates', insertions)

        return admin.database().ref().update(insertions)
    })

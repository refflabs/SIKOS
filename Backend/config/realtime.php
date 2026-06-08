<?php

/**
 * Realtime event contract — keep in sync with realtime-server/src/events.js
 */
return [

    'envelope_version' => 1,

    'events' => [
        'booking_created'        => 'booking:created',
        'booking_status_changed' => 'booking:status_changed',
        'bookings_updated'       => 'bookings:updated',
        'room_updated'           => 'room:updated',
    ],

    'channels' => [
        'public' => 'public',
        'admin'  => 'admin',
    ],

];

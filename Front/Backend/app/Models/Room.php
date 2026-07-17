<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'price',
        'status',
        'description',
        'image',
        'facilities',
        'floor',
        'size',
        'capacity',
        'stock',
    ];

    protected $casts = [
        'facilities' => 'array',
        'price' => 'decimal:2',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}

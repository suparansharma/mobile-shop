<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'discount_amount',
        'coupon_id',
        'shipping_address_id',
        'billing_address_id',
        'payment_method',
        'payment_status',
        'order_status',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'division',
        'district',
        'upazila',
        'delivery_area',
        'delivery_charge',
    ];    

    
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Attribute;
use Illuminate\Database\Seeder;

class AttributeSeeder extends Seeder
{
    public function run()
    {
        $attributes = [
            'RAM' => ['4GB', '6GB', '8GB', '12GB', '16GB'],
            'Storage' => ['64GB', '128GB', '256GB', '512GB', '1TB'],
            'Color' => ['Black', 'White', 'Blue', 'Silver', 'Green', 'Gold', 'Purple', 'Titanium'],
            'Condition' => ['Official', 'Unofficial', 'Used', 'Refurbished'],
            'Warranty' => ['No Warranty', '7 Days Replacement', '1 Month', '6 Months', '1 Year'],
            'Network' => ['3G', '4G', '5G'],
            'SIM' => ['Single SIM', 'Dual SIM', 'eSIM'],
            'Operating System' => ['Android 12', 'Android 13', 'Android 14', 'iOS 15', 'iOS 16', 'iOS 17'],
            'Battery Capacity' => ['3000 mAh', '4000 mAh', '4500 mAh', '5000 mAh', '6000 mAh'],
            'Display Size' => ['5.5 inch', '6.1 inch', '6.4 inch', '6.7 inch', '6.8 inch'],
            'Refresh Rate' => ['60Hz', '90Hz', '120Hz', '144Hz'],
            'Charging Speed' => ['15W', '20W', '25W', '33W', '45W', '67W', '120W'],
        ];

        foreach ($attributes as $name => $values) {
            $attribute = Attribute::firstOrCreate(['name' => $name], ['status' => true]);
            
            // Sync values
            $attribute->values()->delete();
            foreach ($values as $value) {
                $attribute->values()->create(['value' => $value]);
            }
        }
    }
}

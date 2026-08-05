<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateOrdersTableForCheckout extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE orders MODIFY user_id bigint unsigned NULL');
        
        Schema::table('orders', function (Blueprint $table) {
            
            $table->string('customer_name')->after('user_id')->nullable();
            $table->string('customer_phone')->after('customer_name')->nullable();
            $table->string('customer_email')->after('customer_phone')->nullable();
            $table->text('customer_address')->after('customer_email')->nullable();
            $table->string('division')->after('customer_address')->nullable();
            $table->string('district')->after('division')->nullable();
            $table->string('upazila')->after('district')->nullable();
            
            $table->string('delivery_area')->after('payment_status')->default('inside_city');
            $table->decimal('delivery_charge', 10, 2)->after('delivery_area')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE orders MODIFY user_id bigint unsigned NOT NULL');
        
        Schema::table('orders', function (Blueprint $table) {
            
            $table->dropColumn([
                'customer_name',
                'customer_phone',
                'customer_email',
                'customer_address',
                'division',
                'district',
                'upazila',
                'delivery_area',
                'delivery_charge',
            ]);
        });
    }
}

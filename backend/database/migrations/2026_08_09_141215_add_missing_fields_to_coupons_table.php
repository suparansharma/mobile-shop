<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMissingFieldsToCouponsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->string('name')->after('code');
            $table->text('description')->nullable()->after('name');
            $table->decimal('max_discount', 10, 2)->nullable()->after('min_spend');
            $table->integer('usage_limit')->nullable()->after('max_discount');
            $table->integer('used_count')->default(0)->after('usage_limit');
            $table->integer('per_customer_limit')->nullable()->after('used_count');
            $table->timestamp('starts_at')->nullable()->after('per_customer_limit');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'description',
                'max_discount',
                'usage_limit',
                'used_count',
                'per_customer_limit',
                'starts_at'
            ]);
        });
    }
}

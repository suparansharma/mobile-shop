<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsedPhoneDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('used_phone_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('imei')->nullable();
            $table->integer('battery_health')->nullable();
            $table->string('physical_condition')->nullable();
            $table->text('accessories_included')->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('warranty_remaining')->nullable();
            $table->text('repair_history')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('used_phone_details');
    }
}

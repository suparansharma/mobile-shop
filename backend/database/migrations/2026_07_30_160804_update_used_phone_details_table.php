<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateUsedPhoneDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('used_phone_details', function (Blueprint $table) {
            $table->dropColumn(['physical_condition', 'accessories_included']);
            
            $table->string('screen_condition')->nullable();
            $table->string('frame_condition')->nullable();
            $table->string('back_panel_condition')->nullable();
            $table->boolean('face_id')->default(true)->nullable();
            $table->boolean('fingerprint')->default(true)->nullable();
            $table->boolean('original_box')->default(false)->nullable();
            $table->boolean('original_charger')->default(false)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('used_phone_details', function (Blueprint $table) {
            $table->string('physical_condition')->nullable();
            $table->text('accessories_included')->nullable();
            
            $table->dropColumn([
                'screen_condition',
                'frame_condition',
                'back_panel_condition',
                'face_id',
                'fingerprint',
                'original_box',
                'original_charger'
            ]);
        });
    }
}

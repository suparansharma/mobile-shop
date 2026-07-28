<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDetailsToBrandsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('cover_image')->nullable();
            $table->text('short_description')->nullable();
            $table->string('website')->nullable();
            $table->string('country')->nullable();
            $table->integer('established_year')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->boolean('status')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn([
                'cover_image', 'short_description', 'website', 'country', 
                'established_year', 'is_featured', 'sort_order', 
                'seo_title', 'seo_description', 'status'
            ]);
        });
    }
}

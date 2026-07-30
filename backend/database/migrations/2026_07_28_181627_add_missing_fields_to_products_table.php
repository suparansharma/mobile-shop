<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMissingFieldsToProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('barcode')->nullable()->after('sku');
            $table->boolean('is_popular')->default(false)->after('is_trending');
            $table->boolean('is_best_seller')->default(false)->after('is_popular');
            $table->timestamp('publish_date')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['barcode', 'is_popular', 'is_best_seller', 'publish_date']);
        });
    }
}

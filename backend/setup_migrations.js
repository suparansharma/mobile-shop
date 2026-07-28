const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'database', 'migrations');
const files = fs.readdirSync(migrationsDir);

const schemas = {
  'users': `$table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->enum('role', ['super_admin', 'admin', 'customer'])->default('customer');
            $table->boolean('status')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();`,
  'categories': `$table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->boolean('status')->default(true);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();`,
  'sub_categories': `$table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();`,
  'brands': `$table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->timestamps();`,
  'products': `$table->id();
            $table->enum('type', ['new', 'used', 'accessory']);
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->text('short_description')->nullable();
            $table->longText('long_description')->nullable();
            $table->json('specifications')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('sub_category_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('price', 10, 2);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->boolean('status')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->integer('views')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
            $table->softDeletes();`,
  'used_phone_details': `$table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('imei')->nullable();
            $table->integer('battery_health')->nullable();
            $table->string('physical_condition')->nullable();
            $table->text('accessories_included')->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('warranty_remaining')->nullable();
            $table->text('repair_history')->nullable();
            $table->timestamps();`,
  'attributes': `$table->id();
            $table->string('name');
            $table->timestamps();`,
  'product_attributes': `$table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('attribute_id')->constrained()->onDelete('cascade');
            $table->string('value');
            $table->decimal('additional_price', 10, 2)->default(0);
            $table->timestamps();`,
  'product_images': `$table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('image_path');
            $table->boolean('is_thumbnail')->default(false);
            $table->timestamps();`,
  'orders': `$table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('order_number')->unique();
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->foreignId('coupon_id')->nullable();
            $table->foreignId('shipping_address_id')->nullable();
            $table->foreignId('billing_address_id')->nullable();
            $table->string('payment_method');
            $table->string('payment_status');
            $table->enum('order_status', ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned', 'refund'])->default('pending');
            $table->timestamps();`,
  'order_items': `$table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();`,
  'coupons': `$table->id();
            $table->string('code')->unique();
            $table->enum('type', ['fixed', 'percent']);
            $table->decimal('value', 10, 2);
            $table->decimal('min_spend', 10, 2)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();`,
  'reviews': `$table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('rating');
            $table->text('comment')->nullable();
            $table->boolean('status')->default(false);
            $table->timestamps();`,
  'addresses': `$table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['shipping', 'billing']);
            $table->string('name');
            $table->string('phone');
            $table->text('address');
            $table->string('city');
            $table->string('zone')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();`,
  'wishlists': `$table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->timestamps();`,
  'settings': `$table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();`
};

files.forEach(file => {
  if (file.endsWith('.php')) {
    let content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    const match = file.match(/create_(.*)_table/);
    if (match) {
      const tableName = match[1];
      if (schemas[tableName]) {
        // Find Schema::create up to the closure
        let startStr = "Schema::create('" + tableName + "', function (Blueprint $table) {";
        let startIndex = content.indexOf(startStr);
        if (startIndex !== -1) {
            let endIndex = content.indexOf('});', startIndex);
            if (endIndex !== -1) {
                let newContent = content.substring(0, startIndex + startStr.length) + "\\n            " + schemas[tableName] + "\\n        " + content.substring(endIndex);
                fs.writeFileSync(path.join(migrationsDir, file), newContent, 'utf8');
                console.log('Updated ' + file);
            }
        }
      }
    }
  }
});

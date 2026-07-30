<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            \App\Repositories\Contracts\BrandRepositoryInterface::class,
            \App\Repositories\Eloquent\BrandRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\AttributeRepositoryInterface::class,
            \App\Repositories\Eloquent\AttributeRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\TagRepositoryInterface::class,
            \App\Repositories\Eloquent\TagRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\ProductRepositoryInterface::class,
            \App\Repositories\Eloquent\ProductRepository::class
        );
        
        $this->app->bind(
            \App\Repositories\Contracts\CategoryRepositoryInterface::class,
            \App\Repositories\CategoryRepository::class
        );
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}

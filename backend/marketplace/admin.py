from django.contrib import admin
from .models import Enquiry, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'seller',
        'category',
        'price',
        'original_price',
        'stock_quantity',
        'is_available',
        'created_at',
    )
    list_filter = ('category', 'is_available', 'is_customizable')
    search_fields = ('name', 'description', 'material', 'location', 'seller__email')
    inlines = [ProductImageInline]


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'buyer', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('product__name', 'buyer__email', 'message')
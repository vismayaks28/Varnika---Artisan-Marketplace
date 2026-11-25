from django.contrib import admin
from .models import Address, Cart, CartItem, Order, OrderItem, Payment, WishlistItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'seller', 'product_name', 'unit_price', 'quantity', 'line_total')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'buyer', 'total_amount', 'status', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status')
    search_fields = ('order_number', 'buyer__email', 'shipping_full_name')
    inlines = [OrderItemInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('gateway_order_id', 'order', 'amount', 'mode', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'mode')


admin.site.register(WishlistItem)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Address)
from decimal import Decimal
import uuid
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from marketplace.models import Product


class WishlistItem(models.Model):
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist_items',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='wishlisted_by',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('buyer', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.buyer.email} -> {self.product.name}"


class Cart(models.Model):
    buyer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
    )
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(
            (item.product.price * item.quantity for item in self.items.select_related('product').all()),
            Decimal('0.00'),
        )

    @property
    def total_savings(self):
        savings = Decimal('0.00')
        for item in self.items.select_related('product').all():
            if item.product.has_active_offer:
                savings += (item.product.original_price - item.product.price) * item.quantity
        return savings

    def __str__(self):
        return f"Cart ({self.buyer.email})"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['-added_at']

    @property
    def line_total(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Address(models.Model):
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='addresses',
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    house_building = models.CharField(max_length=200)
    street = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=12)
    country = models.CharField(max_length=80, default='India')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Addresses'
        ordering = ['-is_default', '-created_at']

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(buyer=self.buyer, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.state} ({self.pincode})"


def generate_order_number():
    return f"VRN-{uuid.uuid4().hex[:8].upper()}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        PROCESSING = 'processing', 'Processing'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Payment Pending'
        TEST_PAID = 'test_paid', 'Paid (Test Mode)'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Payment Failed'

    order_number = models.CharField(max_length=24, unique=True, default=generate_order_number)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders',
    )
    # Delivery address snapshot at time of order
    shipping_full_name = models.CharField(max_length=150)
    shipping_phone = models.CharField(max_length=20)
    shipping_house_building = models.CharField(max_length=200)
    shipping_street = models.CharField(max_length=200)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_pincode = models.CharField(max_length=12)
    shipping_country = models.CharField(max_length=80, default='India')

    # Financial breakdown
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    payment_method = models.CharField(max_length=40, default='razorpay_test')
    payment_reference = models.CharField(max_length=120, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', 'created_at']),
            models.Index(fields=['order_number']),
        ]

    def __str__(self):
        return f"Order {self.order_number} ({self.buyer.email})"


class OrderItem(models.Model):
    class ItemStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        PROCESSING = 'processing', 'Processing'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items',
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sold_items',
    )
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=ItemStatus.choices,
        default=ItemStatus.PENDING,
    )
    tracking_note = models.CharField(max_length=255, blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        indexes = [
            models.Index(fields=['seller', 'status']),
        ]

    def __str__(self):
        return f"{self.order.order_number} - {self.product_name} (x{self.quantity})"


class Payment(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment',
    )
    provider = models.CharField(max_length=40, default='razorpay')
    mode = models.CharField(max_length=20, default='test')
    gateway_order_id = models.CharField(max_length=120, unique=True)
    gateway_payment_id = models.CharField(max_length=120, blank=True, default='')
    gateway_signature = models.CharField(max_length=255, blank=True, default='')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment {self.gateway_order_id} ({'Verified' if self.is_verified else 'Unverified'})"
from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('pottery', 'Pottery & Ceramics'),
        ('textiles', 'Textiles & Handloom'),
        ('decor', 'Home Decor'),
        ('woodwork', 'Woodwork & Carving'),
        ('metalwork', 'Metalwork & Brass'),
        ('jewelry', 'Handcrafted Jewellery'),
        ('leather', 'Leather Craft'),
        ('painting', 'Paintings & Folk Art'),
        ('basketry', 'Basketry & Natural Fibers'),
        ('stonecraft', 'Stone & Marble Craft'),
        ('other', 'Other Handmade Crafts'),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
    )
    name = models.CharField(max_length=200)
    short_description = models.CharField(max_length=300, blank=True, default='')
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')

    # Pricing & Genuine Offers
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    offer_label = models.CharField(max_length=100, blank=True, default='')
    offer_start = models.DateField(null=True, blank=True)
    offer_end = models.DateField(null=True, blank=True)

    # Inventory & Availability
    stock_quantity = models.PositiveIntegerField(default=10)
    sku = models.CharField(max_length=64, blank=True, default='')
    is_available = models.BooleanField(default=True)

    # Craft Specifications
    material = models.CharField(max_length=150, blank=True, default='')
    craft_technique = models.CharField(max_length=150, blank=True, default='')
    dimensions = models.CharField(max_length=120, blank=True, default='')
    weight = models.CharField(max_length=80, blank=True, default='')
    color = models.CharField(max_length=80, blank=True, default='')
    care_instructions = models.TextField(blank=True, default='')
    is_customizable = models.BooleanField(default=False)

    # Origin & Fulfillment
    location = models.CharField(max_length=150)
    processing_time = models.CharField(max_length=100, blank=True, default='')
    shipping_info = models.TextField(blank=True, default='')
    return_policy = models.CharField(max_length=255, blank=True, default='')

    # Media
    image = models.ImageField(upload_to='products/%Y/%m/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', 'is_available']),
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['price']),
        ]

    @property
    def in_stock(self):
        return self.is_available and self.stock_quantity > 0

    @property
    def has_active_offer(self):
        if not self.original_price or self.original_price <= self.price:
            return False
        today = timezone.localdate()
        if self.offer_start and today < self.offer_start:
            return False
        if self.offer_end and today > self.offer_end:
            return False
        return True

    @property
    def discount_percentage(self):
        if not self.has_active_offer:
            return 0
        diff = self.original_price - self.price
        return int(round((diff / self.original_price) * 100))

    def __str__(self):
        return f"{self.name} by {self.seller.get_full_name()}"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='additional_images',
    )
    image = models.ImageField(upload_to='products/gallery/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Gallery image for {self.product.name}"


class Enquiry(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_enquiries',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='enquiries',
    )
    message = models.TextField()
    seller_response = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Enquiries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'status']),
            models.Index(fields=['buyer', 'created_at']),
        ]

    def __str__(self):
        return f"Enquiry #{self.id} on {self.product.name} ({self.status})"
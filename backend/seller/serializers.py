from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers
from accounts.models import SellerProfile
from marketplace.models import Enquiry, Product, ProductImage
from marketplace.serializers import ProductImageSerializer
from orders.models import Order, OrderItem

ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_uploaded_image(image):
    if image.size > MAX_IMAGE_SIZE:
        raise serializers.ValidationError('Image file size must not exceed 5 MB.')
    content_type = getattr(image, 'content_type', None)
    if content_type and content_type not in ALLOWED_IMAGE_TYPES:
        raise serializers.ValidationError('Only JPEG, PNG, and WebP images are supported.')
    return image


class SellerProductSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)
    enquiry_count = serializers.IntegerField(source='enquiries.count', read_only=True)
    has_active_offer = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'short_description',
            'description',
            'category',
            'category_display',
            'price',
            'original_price',
            'offer_label',
            'offer_start',
            'offer_end',
            'has_active_offer',
            'discount_percentage',
            'stock_quantity',
            'sku',
            'is_available',
            'material',
            'craft_technique',
            'dimensions',
            'weight',
            'color',
            'care_instructions',
            'is_customizable',
            'location',
            'processing_time',
            'shipping_info',
            'return_policy',
            'image',
            'additional_images',
            'enquiry_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'category_display',
            'additional_images',
            'enquiry_count',
            'has_active_offer',
            'discount_percentage',
        ]

    def validate_price(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError('Selling price must be greater than zero.')
        return value

    def validate(self, attrs):
        price = attrs.get('price', getattr(self.instance, 'price', None))
        original_price = attrs.get('original_price', getattr(self.instance, 'original_price', None))
        offer_start = attrs.get('offer_start', getattr(self.instance, 'offer_start', None))
        offer_end = attrs.get('offer_end', getattr(self.instance, 'offer_end', None))

        if original_price is not None and price is not None and original_price <= price:
            raise serializers.ValidationError(
                {'original_price': 'Original price must be strictly higher than the selling price.'}
            )
        if offer_start and offer_end and offer_end < offer_start:
            raise serializers.ValidationError(
                {'offer_end': 'Offer end date cannot be earlier than the offer start date.'}
            )
        return attrs

    def validate_image(self, value):
        return validate_uploaded_image(value)

    def _save_additional_images(self, product):
        request = self.context.get('request')
        if request and hasattr(request, 'FILES'):
            extra_files = request.FILES.getlist('gallery_images')
            for img_file in extra_files[:5]:
                validate_uploaded_image(img_file)
                ProductImage.objects.create(product=product, image=img_file)

    def create(self, validated_data):
        product = Product.objects.create(**validated_data)
        self._save_additional_images(product)
        return product

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._save_additional_images(instance)
        return instance


class SellerOrderItemSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    order_date = serializers.DateTimeField(source='order.created_at', read_only=True)
    payment_status = serializers.CharField(source='order.payment_status', read_only=True)
    buyer_name = serializers.CharField(source='order.shipping_full_name', read_only=True)
    buyer_phone = serializers.CharField(source='order.shipping_phone', read_only=True)
    shipping_address = serializers.SerializerMethodField()
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'order_number',
            'order_date',
            'payment_status',
            'product',
            'product_name',
            'product_image',
            'quantity',
            'unit_price',
            'line_total',
            'status',
            'tracking_note',
            'buyer_name',
            'buyer_phone',
            'shipping_address',
            'updated_at',
        ]

    def get_shipping_address(self, obj):
        o = obj.order
        return (
            f"{o.shipping_house_building}, {o.shipping_street}, "
            f"{o.shipping_city}, {o.shipping_state} - {o.shipping_pincode}, {o.shipping_country}"
        )


class SellerOrderItemStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['status', 'tracking_note']

    def validate(self, attrs):
        current = self.instance.status
        new_status = attrs.get('status', current)
        allowed = {
            OrderItem.ItemStatus.PENDING: [OrderItem.ItemStatus.CONFIRMED, OrderItem.ItemStatus.CANCELLED],
            OrderItem.ItemStatus.CONFIRMED: [OrderItem.ItemStatus.PROCESSING, OrderItem.ItemStatus.CANCELLED],
            OrderItem.ItemStatus.PROCESSING: [OrderItem.ItemStatus.SHIPPED],
            OrderItem.ItemStatus.SHIPPED: [OrderItem.ItemStatus.DELIVERED],
            OrderItem.ItemStatus.DELIVERED: [],
            OrderItem.ItemStatus.CANCELLED: [],
        }
        if new_status != current and new_status not in allowed.get(current, []):
            raise serializers.ValidationError(
                {'status': f"Cannot transition order item from '{current}' to '{new_status}'."}
            )
        return attrs

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        if 'tracking_note' in validated_data:
            instance.tracking_note = validated_data['tracking_note'].strip()
        instance.save()

        # Sync parent Order status when all items share a unified status
        parent_order = instance.order
        item_statuses = set(parent_order.items.values_list('status', flat=True))
        if len(item_statuses) == 1:
            sole_status = item_statuses.pop()
            parent_order.status = sole_status
            parent_order.save(update_fields=['status', 'updated_at'])
        return instance


class SellerEnquirySerializer(serializers.ModelSerializer):
    buyer_name = serializers.SerializerMethodField()
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    buyer_phone = serializers.CharField(source='buyer.phone', read_only=True)
    buyer_location = serializers.CharField(source='buyer.location', read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            'id',
            'product_id',
            'product_name',
            'product_price',
            'product_image',
            'buyer_name',
            'buyer_email',
            'buyer_phone',
            'buyer_location',
            'message',
            'seller_response',
            'status',
            'responded_at',
            'created_at',
            'updated_at',
        ]

    def get_buyer_name(self, obj):
        return obj.buyer.get_full_name().strip() or obj.buyer.email


class SellerEnquiryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ['status', 'seller_response']

    def validate(self, attrs):
        instance = self.instance
        new_status = attrs.get('status', instance.status)
        current_status = instance.status

        valid_transitions = {
            Enquiry.Status.PENDING: [Enquiry.Status.ACCEPTED, Enquiry.Status.REJECTED],
            Enquiry.Status.ACCEPTED: [Enquiry.Status.COMPLETED],
            Enquiry.Status.REJECTED: [],
            Enquiry.Status.COMPLETED: [],
        }

        if new_status != current_status and new_status not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                {'status': f"Cannot transition enquiry from '{current_status}' to '{new_status}'."}
            )
        return attrs

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        if 'seller_response' in validated_data:
            instance.seller_response = validated_data['seller_response'].strip()
        if instance.seller_response or instance.status != Enquiry.Status.PENDING:
            instance.responded_at = timezone.now()
        instance.save()
        return instance
from decimal import Decimal
from django.db import transaction
from django.db.models import F
from django.utils import timezone
import uuid
from rest_framework import serializers
from marketplace.models import Product
from marketplace.serializers import PublicProductListSerializer
from .models import Address, Cart, CartItem, Order, OrderItem, Payment, WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    product_detail = PublicProductListSerializer(source='product', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_detail', 'created_at']
        read_only_fields = ['id', 'created_at', 'product_detail']


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = PublicProductListSerializer(source='product', read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'line_total', 'added_at']
        read_only_fields = ['id', 'product_detail', 'line_total', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_savings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    shipping_charge = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'items',
            'total_items',
            'subtotal',
            'total_savings',
            'shipping_charge',
            'total_amount',
            'updated_at',
        ]

    def get_shipping_charge(self, obj):
        if obj.total_items == 0:
            return Decimal('0.00')
        # Standard Indian artisan flat shipping; free above INR 2000
        return Decimal('0.00') if obj.subtotal >= Decimal('2000.00') else Decimal('99.00')

    def get_total_amount(self, obj):
        return obj.subtotal + self.get_shipping_charge(obj)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'full_name',
            'phone',
            'house_building',
            'street',
            'city',
            'state',
            'pincode',
            'country',
            'is_default',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_pincode(self, value):
        cleaned = value.strip()
        if len(cleaned) < 5:
            raise serializers.ValidationError('Enter a valid PIN code.')
        return cleaned


class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.ImageField(source='product.image', read_only=True)
    brand_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_image',
            'brand_name',
            'unit_price',
            'quantity',
            'line_total',
            'status',
            'tracking_note',
            'updated_at',
        ]

    def get_brand_name(self, obj):
        profile = getattr(obj.seller, 'seller_profile', None)
        return profile.brand_name if profile else (obj.seller.get_full_name().strip() or 'Artisan Studio')


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'provider',
            'mode',
            'gateway_order_id',
            'gateway_payment_id',
            'amount',
            'currency',
            'is_verified',
            'created_at',
            'verified_at',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'shipping_full_name',
            'shipping_phone',
            'shipping_house_building',
            'shipping_street',
            'shipping_city',
            'shipping_state',
            'shipping_pincode',
            'shipping_country',
            'subtotal',
            'shipping_charge',
            'discount_amount',
            'total_amount',
            'status',
            'payment_status',
            'payment_method',
            'payment_reference',
            'items',
            'payment',
            'created_at',
            'updated_at',
        ]


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=False, allow_null=True)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    house_building = serializers.CharField(max_length=200, required=False, allow_blank=True)
    street = serializers.CharField(max_length=200, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=12, required=False, allow_blank=True)
    country = serializers.CharField(max_length=80, default='India')
    save_address = serializers.BooleanField(default=True)
    payment_method = serializers.ChoiceField(
        choices=['razorpay_test', 'cod_pending'],
        default='razorpay_test',
    )

    def validate(self, attrs):
        buyer = self.context['request'].user
        address_id = attrs.get('address_id')

        if address_id:
            try:
                address = Address.objects.get(id=address_id, buyer=buyer)
                attrs['resolved_address'] = {
                    'full_name': address.full_name,
                    'phone': address.phone,
                    'house_building': address.house_building,
                    'street': address.street,
                    'city': address.city,
                    'state': address.state,
                    'pincode': address.pincode,
                    'country': address.country,
                }
            except Address.DoesNotExist:
                raise serializers.ValidationError({'address_id': 'Selected delivery address was not found.'})
        else:
            required_fields = ['full_name', 'phone', 'house_building', 'street', 'city', 'state', 'pincode']
            missing = [f for f in required_fields if not attrs.get(f, '').strip()]
            if missing:
                raise serializers.ValidationError(
                    {'non_field_errors': [f'Please complete delivery address fields: {", ".join(missing)}.']}
                )
            attrs['resolved_address'] = {
                'full_name': attrs['full_name'].strip(),
                'phone': attrs['phone'].strip(),
                'house_building': attrs['house_building'].strip(),
                'street': attrs['street'].strip(),
                'city': attrs['city'].strip(),
                'state': attrs['state'].strip(),
                'pincode': attrs['pincode'].strip(),
                'country': attrs.get('country', 'India').strip() or 'India',
            }

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        buyer = self.context['request'].user
        cart, _ = Cart.objects.get_or_create(buyer=buyer)
        cart_items = list(cart.items.select_related('product', 'product__seller').all())

        if not cart_items:
            raise serializers.ValidationError({'non_field_errors': ['Your shopping cart is empty.']})

        # Lock product rows to prevent negative stock under concurrent checkouts
        product_ids = [ci.product_id for ci in cart_items]
        locked_products = {
            p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        subtotal = Decimal('0.00')
        discount_amount = Decimal('0.00')

        for ci in cart_items:
            product = locked_products[ci.product_id]
            if not product.is_available or product.stock_quantity < ci.quantity:
                raise serializers.ValidationError(
                    {
                        'non_field_errors': [
                            f'Insufficient stock for "{product.name}". Available: {product.stock_quantity}.'
                        ]
                    }
                )
            subtotal += product.price * ci.quantity
            if product.has_active_offer:
                discount_amount += (product.original_price - product.price) * ci.quantity

        shipping_charge = Decimal('0.00') if subtotal >= Decimal('2000.00') else Decimal('99.00')
        total_amount = subtotal + shipping_charge

        addr = validated_data['resolved_address']
        if not validated_data.get('address_id') and validated_data.get('save_address', True):
            Address.objects.create(
                buyer=buyer,
                is_default=not Address.objects.filter(buyer=buyer).exists(),
                **addr,
            )

        payment_method = validated_data['payment_method']
        order = Order.objects.create(
            buyer=buyer,
            shipping_full_name=addr['full_name'],
            shipping_phone=addr['phone'],
            shipping_house_building=addr['house_building'],
            shipping_street=addr['street'],
            shipping_city=addr['city'],
            shipping_state=addr['state'],
            shipping_pincode=addr['pincode'],
            shipping_country=addr['country'],
            subtotal=subtotal,
            shipping_charge=shipping_charge,
            discount_amount=discount_amount,
            total_amount=total_amount,
            status=Order.Status.PENDING,
            payment_status=Order.PaymentStatus.PENDING,
            payment_method=payment_method,
        )

        for ci in cart_items:
            product = locked_products[ci.product_id]
            line_total = product.price * ci.quantity
            OrderItem.objects.create(
                order=order,
                product=product,
                seller=product.seller,
                product_name=product.name,
                unit_price=product.price,
                quantity=ci.quantity,
                line_total=line_total,
                status=OrderItem.ItemStatus.PENDING,
            )
            product.stock_quantity = F('stock_quantity') - ci.quantity
            product.save(update_fields=['stock_quantity'])

        gateway_order_id = f"order_test_{uuid.uuid4().hex[:14]}"
        Payment.objects.create(
            order=order,
            provider='razorpay' if payment_method == 'razorpay_test' else 'offline_cod',
            mode='test',
            gateway_order_id=gateway_order_id,
            amount=total_amount,
            currency='INR',
            is_verified=False,
        )

        # Clear cart after atomic order creation
        cart.items.all().delete()
        return order
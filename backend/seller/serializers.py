from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers
from marketplace.models import Enquiry, Product, ProductImage
from marketplace.serializers import ProductImageSerializer

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

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'category',
            'category_display',
            'price',
            'location',
            'image',
            'additional_images',
            'is_available',
            'enquiry_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_display', 'additional_images', 'enquiry_count']

    def validate_price(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError('Price must be greater than zero.')
        return value

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
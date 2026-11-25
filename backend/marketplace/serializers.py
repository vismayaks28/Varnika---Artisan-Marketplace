from rest_framework import serializers
from accounts.models import SellerProfile
from accounts.serializers import PublicBrandSerializer
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'uploaded_at']


def get_brand_summary(seller):
    profile = getattr(seller, 'seller_profile', None)
    if profile:
        return {
            'id': profile.id,
            'brand_name': profile.brand_name,
            'brand_logo': profile.brand_logo.url if profile.brand_logo else None,
            'brand_description': profile.brand_description,
            'craft_specialty': profile.craft_specialty,
            'manufacturing_location': profile.manufacturing_location,
            'years_of_experience': profile.years_of_experience,
            'website_or_social': profile.website_or_social,
            'is_verified': profile.is_approved,
            'artisan_name': seller.get_full_name().strip() or 'Independent Artisan',
        }
    return {
        'id': None,
        'brand_name': seller.get_full_name().strip() or 'Independent Artisan',
        'brand_logo': None,
        'brand_description': seller.bio,
        'craft_specialty': seller.craft_specialty,
        'manufacturing_location': seller.location,
        'years_of_experience': None,
        'website_or_social': '',
        'is_verified': False,
        'artisan_name': seller.get_full_name().strip() or 'Independent Artisan',
    }


class PublicProductListSerializer(serializers.ModelSerializer):
    brand_name = serializers.SerializerMethodField()
    brand_id = serializers.SerializerMethodField()
    is_brand_verified = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    has_active_offer = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'short_description',
            'category',
            'category_display',
            'price',
            'original_price',
            'offer_label',
            'has_active_offer',
            'discount_percentage',
            'stock_quantity',
            'in_stock',
            'is_available',
            'material',
            'location',
            'image',
            'brand_id',
            'brand_name',
            'is_brand_verified',
            'created_at',
        ]

    def get_brand_name(self, obj):
        profile = getattr(obj.seller, 'seller_profile', None)
        return profile.brand_name if profile else (obj.seller.get_full_name().strip() or 'Independent Artisan')

    def get_brand_id(self, obj):
        profile = getattr(obj.seller, 'seller_profile', None)
        return profile.id if profile else None

    def get_is_brand_verified(self, obj):
        profile = getattr(obj.seller, 'seller_profile', None)
        return bool(profile and profile.is_approved)


class PublicProductDetailSerializer(serializers.ModelSerializer):
    brand = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
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
            'has_active_offer',
            'discount_percentage',
            'stock_quantity',
            'in_stock',
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
            'brand',
            'created_at',
            'updated_at',
        ]

    def get_brand(self, obj):
        return get_brand_summary(obj.seller)


class BrandDetailSerializer(PublicBrandSerializer):
    products = serializers.SerializerMethodField()

    class Meta(PublicBrandSerializer.Meta):
        fields = PublicBrandSerializer.Meta.fields + ['products']

    def get_products(self, obj):
        qs = Product.objects.filter(seller=obj.user, is_available=True).order_by('-created_at')
        return PublicProductListSerializer(qs, many=True, context=self.context).data
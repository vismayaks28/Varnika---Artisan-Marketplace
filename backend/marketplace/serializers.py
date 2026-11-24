from rest_framework import serializers
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'uploaded_at']


class PublicProductListSerializer(serializers.ModelSerializer):
    seller_name = serializers.SerializerMethodField()
    seller_location = serializers.CharField(source='seller.location', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'category',
            'category_display',
            'price',
            'location',
            'image',
            'is_available',
            'seller_name',
            'seller_location',
            'created_at',
        ]

    def get_seller_name(self, obj):
        return obj.seller.get_full_name().strip() or obj.seller.email


class PublicProductDetailSerializer(serializers.ModelSerializer):
    seller = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)

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
            'seller',
            'created_at',
            'updated_at',
        ]

    def get_seller(self, obj):
        return {
            'id': obj.seller.id,
            'full_name': obj.seller.get_full_name().strip() or obj.seller.email,
            'location': obj.seller.location,
            'craft_specialty': obj.seller.craft_specialty,
            'bio': obj.seller.bio,
            'phone': obj.seller.phone,
            'date_joined': obj.seller.date_joined,
        }
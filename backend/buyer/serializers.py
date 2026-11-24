from rest_framework import serializers
from marketplace.models import Enquiry, Product


class BuyerEnquirySerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_location = serializers.CharField(source='product.seller.location', read_only=True)
    seller_phone = serializers.SerializerMethodField()

    class Meta:
        model = Enquiry
        fields = [
            'id',
            'product',
            'product_id',
            'product_name',
            'product_price',
            'product_image',
            'seller_name',
            'seller_location',
            'seller_phone',
            'message',
            'seller_response',
            'status',
            'responded_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'seller_response',
            'status',
            'responded_at',
            'created_at',
            'updated_at',
        ]

    def get_seller_name(self, obj):
        return obj.product.seller.get_full_name().strip() or obj.product.seller.email

    def get_seller_phone(self, obj):
        # Share direct seller phone once enquiry is accepted or completed
        if obj.status in [Enquiry.Status.ACCEPTED, Enquiry.Status.COMPLETED]:
            return obj.product.seller.phone
        return None

    def validate_product(self, product):
        if not product.is_available:
            raise serializers.ValidationError('This product is currently unavailable for enquiries.')
        return product

    def validate_message(self, value):
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise serializers.ValidationError('Please enter at least 10 characters describing your enquiry.')
        return cleaned
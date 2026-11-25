from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import SellerProfile, User

ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_verification_file(file_obj, allowed_types):
    if file_obj.size > MAX_FILE_SIZE:
        raise serializers.ValidationError('Uploaded file must not exceed 5 MB.')
    content_type = getattr(file_obj, 'content_type', None)
    if content_type and content_type not in allowed_types:
        raise serializers.ValidationError('Unsupported file format.')
    return file_obj


class SellerProfilePrivateSerializer(serializers.ModelSerializer):
    is_approved = serializers.BooleanField(read_only=True)

    class Meta:
        model = SellerProfile
        fields = [
            'id',
            'brand_name',
            'brand_logo',
            'brand_description',
            'craft_specialty',
            'manufacturing_location',
            'workshop_address',
            'years_of_experience',
            'website_or_social',
            'address',
            'city',
            'state',
            'pincode',
            'identity_document',
            'workshop_evidence',
            'additional_notes',
            'verification_status',
            'admin_notes',
            'is_approved',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'verification_status',
            'admin_notes',
            'is_approved',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]

    def validate_brand_logo(self, value):
        if value:
            return validate_verification_file(value, ALLOWED_LOGO_TYPES)
        return value

    def validate_identity_document(self, value):
        if value:
            return validate_verification_file(value, ALLOWED_DOC_TYPES)
        return value

    def validate_workshop_evidence(self, value):
        if value:
            return validate_verification_file(value, ALLOWED_DOC_TYPES)
        return value


class PublicBrandSerializer(serializers.ModelSerializer):
    artisan_name = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)
    is_verified = serializers.BooleanField(source='is_approved', read_only=True)

    class Meta:
        model = SellerProfile
        fields = [
            'id',
            'brand_name',
            'brand_logo',
            'brand_description',
            'craft_specialty',
            'manufacturing_location',
            'years_of_experience',
            'website_or_social',
            'artisan_name',
            'product_count',
            'is_verified',
            'created_at',
        ]

    def get_artisan_name(self, obj):
        return obj.user.get_full_name().strip() or 'Independent Artisan'


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    seller_profile = SellerProfilePrivateSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'phone',
            'location',
            'craft_specialty',
            'bio',
            'seller_profile',
            'date_joined',
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined', 'full_name', 'seller_profile']

    def get_full_name(self, obj):
        return obj.get_full_name().strip() or obj.email


class BuyerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'password',
            'phone',
            'location',
        ]

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['role'] = User.Role.BUYER
        validated_data['is_staff'] = False
        validated_data['is_superuser'] = False
        return User.objects.create_user(password=password, **validated_data)


class SellerApplicationSerializer(serializers.Serializer):
    # Personal details
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=12)

    # Brand details
    brand_name = serializers.CharField(max_length=150)
    brand_logo = serializers.ImageField(required=False, allow_null=True)
    brand_description = serializers.CharField()
    craft_specialty = serializers.CharField(max_length=150)
    manufacturing_location = serializers.CharField(max_length=150)
    workshop_address = serializers.CharField()
    years_of_experience = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    website_or_social = serializers.URLField(required=False, allow_blank=True, default='')

    # Verification documents
    identity_document = serializers.FileField(required=True)
    workshop_evidence = serializers.FileField(required=False, allow_null=True)
    additional_notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_brand_logo(self, value):
        if value:
            return validate_verification_file(value, ALLOWED_LOGO_TYPES)
        return value

    def validate_identity_document(self, value):
        return validate_verification_file(value, ALLOWED_DOC_TYPES)

    def validate_workshop_evidence(self, value):
        if value:
            return validate_verification_file(value, ALLOWED_DOC_TYPES)
        return value

    @transaction.atomic
    def create(self, validated_data):
        location_str = f"{validated_data['city'].strip()}, {validated_data['state'].strip()}"
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'].strip(),
            last_name=validated_data['last_name'].strip(),
            role=User.Role.SELLER,
            phone=validated_data['phone'].strip(),
            location=location_str,
            craft_specialty=validated_data['craft_specialty'].strip(),
            bio=validated_data['brand_description'].strip(),
            is_staff=False,
            is_superuser=False,
        )
        SellerProfile.objects.create(
            user=user,
            brand_name=validated_data['brand_name'].strip(),
            brand_logo=validated_data.get('brand_logo'),
            brand_description=validated_data['brand_description'].strip(),
            craft_specialty=validated_data['craft_specialty'].strip(),
            manufacturing_location=validated_data['manufacturing_location'].strip(),
            workshop_address=validated_data['workshop_address'].strip(),
            years_of_experience=validated_data.get('years_of_experience'),
            website_or_social=validated_data.get('website_or_social', '').strip(),
            address=validated_data['address'].strip(),
            city=validated_data['city'].strip(),
            state=validated_data['state'].strip(),
            pincode=validated_data['pincode'].strip(),
            identity_document=validated_data['identity_document'],
            workshop_evidence=validated_data.get('workshop_evidence'),
            additional_notes=validated_data.get('additional_notes', '').strip(),
            verification_status=SellerProfile.VerificationStatus.PENDING,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    expected_role = serializers.ChoiceField(
        choices=[User.Role.BUYER, User.Role.SELLER],
        required=False,
    )

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')
        expected_role = attrs.get('expected_role')

        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError({'non_field_errors': ['Invalid email or password.']})
        if not user.is_active:
            raise serializers.ValidationError({'non_field_errors': ['This account has been deactivated.']})
        if expected_role and user.role != expected_role:
            role_label = 'Artisan / Seller' if expected_role == User.Role.SELLER else 'Buyer'
            raise serializers.ValidationError(
                {'non_field_errors': [f'This login portal is for {role_label} accounts only.']}
            )

        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user, context=self.context).data,
        }


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate_new_password(self, value):
        validate_password(value, user=self.context['request'].user)
        return value
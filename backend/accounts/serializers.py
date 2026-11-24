from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

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
            'date_joined',
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name().strip() or obj.email


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[User.Role.SELLER, User.Role.BUYER])

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'password',
            'role',
            'phone',
            'location',
            'craft_specialty',
            'bio',
        ]

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('First name is required.')
        return value.strip()

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Last name is required.')
        return value.strip()

    def validate_phone(self, value):
        cleaned = value.strip()
        if len(cleaned) < 7:
            raise serializers.ValidationError('Enter a valid phone number.')
        return cleaned

    def validate_location(self, value):
        if not value.strip():
            raise serializers.ValidationError('Location is required.')
        return value.strip()

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Explicitly prevent privilege escalation
        validated_data['is_staff'] = False
        validated_data['is_superuser'] = False
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError({'non_field_errors': ['Invalid email or password.']})
        if not user.is_active:
            raise serializers.ValidationError({'non_field_errors': ['This account has been deactivated.']})

        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
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
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('An email address must be provided.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.SELLER)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        SELLER = 'seller', 'Seller'
        BUYER = 'buyer', 'Buyer'

    username = None
    email = models.EmailField('email address', unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.BUYER)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=150)
    craft_specialty = models.CharField(max_length=150, blank=True, default='')
    bio = models.TextField(blank=True, default='')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone', 'location']

    objects = UserManager()

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.role}"


class SellerProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        INFO_REQUIRED = 'info_required', 'Additional Information Required'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='seller_profile',
    )
    # Public brand details
    brand_name = models.CharField(max_length=150)
    brand_logo = models.ImageField(upload_to='brands/logos/%Y/%m/', null=True, blank=True)
    brand_description = models.TextField(blank=True, default='')
    craft_specialty = models.CharField(max_length=150, blank=True, default='')
    manufacturing_location = models.CharField(max_length=150)
    workshop_address = models.TextField(blank=True, default='')
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    website_or_social = models.URLField(blank=True, default='')

    # Private address & verification evidence
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=12, blank=True, default='')
    identity_document = models.FileField(
        upload_to='seller_verification/identity/%Y/%m/',
        null=True,
        blank=True,
    )
    workshop_evidence = models.FileField(
        upload_to='seller_verification/evidence/%Y/%m/',
        null=True,
        blank=True,
    )
    additional_notes = models.TextField(blank=True, default='')

    # Admin verification workflow
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    admin_notes = models.TextField(blank=True, default='')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_approved(self):
        return self.verification_status == self.VerificationStatus.APPROVED

    def __str__(self):
        return f"{self.brand_name} ({self.user.email}) - {self.verification_status}"
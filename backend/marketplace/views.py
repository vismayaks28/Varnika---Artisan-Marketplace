from django.db.models import Count, F, Q
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import SellerProfile
from accounts.serializers import PublicBrandSerializer
from .models import Product
from .serializers import (
    BrandDetailSerializer,
    PublicProductDetailSerializer,
    PublicProductListSerializer,
)


def get_public_products_queryset():
    """Only expose available products from approved sellers (or legacy superuser/pre-profile sellers)."""
    return Product.objects.select_related('seller', 'seller__seller_profile').filter(
        Q(seller__seller_profile__verification_status='approved')
        | Q(seller__seller_profile__isnull=True)
    )


class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        base_qs = get_public_products_queryset().filter(is_available=True)
        counts = dict(base_qs.values_list('category').annotate(total=Count('id')))
        categories = [
            {
                'value': value,
                'label': label,
                'product_count': counts.get(value, 0),
            }
            for value, label in Product.CATEGORY_CHOICES
        ]
        return Response(categories)


class PublicProductListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicProductListSerializer

    def get_queryset(self):
        queryset = get_public_products_queryset()

        in_stock_only = self.request.query_params.get('in_stock', '').strip().lower()
        if in_stock_only == 'true':
            queryset = queryset.filter(is_available=True, stock_quantity__gt=0)
        else:
            queryset = queryset.filter(is_available=True)

        search = self.request.query_params.get('search', '').strip()
        category = self.request.query_params.get('category', '').strip()
        material = self.request.query_params.get('material', '').strip()
        location = self.request.query_params.get('location', '').strip()
        brand_id = self.request.query_params.get('brand', '').strip()
        discounted = self.request.query_params.get('discounted', '').strip().lower()
        min_price = self.request.query_params.get('min_price', '').strip()
        max_price = self.request.query_params.get('max_price', '').strip()
        ordering = self.request.query_params.get('ordering', '-created_at').strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(short_description__icontains=search)
                | Q(description__icontains=search)
                | Q(material__icontains=search)
                | Q(location__icontains=search)
                | Q(seller__seller_profile__brand_name__icontains=search)
                | Q(seller__first_name__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)
        if material:
            queryset = queryset.filter(material__icontains=material)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if brand_id:
            try:
                queryset = queryset.filter(seller__seller_profile__id=int(brand_id))
            except ValueError:
                pass
        if discounted == 'true':
            today = timezone.localdate()
            queryset = queryset.filter(
                original_price__isnull=False,
                original_price__gt=F('price'),
            ).filter(
                Q(offer_start__isnull=True) | Q(offer_start__lte=today),
                Q(offer_end__isnull=True) | Q(offer_end__gte=today),
            )
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        allowed_orderings = {'price', '-price', 'created_at', '-created_at', 'name', '-name'}
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')

        return queryset


class PublicProductDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicProductDetailSerializer

    def get_queryset(self):
        return get_public_products_queryset().prefetch_related('additional_images')


class PublicBrandListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicBrandSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            SellerProfile.objects.filter(verification_status=SellerProfile.VerificationStatus.APPROVED)
            .select_related('user')
            .annotate(product_count=Count('user__products', filter=Q(user__products__is_available=True)))
            .order_by('-created_at')
        )


class PublicBrandDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = BrandDetailSerializer

    def get_queryset(self):
        return (
            SellerProfile.objects.filter(verification_status=SellerProfile.VerificationStatus.APPROVED)
            .select_related('user')
            .annotate(product_count=Count('user__products', filter=Q(user__products__is_available=True)))
        )
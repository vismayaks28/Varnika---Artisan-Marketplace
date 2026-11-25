from decimal import Decimal
from django.db.models import Count, Q, Sum
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import SellerProfile
from accounts.permissions import IsApprovedSeller, IsSeller
from accounts.serializers import SellerProfilePrivateSerializer
from marketplace.models import Enquiry, Product, ProductImage
from orders.models import OrderItem
from .permissions import IsEnquiryProductOwner, IsProductOwner
from .serializers import (
    SellerEnquirySerializer,
    SellerEnquiryStatusSerializer,
    SellerOrderItemSerializer,
    SellerOrderItemStatusSerializer,
    SellerProductSerializer,
)


class SellerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]

    def get(self, request):
        user = request.user
        seller_profile = getattr(user, 'seller_profile', None)

        product_stats = Product.objects.filter(seller=user).aggregate(
            total_products=Count('id'),
            available_products=Count('id', filter=Q(is_available=True)),
            low_stock_products=Count('id', filter=Q(is_available=True, stock_quantity__lte=3)),
        )
        enquiry_stats = Enquiry.objects.filter(product__seller=user).aggregate(
            total_enquiries=Count('id'),
            pending_enquiries=Count('id', filter=Q(status=Enquiry.Status.PENDING)),
            accepted_enquiries=Count('id', filter=Q(status=Enquiry.Status.ACCEPTED)),
            completed_enquiries=Count('id', filter=Q(status=Enquiry.Status.COMPLETED)),
            rejected_enquiries=Count('id', filter=Q(status=Enquiry.Status.REJECTED)),
        )
        order_stats = OrderItem.objects.filter(seller=user).aggregate(
            total_orders=Count('order', distinct=True),
            pending_orders=Count(
                'id',
                filter=Q(status__in=[OrderItem.ItemStatus.PENDING, OrderItem.ItemStatus.CONFIRMED]),
            ),
            completed_orders=Count('id', filter=Q(status=OrderItem.ItemStatus.DELIVERED)),
            total_sales=Sum(
                'line_total',
                filter=~Q(status=OrderItem.ItemStatus.CANCELLED),
            ),
        )

        recent_orders = (
            OrderItem.objects.filter(seller=user)
            .select_related('order', 'product')
            .order_by('-order__created_at')[:5]
        )
        recent_enquiries = (
            Enquiry.objects.filter(product__seller=user)
            .select_related('buyer', 'product')
            .order_by('-created_at')[:5]
        )

        return Response(
            {
                'verification_status': seller_profile.verification_status if seller_profile else 'approved',
                'admin_notes': seller_profile.admin_notes if seller_profile else '',
                'brand_name': seller_profile.brand_name if seller_profile else user.get_full_name(),
                'total_products': product_stats['total_products'] or 0,
                'available_products': product_stats['available_products'] or 0,
                'low_stock_products': product_stats['low_stock_products'] or 0,
                'total_orders': order_stats['total_orders'] or 0,
                'pending_orders': order_stats['pending_orders'] or 0,
                'completed_orders': order_stats['completed_orders'] or 0,
                'total_sales': order_stats['total_sales'] or Decimal('0.00'),
                'total_enquiries': enquiry_stats['total_enquiries'] or 0,
                'pending_enquiries': enquiry_stats['pending_enquiries'] or 0,
                'accepted_enquiries': enquiry_stats['accepted_enquiries'] or 0,
                'completed_enquiries': enquiry_stats['completed_enquiries'] or 0,
                'rejected_enquiries': enquiry_stats['rejected_enquiries'] or 0,
                'recent_orders': SellerOrderItemSerializer(
                    recent_orders, many=True, context={'request': request}
                ).data,
                'recent_enquiries': SellerEnquirySerializer(
                    recent_enquiries, many=True, context={'request': request}
                ).data,
            }
        )


class SellerBrandProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    serializer_class = SellerProfilePrivateSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile, _ = SellerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'brand_name': self.request.user.get_full_name().strip() or 'Artisan Studio',
                'brand_description': self.request.user.bio,
                'craft_specialty': self.request.user.craft_specialty,
                'manufacturing_location': self.request.user.location,
                'verification_status': SellerProfile.VerificationStatus.PENDING,
            },
        )
        return profile


class SellerProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsApprovedSeller]
    serializer_class = SellerProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = None

    def get_queryset(self):
        return (
            Product.objects.filter(seller=self.request.user)
            .prefetch_related('additional_images')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class SellerProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsApprovedSeller, IsProductOwner]
    serializer_class = SellerProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Product.objects.prefetch_related('additional_images').all()


class SellerProductImageDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsApprovedSeller]

    def delete(self, request, pk, image_id):
        try:
            product_image = ProductImage.objects.select_related('product').get(
                id=image_id, product_id=pk
            )
        except ProductImage.DoesNotExist:
            return Response({'detail': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)

        if product_image.product.seller != request.user:
            return Response(
                {'detail': 'You do not have permission to delete this image.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        product_image.image.delete(save=False)
        product_image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SellerOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    serializer_class = SellerOrderItemSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = (
            OrderItem.objects.filter(seller=self.request.user)
            .select_related('order', 'product')
            .order_by('-order__created_at')
        )
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class SellerOrderItemStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    serializer_class = SellerOrderItemStatusSerializer

    def get_queryset(self):
        return OrderItem.objects.filter(seller=self.request.user).select_related('order', 'product')

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(SellerOrderItemSerializer(updated, context={'request': request}).data)


class SellerEnquiryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    serializer_class = SellerEnquirySerializer
    pagination_class = None

    def get_queryset(self):
        queryset = (
            Enquiry.objects.filter(product__seller=self.request.user)
            .select_related('buyer', 'product')
            .order_by('-created_at')
        )
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class SellerEnquiryDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsSeller, IsEnquiryProductOwner]
    serializer_class = SellerEnquirySerializer
    queryset = Enquiry.objects.select_related('buyer', 'product').all()


class SellerEnquiryStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsSeller, IsEnquiryProductOwner]
    serializer_class = SellerEnquiryStatusSerializer
    queryset = Enquiry.objects.select_related('buyer', 'product').all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_enquiry = serializer.save()
        return Response(
            SellerEnquirySerializer(updated_enquiry, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )
from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsSeller
from marketplace.models import Enquiry, Product, ProductImage
from .permissions import IsEnquiryProductOwner, IsProductOwner
from .serializers import (
    SellerEnquirySerializer,
    SellerEnquiryStatusSerializer,
    SellerProductSerializer,
)


class SellerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]

    def get(self, request):
        user = request.user
        product_stats = Product.objects.filter(seller=user).aggregate(
            total_products=Count('id'),
            available_products=Count('id', filter=Q(is_available=True)),
        )
        enquiry_stats = Enquiry.objects.filter(product__seller=user).aggregate(
            total_enquiries=Count('id'),
            pending_enquiries=Count('id', filter=Q(status=Enquiry.Status.PENDING)),
            accepted_enquiries=Count('id', filter=Q(status=Enquiry.Status.ACCEPTED)),
            completed_enquiries=Count('id', filter=Q(status=Enquiry.Status.COMPLETED)),
            rejected_enquiries=Count('id', filter=Q(status=Enquiry.Status.REJECTED)),
        )
        recent_enquiries = (
            Enquiry.objects.filter(product__seller=user)
            .select_related('buyer', 'product')
            .order_by('-created_at')[:5]
        )

        return Response(
            {
                'total_products': product_stats['total_products'] or 0,
                'available_products': product_stats['available_products'] or 0,
                'total_enquiries': enquiry_stats['total_enquiries'] or 0,
                'pending_enquiries': enquiry_stats['pending_enquiries'] or 0,
                'accepted_enquiries': enquiry_stats['accepted_enquiries'] or 0,
                'completed_enquiries': enquiry_stats['completed_enquiries'] or 0,
                'rejected_enquiries': enquiry_stats['rejected_enquiries'] or 0,
                'recent_enquiries': SellerEnquirySerializer(
                    recent_enquiries, many=True, context={'request': request}
                ).data,
            }
        )


class SellerProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
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
    permission_classes = [IsAuthenticated, IsSeller, IsProductOwner]
    serializer_class = SellerProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Product.objects.prefetch_related('additional_images').all()


class SellerProductImageDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]

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
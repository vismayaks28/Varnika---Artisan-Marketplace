from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Product
from .serializers import PublicProductDetailSerializer, PublicProductListSerializer


class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = [
            {'value': value, 'label': label}
            for value, label in Product.CATEGORY_CHOICES
        ]
        return Response(categories)


class PublicProductListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related('seller').filter(is_available=True)

        search = self.request.query_params.get('search', '').strip()
        category = self.request.query_params.get('category', '').strip()
        location = self.request.query_params.get('location', '').strip()
        min_price = self.request.query_params.get('min_price', '').strip()
        max_price = self.request.query_params.get('max_price', '').strip()
        ordering = self.request.query_params.get('ordering', '-created_at').strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(location__icontains=search)
                | Q(seller__first_name__icontains=search)
                | Q(seller__last_name__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)
        if location:
            queryset = queryset.filter(location__icontains=location)
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
    queryset = Product.objects.select_related('seller').prefetch_related('additional_images').all()
    
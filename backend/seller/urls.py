from django.urls import path
from .views import (
    SellerBrandProfileView,
    SellerDashboardView,
    SellerEnquiryDetailView,
    SellerEnquiryListView,
    SellerEnquiryStatusUpdateView,
    SellerOrderItemStatusUpdateView,
    SellerOrderListView,
    SellerProductDetailView,
    SellerProductImageDeleteView,
    SellerProductListCreateView,
)

urlpatterns = [
    path('dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('brand/', SellerBrandProfileView.as_view(), name='seller-brand-profile'),
    path('products/', SellerProductListCreateView.as_view(), name='seller-product-list-create'),
    path('products/<int:pk>/', SellerProductDetailView.as_view(), name='seller-product-detail'),
    path(
        'products/<int:pk>/images/<int:image_id>/',
        SellerProductImageDeleteView.as_view(),
        name='seller-product-image-delete',
    ),
    path('orders/', SellerOrderListView.as_view(), name='seller-order-list'),
    path('orders/<int:pk>/status/', SellerOrderItemStatusUpdateView.as_view(), name='seller-order-status'),
    path('enquiries/', SellerEnquiryListView.as_view(), name='seller-enquiry-list'),
    path('enquiries/<int:pk>/', SellerEnquiryDetailView.as_view(), name='seller-enquiry-detail'),
    path('enquiries/<int:pk>/status/', SellerEnquiryStatusUpdateView.as_view(), name='seller-enquiry-status'),
]
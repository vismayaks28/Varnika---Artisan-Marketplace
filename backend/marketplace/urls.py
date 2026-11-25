from django.urls import path
from .views import (
    CategoryListView,
    PublicBrandDetailView,
    PublicBrandListView,
    PublicProductDetailView,
    PublicProductListView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='product-categories'),
    path('brands/', PublicBrandListView.as_view(), name='public-brand-list'),
    path('brands/<int:pk>/', PublicBrandDetailView.as_view(), name='public-brand-detail'),
    path('', PublicProductListView.as_view(), name='public-product-list'),
    path('<int:pk>/', PublicProductDetailView.as_view(), name='public-product-detail'),
]
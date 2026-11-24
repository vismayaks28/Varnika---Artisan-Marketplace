from django.urls import path
from .views import CategoryListView, PublicProductDetailView, PublicProductListView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='product-categories'),
    path('', PublicProductListView.as_view(), name='public-product-list'),
    path('<int:pk>/', PublicProductDetailView.as_view(), name='public-product-detail'),
]
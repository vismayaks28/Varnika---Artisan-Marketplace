from django.urls import path
from .views import (
    AddressDetailView,
    AddressListCreateView,
    BuyerOrderDetailView,
    BuyerOrderListView,
    CartItemDetailView,
    CartView,
    CheckoutCreateOrderView,
    VerifyPaymentView,
    WishlistListToggleView,
)

urlpatterns = [
    path('wishlist/', WishlistListToggleView.as_view(), name='buyer-wishlist'),
    path('cart/', CartView.as_view(), name='buyer-cart'),
    path('cart/items/<int:item_id>/', CartItemDetailView.as_view(), name='buyer-cart-item'),
    path('addresses/', AddressListCreateView.as_view(), name='buyer-addresses'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='buyer-address-detail'),
    path('checkout/', CheckoutCreateOrderView.as_view(), name='buyer-checkout'),
    path('<str:order_number>/verify-payment/', VerifyPaymentView.as_view(), name='buyer-verify-payment'),
    path('', BuyerOrderListView.as_view(), name='buyer-orders'),
    path('<str:order_number>/', BuyerOrderDetailView.as_view(), name='buyer-order-detail'),
]
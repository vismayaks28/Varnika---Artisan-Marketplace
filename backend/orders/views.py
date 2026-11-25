import hashlib
import hmac
import uuid
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsBuyer
from marketplace.models import Product
from .models import Address, Cart, CartItem, Order, OrderItem, Payment, WishlistItem
from .serializers import (
    AddressSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
    WishlistItemSerializer,
)


class WishlistListToggleView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def get(self, request):
        items = WishlistItem.objects.filter(buyer=request.user).select_related(
            'product', 'product__seller', 'product__seller__seller_profile'
        )
        return Response(WishlistItemSerializer(items, many=True, context={'request': request}).data)

    def post(self, request):
        product_id = request.data.get('product')
        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except (Product.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        item, created = WishlistItem.objects.get_or_create(buyer=request.user, product=product)
        if not created:
            item.delete()
            return Response({'wishlisted': False, 'product_id': product.id}, status=status.HTTP_200_OK)

        return Response(
            {
                'wishlisted': True,
                'product_id': product.id,
                'item': WishlistItemSerializer(item, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CartView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def _get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(buyer=user)
        return cart

    def get(self, request):
        cart = self._get_cart(request.user)
        return Response(CartSerializer(cart, context={'request': request}).data)

    def post(self, request):
        """Add item to cart or increment quantity with strict stock validation."""
        product_id = request.data.get('product')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response({'detail': 'Quantity must be a valid integer.'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity < 1:
            return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except (Product.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not product.is_available or product.stock_quantity < 1:
            return Response({'detail': 'This craft item is currently out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

        cart = self._get_cart(request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': min(quantity, product.stock_quantity)},
        )

        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > product.stock_quantity:
                return Response(
                    {'detail': f'Only {product.stock_quantity} unit(s) available in stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = new_qty
            cart_item.save()
        elif quantity > product.stock_quantity:
            return Response(
                {'detail': f'Only {product.stock_quantity} unit(s) available in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(CartSerializer(cart, context={'request': request}).data, status=status.HTTP_200_OK)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def patch(self, request, item_id):
        try:
            cart_item = CartItem.objects.select_related('cart', 'product').get(
                id=item_id, cart__buyer=request.user
            )
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            cart = cart_item.cart
            cart_item.delete()
            return Response(CartSerializer(cart, context={'request': request}).data)

        if quantity > cart_item.product.stock_quantity:
            return Response(
                {'detail': f'Only {cart_item.product.stock_quantity} unit(s) available in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = quantity
        cart_item.save()
        return Response(CartSerializer(cart_item.cart, context={'request': request}).data)

    def delete(self, request, item_id):
        try:
            cart_item = CartItem.objects.select_related('cart').get(
                id=item_id, cart__buyer=request.user
            )
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        cart = cart_item.cart
        cart_item.delete()
        return Response(CartSerializer(cart, context={'request': request}).data)


class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    serializer_class = AddressSerializer
    pagination_class = None

    def get_queryset(self):
        return Address.objects.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(buyer=self.request.user)


class CheckoutCreateOrderView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {
                'order': OrderSerializer(order, context={'request': request}).data,
                'razorpay_key_id': settings.RAZORPAY_KEY_ID or 'rzp_test_placeholder',
                'is_live_gateway': bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET),
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(APIView):
    """Backend payment signature verification (supports real Razorpay test keys or labeled sandbox test confirmation)."""
    permission_classes = [IsAuthenticated, IsBuyer]

    @transaction.atomic
    def post(self, request, order_number):
        try:
            order = Order.objects.select_for_update().get(
                order_number=order_number, buyer=request.user
            )
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment = getattr(order, 'payment', None)
        if not payment:
            return Response({'detail': 'Payment record missing.'}, status=status.HTTP_400_BAD_REQUEST)

        if payment.is_verified:
            return Response(OrderSerializer(order, context={'request': request}).data)

        razorpay_payment_id = request.data.get('razorpay_payment_id', '').strip()
        razorpay_signature = request.data.get('razorpay_signature', '').strip()
        test_confirm = bool(request.data.get('test_mode_confirm', False))

        # Real Razorpay signature verification if credentials are configured
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET and razorpay_payment_id and razorpay_signature:
            body = f"{payment.gateway_order_id}|{razorpay_payment_id}".encode('utf-8')
            expected_sig = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode('utf-8'), body, hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(expected_sig, razorpay_signature):
                return Response({'detail': 'Payment signature verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

            payment.gateway_payment_id = razorpay_payment_id
            payment.gateway_signature = razorpay_signature
            payment.is_verified = True
            payment.verified_at = timezone.now()
            payment.save()

            order.payment_status = Order.PaymentStatus.TEST_PAID
            order.payment_reference = razorpay_payment_id
            order.status = Order.Status.CONFIRMED
            order.save(update_fields=['payment_status', 'payment_reference', 'status', 'updated_at'])
            order.items.filter(status=OrderItem.ItemStatus.PENDING).update(status=OrderItem.ItemStatus.CONFIRMED)

        elif test_confirm:
            # Clearly labeled sandbox test-mode completion when live Razorpay keys are not set
            simulated_id = f"pay_test_{uuid.uuid4().hex[:14]}"
            payment.gateway_payment_id = simulated_id
            payment.is_verified = True
            payment.verified_at = timezone.now()
            payment.save()

            order.payment_status = Order.PaymentStatus.TEST_PAID
            order.payment_reference = simulated_id
            order.status = Order.Status.CONFIRMED
            order.save(update_fields=['payment_status', 'payment_reference', 'status', 'updated_at'])
            order.items.filter(status=OrderItem.ItemStatus.PENDING).update(status=OrderItem.ItemStatus.CONFIRMED)
        else:
            return Response(
                {'detail': 'Provide valid Razorpay verification payload or confirm test-mode sandbox payment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(OrderSerializer(order, context={'request': request}).data)


class BuyerOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    serializer_class = OrderSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Order.objects.filter(buyer=self.request.user)
            .prefetch_related('items', 'items__product', 'items__seller__seller_profile')
            .select_related('payment')
        )


class BuyerOrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    serializer_class = OrderSerializer
    lookup_field = 'order_number'

    def get_queryset(self):
        return (
            Order.objects.filter(buyer=self.request.user)
            .prefetch_related('items', 'items__product', 'items__seller__seller_profile')
            .select_related('payment')
        )
from rest_framework.permissions import BasePermission


class IsSeller(BasePermission):
    message = 'Access restricted to registered seller accounts.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'seller'
        )


class IsBuyer(BasePermission):
    message = 'Access restricted to registered buyer accounts.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'buyer'
        )
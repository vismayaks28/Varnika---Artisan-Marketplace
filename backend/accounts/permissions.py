from rest_framework.permissions import BasePermission


class IsSeller(BasePermission):
    message = 'Access restricted to registered seller accounts.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'seller'
        )


class IsApprovedSeller(BasePermission):
    message = 'Your seller application must be approved before publishing or managing products.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.role == 'seller'):
            return False
        profile = getattr(request.user, 'seller_profile', None)
        return bool(profile and profile.verification_status == 'approved')


class IsBuyer(BasePermission):
    message = 'Access restricted to registered buyer accounts.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'buyer'
        )
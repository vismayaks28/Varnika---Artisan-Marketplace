from rest_framework.permissions import BasePermission


class IsProductOwner(BasePermission):
    message = 'You do not have permission to access or modify this product.'

    def has_object_permission(self, request, view, obj):
        return obj.seller == request.user


class IsEnquiryProductOwner(BasePermission):
    message = 'You do not have permission to access or update this enquiry.'

    def has_object_permission(self, request, view, obj):
        return obj.product.seller == request.user
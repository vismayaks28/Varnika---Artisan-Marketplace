from django.urls import path
from .views import BuyerDashboardView, BuyerEnquiryListCreateView

urlpatterns = [
    path('dashboard/', BuyerDashboardView.as_view(), name='buyer-dashboard'),
    path('enquiries/', BuyerEnquiryListCreateView.as_view(), name='buyer-enquiry-list-create'),
]
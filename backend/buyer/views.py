from django.db.models import Count, Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsBuyer
from marketplace.models import Enquiry
from .serializers import BuyerEnquirySerializer


class BuyerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    def get(self, request):
        stats = Enquiry.objects.filter(buyer=request.user).aggregate(
            total_enquiries=Count('id'),
            pending_enquiries=Count('id', filter=Q(status=Enquiry.Status.PENDING)),
            accepted_enquiries=Count('id', filter=Q(status=Enquiry.Status.ACCEPTED)),
            completed_enquiries=Count('id', filter=Q(status=Enquiry.Status.COMPLETED)),
            rejected_enquiries=Count('id', filter=Q(status=Enquiry.Status.REJECTED)),
        )
        recent = (
            Enquiry.objects.filter(buyer=request.user)
            .select_related('product', 'product__seller')
            .order_by('-created_at')[:5]
        )

        return Response(
            {
                'total_enquiries': stats['total_enquiries'] or 0,
                'pending_enquiries': stats['pending_enquiries'] or 0,
                'accepted_enquiries': stats['accepted_enquiries'] or 0,
                'completed_enquiries': stats['completed_enquiries'] or 0,
                'rejected_enquiries': stats['rejected_enquiries'] or 0,
                'recent_enquiries': BuyerEnquirySerializer(
                    recent, many=True, context={'request': request}
                ).data,
            }
        )


class BuyerEnquiryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    serializer_class = BuyerEnquirySerializer
    pagination_class = None

    def get_queryset(self):
        queryset = (
            Enquiry.objects.filter(buyer=self.request.user)
            .select_related('product', 'product__seller')
            .order_by('-created_at')
        )
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user, status=Enquiry.Status.PENDING)
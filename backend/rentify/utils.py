from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    """
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {
                'error': 'Internal server error',
                'detail': str(exc)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Customize response format
    if response.status_code >= 400:
        response.data = {
            'error': True,
            'status': response.status_code,
            'message': response.data.get('detail', 'An error occurred'),
            'data': response.data
        }

    return response
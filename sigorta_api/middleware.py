import re
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

class CSRFExemptMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if hasattr(settings, 'CSRF_EXEMPT_URLS'):
            for url in settings.CSRF_EXEMPT_URLS:
                if re.match(url, request.path_info):
                    setattr(request, '_dont_enforce_csrf_checks', True)
                    break
        return None 
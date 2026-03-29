from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
import os

def index(request, *args, **kwargs):
    """Serve o index.html do React para qualquer rota."""
    caminho = os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html')
    try:
        with open(caminho, encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(
            '<h2>Sistema não iniciado.</h2>'
            '<p>Execute: <code>cd frontend && npm run build</code></p>',
            status=503
        )

urlpatterns = [
    path('api/', include('api.urls')),
    re_path(r'^(?!api/|media/).*$', index),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
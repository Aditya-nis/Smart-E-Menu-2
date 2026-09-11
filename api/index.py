import os
from django.core.wsgi import get_wsgi_application

# Ensure the settings module is set
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EMenu.settings')

# Initialize the Django application once per container start
application = get_wsgi_application()


def handler(request, context):
    """Vercel entry point.
    The `request` object is a Flask‑like wrapper provided by Vercel.
    We adapt it to a WSGI call and return the response.
    """
    # Vercel provides `request` with .environ compatible dict
    def start_response(status, response_headers, exc_info=None):
        # Store status and headers for later use
        context['status'] = status
        context['headers'] = response_headers
        return lambda data: None

    result = application(request.environ, start_response)
    # Gather the body
    body = b"".join(result)
    # Return a Vercel‑compatible response dict
    return {
        "statusCode": int(context['status'].split()[0]),
        "headers": dict(context['headers']),
        "body": body.decode('utf-8'),
    }

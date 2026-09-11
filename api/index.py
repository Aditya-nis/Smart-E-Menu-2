import os
import io
import sys
from django.core.wsgi import get_wsgi_application

# Ensure the settings module is set for Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EMenu.settings')

# Load the WSGI application once per container start
application = get_wsgi_application()


def handler(event, context=None):
    """Vercel serverless entry point.
    Vercel passes a single ``event`` dictionary containing the HTTP request information.
    This wrapper converts ``event`` into a WSGI ``environ`` dict expected by Django and
    returns a Vercel‑compatible response dictionary.
    """
    # Helper to build the WSGI environ from the event dict
    def build_environ(event):
        environ = {
            "REQUEST_METHOD": event.get("method", "GET"),
            "PATH_INFO": event.get("path", "/"),
            "QUERY_STRING": event.get("queryString", ""),
            "SERVER_NAME": event.get("host", "127.0.0.1"),
            "SERVER_PORT": str(event.get("port", 80)),
            "wsgi.version": (1, 0),
            "wsgi.url_scheme": event.get("scheme", "http"),
            "wsgi.input": io.BytesIO(event.get("body", b"" if isinstance(event.get("body"), bytes) else "".encode())),
            "wsgi.errors": sys.stderr,
            "wsgi.multithread": False,
            "wsgi.multiprocess": False,
            "wsgi.run_once": False,
        }
        headers = event.get("headers", {})
        for name, value in headers.items():
            key = "HTTP_" + name.upper().replace("-", "_")
            environ[key] = value
        if "content-type" in headers:
            environ["CONTENT_TYPE"] = headers["content-type"]
        if "content-length" in headers:
            environ["CONTENT_LENGTH"] = headers["content-length"]
        return environ

    environ = build_environ(event)
    status_headers = {}

    def start_response(status, response_headers, exc_info=None):
        status_headers["status"] = status
        status_headers["headers"] = dict(response_headers)
        return lambda data: None

    result = application(environ, start_response)
    body_bytes = b"".join(result)
    body = body_bytes.decode("utf-8", errors="replace")
    status_code = int(status_headers.get("status", "200 OK").split()[0])
    return {
        "statusCode": status_code,
        "headers": status_headers.get("headers", {}),
        "body": body,
    }


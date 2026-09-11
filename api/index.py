import os
import io
import sys
import logging
from django.core.wsgi import get_wsgi_application

# Ensure the settings module is set for Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EMenu.settings')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load the WSGI application once per container start
application = get_wsgi_application()


def handler(event, context=None):
    """Vercel serverless entry point.
    Vercel passes a single ``event`` dictionary containing the HTTP request information.
    This wrapper converts ``event`` into a WSGI ``environ`` dict expected by Django and
    returns a Vercel‑compatible response dictionary.
    """
    logger.info("Received event: %s %s", event.get("method", "GET"), event.get("path", "/"))

    # Helper to build the WSGI environ from the event dict
    def build_environ(event):
        headers = event.get("headers", {})
        # Determine host – Render may provide it in headers rather than top‑level field
        host = event.get("host") or headers.get("host") or "127.0.0.1"
        # Determine scheme – default to http if not supplied
        scheme = event.get("scheme") or "http"
        # Determine HTTP version – Vercel/Render use "httpVersion" or "protocol"
        protocol = event.get("httpVersion") or event.get("protocol") or "HTTP/1.1"
        environ = {
            "REQUEST_METHOD": event.get("method", "GET"),
            "PATH_INFO": event.get("path", "/"),
            "QUERY_STRING": event.get("queryString", ""),
            "SERVER_NAME": host,
            "SERVER_PORT": str(event.get("port", 80)),
            "SERVER_PROTOCOL": protocol,
            "wsgi.version": (1, 0),
            "wsgi.url_scheme": scheme,
            "wsgi.input": io.BytesIO(event.get("body", b"" if isinstance(event.get("body"), bytes) else "".encode())),
            "wsgi.errors": sys.stderr,
            "wsgi.multithread": False,
            "wsgi.multiprocess": False,
            "wsgi.run_once": False,
        }
        # Populate HTTP_ prefixed headers expected by Django
        for name, value in headers.items():
            key = "HTTP_" + name.upper().replace("-", "_")
            environ[key] = value
        if "content-type" in headers:
            environ["CONTENT_TYPE"] = headers["content-type"]
        if "content-length" in headers:
            environ["CONTENT_LENGTH"] = headers["content-length"]
        return environ

    try:
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
        logger.info("Responded with status code: %d", status_code)
        return {
            "statusCode": status_code,
            "headers": status_headers.get("headers", {}),
            "body": body,
        }
    except Exception:
        logger.exception("An error occurred while processing the request.")
        raise

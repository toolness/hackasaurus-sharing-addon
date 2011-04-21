import os
import base64
import tempfile
from cgi import parse_qsl

import flickrapi

MAX_SIZE = 500000
DATA_URI_START = 'data:image/png;base64,'

def application(environ, start_response):
    def fail(code, msg=None):
        msg = msg or code
        start_response(code, [('Content-Type', 'text/plain')])
        return [msg]

    if environ['REQUEST_METHOD'] != 'POST':
        return fail('405 Method Not Allowed')

    try:
        length = int(environ.get('CONTENT_LENGTH', '0'))
    except ValueError, KeyError:
        return fail('411 Length Required')
    if length == 0:
        return fail('411 Length Required')
    if length > MAX_SIZE:
        return fail('413 Request Entity Too Large')

    body = environ['wsgi.input'].read(length)
    args = dict(parse_qsl(body))

    for arg in ['data_uri', 'api_key', 'api_secret', 'auth_token']:
        if arg not in args:
            return fail('400 Bad Request', 'missing %s arg' % arg)

    data_uri = args['data_uri']
    if not data_uri.startswith(DATA_URI_START):
        return fail('400 Bad Request',
                    'data_uri must begin with %s' % DATA_URI_START)
    try:
        image = base64.b64decode(data_uri[len(DATA_URI_START):])
    except TypeError:
        return fail('400 Bad Request', 'image is not valid base64')

    fd, tempfilename = tempfile.mkstemp(suffix='.png')
    os.close(fd)
    fileobj = open(tempfilename, 'wb')
    fileobj.write(image)
    fileobj.close()

    try:
        flickr = flickrapi.FlickrAPI(args['api_key'], args['api_secret'],
                                     token=args['auth_token'])
        result = flickr.upload(
            format='rest',
            filename=tempfilename,
            title=args.get('title'),
            description=args.get('description'),
            tags=args.get('tags'),
            content_type=2
            )
    finally:
        os.remove(tempfilename)

    start_response('200 OK', [('Content-Type', 'text/xml')])
    return [result]

if __name__ == '__main__':
    from wsgiref.simple_server import make_server

    PORT = 8000
    
    httpd = make_server('', PORT, application)
    print "serving on port %d" % PORT
    httpd.serve_forever()

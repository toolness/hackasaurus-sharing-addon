import email
import tempfile
import hashlib
import os
from wsgiref.simple_server import make_server

from config import ROOT_FILES_DIR, VIEW_URL, PORT

if not os.path.exists(ROOT_FILES_DIR):
    os.mkdir(ROOT_FILES_DIR)

def application(environ, start_response):
    length = int(environ['CONTENT_LENGTH'])
    contents = environ['wsgi.input'].read(length)
    lines = [
        'Content-Length: %s' % environ['CONTENT_LENGTH'],
        'Content-Type: %s' % environ['CONTENT_TYPE'],
        '',
        contents
    ]
    message = '\n'.join(lines)
    hashstr = hashlib.sha256(message).hexdigest()
    msg = email.message_from_string(message)
    tinyhash = hashstr[:20]
    rootdir = os.path.join(ROOT_FILES_DIR, tinyhash)
    print "hash: %s" % tinyhash
    if not os.path.exists(rootdir):
        os.mkdir(rootdir)
        for part in msg.walk():
            print "PART %s" % part.get_content_type()
            # multipart/* are just containers
            if part.get_content_maintype() == 'multipart':
                continue
            content = part.get_payload(decode=True)
            params = dict(part.get_params(header='Content-Disposition'))
            name = params['name']
            if 'filename' in params:
                filename = params['filename']
                if name == 'index-file':
                    absfilename = os.path.join(rootdir, 'index.html')
                    open(absfilename, 'wb').write(content)
                elif name.startswith('file-'):
                    filesdir = os.path.join(rootdir, 'files')
                    if not os.path.exists(filesdir):
                        os.mkdir(filesdir)
                    absfilename = os.path.join(filesdir, filename)
                    absfilename = os.path.normpath(absfilename)
                    if absfilename.startswith(filesdir):
                        open(absfilename, 'wb').write(content)
                print "  %s : %s (%d bytes)" % (name, filename, len(content))
            else:
                print "  %s : %s" % (name, content)        

    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [VIEW_URL % tinyhash]

if __name__ == '__main__':
    httpd = make_server('', PORT, application)
    print "Serving on port %d" % PORT
    httpd.serve_forever()

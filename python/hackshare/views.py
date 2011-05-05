import os
import tempfile

from django.conf import settings
from django.http import HttpResponse, HttpResponseNotAllowed, \
                        HttpResponseForbidden, HttpResponseBadRequest                        
from django.utils import simplejson as json
from django.template.loader import get_template
from django.template import Context
import flickr

DEFAULT_TITLE = 'Untitled'
DEFAULT_TAGS = 'hackasaurus hack'

def json_response(**obj):
    return HttpResponse(json.dumps(obj), mimetype='application/json')

def apply_reasonable_defaults(obj, **defaults):
    copy = dict(obj)
    for key in defaults:
        if (key not in obj) or (not obj[key].strip()):
            copy[key] = defaults[key]
    for key in copy.keys():
        if not copy[key].strip():
            del copy[key]
    return copy
    
def upload_to_flickr(req, upload=flickr.upload):
    fd, tempfilename = tempfile.mkstemp(suffix='.png')
    os.close(fd)
    f = open(tempfilename, 'wb')
    for chunk in req.FILES['screenshot'].chunks():
        f.write(chunk)
    f.close()

    opts = apply_reasonable_defaults(req.POST, title=DEFAULT_TITLE)
    if 'source_url' in opts and not 'source_title' in opts:
        opts['source_title'] = opts['source_url']
    desc_html = get_template('hackshare/flickr_description.html')
    desc = desc_html.render(Context(opts))

    try:
        photo_id = upload(
            filename=tempfilename,
            title=opts['title'],
            description=desc,
            tags=DEFAULT_TAGS,
            content_type=2
            )
    finally:
        os.remove(tempfilename)

    return photo_id

# Create your views here.
def upload(req, upload_to_flickr=upload_to_flickr):
    if req.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    if req.POST.get('auth_token') != settings.UPLOAD_AUTH_TOKEN:
        return HttpResponseForbidden()

    if not 'screenshot' in req.FILES:
        return HttpResponseBadRequest()

    photo_id = upload_to_flickr(req)

    return json_response(
        photo_id=photo_id,
        short_url=flickr.shorturl(photo_id)
        )

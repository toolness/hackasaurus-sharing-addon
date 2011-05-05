import os
import tempfile

from django.http import HttpResponse, HttpResponseNotAllowed
from django.utils import simplejson as json
from django.template.loader import get_template
from django.template import Context
import flickr

DEFAULT_TITLE = 'Untitled'
DEFAULT_TAGS = 'hackasaurus hack'

def json_response(**obj):
    return HttpResponse(json.dumps(obj), mimetype='application/json')

def upload_to_flickr(req, upload=flickr.upload):
    fd, tempfilename = tempfile.mkstemp(suffix='.png')
    os.close(fd)
    f = open(tempfilename, 'wb')
    for chunk in req.FILES['screenshot'].chunks():
        f.write(chunk)
    f.close()

    desc_html = get_template('hackshare/flickr_description.html')
    desc = desc_html.render(Context(req.POST))

    try:
        photo_id = upload(
            filename=tempfilename,
            title=req.POST.get('title', DEFAULT_TITLE),
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

    photo_id = upload_to_flickr(req)

    return json_response(
        photo_id=photo_id
        )

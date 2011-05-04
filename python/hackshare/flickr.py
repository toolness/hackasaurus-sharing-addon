import flickrapi
import flickrapi.shorturl
from django.conf import settings

def get_api():
    token = getattr(settings, 'FLICKR_AUTH_TOKEN', None)
    flickr = flickrapi.FlickrAPI(settings.FLICKR_API_KEY,
                                 settings.FLICKR_API_SECRET,
                                 token=token,
                                 store_token=False)
    return flickr

def upload(**kwargs):
    response = get_api().upload(**kwargs)
    return response.find('photoid').text

def delete(photo_id):
    get_api().photos_delete(photo_id=photo_id)

def shorturl(photo_id):
    return flickrapi.shorturl.url(photo_id)

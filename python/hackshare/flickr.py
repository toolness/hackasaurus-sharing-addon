import flickrapi
from django.conf import settings

def get_api():
    flickr = flickrapi.FlickrAPI(settings.FLICKR_API_KEY,
                                 settings.FLICKR_API_SECRET,
                                 store_token=False)
    return flickr
    
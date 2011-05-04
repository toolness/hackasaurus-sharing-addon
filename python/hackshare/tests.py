import os

from django.conf import settings
from django.test import TestCase
from django.test.client import Client, RequestFactory
from django.utils import simplejson as json
import views
import flickr

ROOT = os.path.abspath(os.path.dirname(__file__))
path = lambda *x: os.path.join(ROOT, *x)

SAMPLE_IMG = path('sample_data', 'test_image.png')
SAMPLE_INDEX = path('sample_data', 'index.html')

class FakeFlickr(object):
    pass

class FlickrTests(TestCase):
    def test_flickr_token_is_valid(self):
        api = flickr.get_api()
        api.auth_checkToken()

    def test_flickr_upload_and_delete_work(self):
        photo_id = flickr.upload(filename=SAMPLE_IMG)
        flickr.delete(photo_id)

    def test_shorturl_works(self):
        self.assertEqual(flickr.shorturl('5688591650'),
                         'http://flic.kr/p/9EFw7o')

class ApiTests(TestCase):
    def setUp(self):
        self._oldflickr = views.flickr
        self.flickr = FakeFlickr()
        views.flickr = self.flickr
        
    def tearDown(self):
        views.flickr = self._oldflickr

    def test_upload_returns_method_not_allowed_on_get(self):
        c = Client()
        response = c.get('/upload/')
        self.assertEqual(response.status_code, 405)

    def test_upload_succeeds_when_minimal_args_are_valid(self):
        c = Client()

        def fake_upload(filename, **kwargs):
            self.assertFalse(hasattr(self.flickr, 'filename'))
            self.assertTrue(os.path.isfile(filename))
            self.assertEqual(open(SAMPLE_IMG, 'rb').read(),
                             open(filename, 'rb').read())
            self.flickr.filename = filename
            return 'fake photo id'

        self.flickr.upload = fake_upload

        response = c.post('/upload/', dict(
            screenshot=open(SAMPLE_IMG, 'rb'),
            auth_token=settings.UPLOAD_AUTH_TOKEN,
            #index_html=open(SAMPLE_INDEX, 'rb'),
            #additional_file_count='0'
        ))
        self.assertEqual(response['content-type'], 'application/json')
        self.assertFalse(os.path.exists(self.flickr.filename))
        obj = json.loads(response.content)
        self.assertEqual(obj['photo_id'], 'fake photo id')

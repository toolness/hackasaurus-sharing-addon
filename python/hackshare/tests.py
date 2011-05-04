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
        self.factory = RequestFactory()
        
    def tearDown(self):
        pass

    def test_upload_returns_method_not_allowed_on_get(self):
        c = Client()
        response = c.get('/upload/')
        self.assertEqual(response.status_code, 405)

    def test_upload_returns_json_with_expected_args(self):
        req = self.factory.post('', dict())
        
        def fake_upload_to_flickr(some_request):
            self.assertTrue(some_request is req)
            return 'fake photo id'
        
        response = views.upload(req,
                                upload_to_flickr=fake_upload_to_flickr)
        
        self.assertEqual(response['content-type'], 'application/json')
        obj = json.loads(response.content)
        self.assertEqual(obj['photo_id'], 'fake photo id')

    def test_upload_to_flickr_works(self):
        req = self.factory.post('', dict(screenshot=open(SAMPLE_IMG, 'rb')))

        info = {}

        def fake_upload(filename, **kwargs):
            self.assertTrue('filename' not in info)
            info['filename'] = filename
            self.assertTrue(os.path.isfile(filename))
            self.assertEqual(open(SAMPLE_IMG, 'rb').read(),
                             open(filename, 'rb').read())
            return 'fake photo id'

        photo_id = views.upload_to_flickr(req, upload=fake_upload)

        self.assertEqual(photo_id, 'fake photo id') 
        self.assertFalse(os.path.exists(info['filename']))

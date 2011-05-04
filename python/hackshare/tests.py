import os

from django.test import TestCase
from django.test.client import Client
import flickr

ROOT = os.path.abspath(os.path.dirname(__file__))
path = lambda *x: os.path.join(ROOT, *x)

SAMPLE_IMG = path('sample_data', 'test_image.png')

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
    def test_upload_returns_method_not_allowed_on_get(self):
        c = Client()
        response = c.get('/upload/')
        self.assertEqual(response.status_code, 405)

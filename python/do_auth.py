import os

try:
    import simplejson as json
except ImportError:
    import json

import flickr

ROOT = os.path.dirname(os.path.abspath(__file__))
path = lambda *a: os.path.join(ROOT, *a)

flickr_cfg = json.load(open(path('..', 'data', 'flickr-config.json')))

flickr.API_KEY = flickr_cfg['api_key']
flickr.API_SECRET = flickr_cfg['secret']

if __name__ == '__main__':
    permission = 'write'
    myauth = flickr.Auth()
    frob = myauth.getFrob()
    link = myauth.loginLink(permission, frob)
    print "Please visit the following URL in your browser:"
    print link
    print "When done, press return."
    raw_input()
    token = myauth.getToken(frob)
    print "Your auth token is %s." % token

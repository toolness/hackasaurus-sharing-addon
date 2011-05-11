This is a server and accompanying Firefox add-on that make it easy to share
[Hackasaurus][] hacks. Presently, hacks are shared by posting a screenshot to
Flickr, and optionally uploading a replica of the hacked page.

# Prerequisites

For the add-on:

* Firefox 4
* [Add-on SDK v1.0b5][addon-sdk]

For the server:

* Python 2.5 or greater (but not Python 3.0 or greater)

The full list of server-side dependencies are in the file
`server/requirements.txt`, but these are usually installed automatically by a
bootstrap script, so you don't need to worry about them.

# Server Setup

First, run these commands from the root of your checkout:

    $ cd server
    $ python manage.py bootstrap

Then, create `server/dev/settings_local.py` and fill it with something like
the following:

    FLICKR_API_KEY = 'myapikey'
    FLICKR_API_SECRET = 'mysecret'
    FLICKR_AUTH_TOKEN = 'myauthtoken'
    UPLOAD_AUTH_TOKEN = 'somebiglongsecret'
    STATIC_HACKS_ROOT = '/var/static-hacks/'
    STATIC_HACKS_URL = 'http://localhost:8001/'

The `FLICKR_API_KEY` and `FLICKR_API_SECRET` values are provided to you when
you create a new Flickr application on the Flickr website.

The `UPLOAD_AUTH_TOKEN` setting is also included in the add-on configuration
to authenticate it with the server. This can be whatever you want, as long as
the server and client are both configured with the same value.

The `FLICKR_AUTH_TOKEN` setting is particular to a specific Flickr user; all
hack screenshots are uploaded as this user. To obtain it, run:

    $ python manage.py flickr_auth

Follow its instructions. Once it finishes, it will present you with a value
that you can use for `FLICKR_AUTH_TOKEN`.

The `STATIC_HACKS_ROOT` setting is the root directory that will contain static
HTML and CSS files for each hack. The corresponding URL serving static files
under this directory is named by `STATIC_HACKS_URL`. Note that the development
server doesn't actually expose these files; for now, you'll need to set up a
separate server to serve them.

Once you've finished setting up the server configuration file, run:

    $ python manage.py runserver

# Add-on Setup

First, create `addon/data/config.json` and fill it with something like the
following:

    {
        "auth_token": "somebiglongsecret",
        "goggles_server": "https://secure.toolness.com/webxray/",
        "upload_server": "http://localhost:8000/upload/",
    }

The value of `auth_token` should be identical to the `UPLOAD_AUTH_TOKEN`
setting on the server.

The `goggles_server` setting points to a hosted instance of the
[Web X-Ray Goggles][webxray].

The `upload_server` setting points to the location of the server component.

Run `cfx run` to launch an instance of Firefox with the add-on installed. You
should be able to click on the widgets on the add-on bar to activate the
goggles and share your hacks.

# Limitations

The add-on currently uses Firefox's "Save As... Web Page, complete"
functionality under-the-hood to save replicas of hacks. However, this browser
feature has a number of bugs, which are tracked in [Bug 115634][]. Needless to
say, this add-on inherits most of them, save a few select work-arounds. In the
long-term, it may be more useful to borrow code and/or ideas from the
[WebPageDump][] project.

  [Hackasaurus]: http://hackasaurus.org
  [webxray]: https://github.com/hackasaurus/webxray
  [addon-sdk]: http://blog.mozilla.com/addons/2011/05/05/announcing-add-on-sdk-1-0b5/
  [Bug 115634]: https://bugzilla.mozilla.org/show_bug.cgi?id=115634
  [WebPageDump]: http://www.dbai.tuwien.ac.at/user/pollak/webpagedump/index.html

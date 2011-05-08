import hackshare.flickr
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    help = 'manually get a flickr auth token'

    def handle(self, *args, **options):
        flickr = hackshare.flickr.get_api()
        (token, frob) = flickr.get_token_part_one(perms='delete')
        if not token:
            raw_input("Press ENTER after you authorized this program.")
        auth_token = flickr.get_token_part_two((token, frob))
        print "Your auth token is: %s" % auth_token

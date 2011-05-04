from django.http import HttpResponseNotAllowed

# Create your views here.
def upload(req):
    if req.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    return HttpResponse('hi')

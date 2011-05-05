import os
import distutils.dir_util

class Storage(object):
    def __init__(self, backend):
        self.backend = backend
        
    def process(self, photo_id, req):
        # TODO: Some ValueErrors here should propagate back to the client
        # as HTTP Bad Request, not 500.
        if 'index_file' not in req.FILES:
            return None

        index = req.FILES['index_file']
        support = []
        num_files = int(req.POST.get('index_support_files', '0'))
        for i in range(num_files):
            key = 'index_support_file_%d' % i
            dirkey = '%s_dir' % key
            if key not in req.FILES:
                raise ValueError('support file missing: %s' % key)
            if dirkey not in req.POST:
                raise ValueError('dir key missing: %s' % dirkey)
            support.append((req.POST.get(dirkey), req.FILES[key]))
            
        return self.backend.store_page(photo_id, index, support)

class LocalFileBackend(object):
    def __init__(self, root, url):
        self.root = root
        self.url = url

    def _make_file(self, parts):
        # TODO: Some ValueErrors here should propagate back to the client
        # as HTTP Bad Request, not 500.
        abspath = os.path.join(self.root, *parts)
        normpath = os.path.normpath(abspath)
        if not normpath.startswith(self.root):
            raise ValueError('invalid path: %s' % normpath)
        distutils.dir_util.mkpath(os.path.dirname(normpath))
        return open(normpath, 'wb')

    def store_page(self, photo_id, index_file, support_files):
        index = self._make_file([photo_id, 'index.html'])
        for chunk in index_file.chunks():
            index.write(chunk)
        index.close()
        
        for dirpath, support_file in support_files:
            fullpath = [photo_id] + dirpath.split('/') + [support_file.name]
            support = self._make_file(fullpath)
            for chunk in support_file.chunks():
                support.write(chunk)
            support.close()
            
        return '%s%s/' % (self.url, photo_id)

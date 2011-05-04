from setuptools import setup

from dev.bootstrap import install_requires

setup(
    name='hackshare',
    version='0.1',
    packages=['hackshare'],
    author='Atul Varma',
    author_email='varmaa@toolness.com',
    install_requires=install_requires
    )

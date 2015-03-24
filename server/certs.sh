#!/bin/bash

# make directories to work from
# for some reason the {folders} option doesn't want to work so these are broken out

mkdir /var/certs
mkdir /var/certs/server
mkdir /var/certs/client
mkdir /var/certs/ca
mkdir /var/certs/tmp

# Create your very own Root Certificate Authority
openssl genrsa \
  -out /var/certs/ca/my-root-ca.key.pem \
  2048

# Self-sign your Root Certificate Authority
# Since this is private, the details can be as bogus as you like
openssl req \
  -x509 \
  -new \
  -nodes \
  -key /var/certs/ca/my-root-ca.key.pem \
  -days 1024 \
  -out /var/certs/ca/my-root-ca.crt.pem \
  -subj "/C=US/ST=Colorado/L=Denver/O=iosuite/CN=iosuite"

# Create a Device Certificate for each domain,
# such as example.com, *.example.com, awesome.example.com
# NOTE: You MUST match CN to the domain name or ip address you want to use
openssl genrsa \
  -out /var/certs/server/my-server.key.pem \
  2048

# Create a request from your Device, which your Root CA will sign
openssl req -new \
  -key /var/certs/server/my-server.key.pem \
  -out /var/certs/tmp/my-server.csr.pem \
  -subj "/C=US/ST=Colorado/L=Denver/O=iosuite/CN=iosuite"

# Sign the request from Device with your Root CA
# -CAserial certs/ca/my-root-ca.srl
openssl x509 \
  -req -in /var/certs/tmp/my-server.csr.pem \
  -CA /var/certs/ca/my-root-ca.crt.pem \
  -CAkey /var/certs/ca/my-root-ca.key.pem \
  -CAcreateserial \
  -out /var/certs/server/my-server.crt.pem \
  -days 500

# Create a public key, for funzies
# see https://gist.github.com/coolaj86/f6f36efce2821dfb046d
openssl rsa \
  -in /var/certs/server/my-server.key.pem \
  -pubout -out /var/certs/client/my-server.pub

# Put things in their proper place
rsync -a /var/certs/ca/my-root-ca.crt.pem /var/certs/
rsync -a /var/certs/server/my-server.key.pem /var/certs/
rsync -a /var/certs/server/my-server.crt.pem /var/certs/
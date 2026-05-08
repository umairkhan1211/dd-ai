#!/bin/bash

# Exit on error
set -e

# Directory where certificates will be stored
SSL_DIR="./nginx/ssl"

# Domain name
DOMAIN="api.magic-template.net"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate a self-signed SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $SSL_DIR/magic-template.key \
  -out $SSL_DIR/magic-template.crt \
  -subj "/C=US/ST=State/L=City/O=MagicTemplate/CN=${DOMAIN}" \
  -addext "subjectAltName = DNS:${DOMAIN},DNS:localhost,IP:127.0.0.1"

# Set proper permissions
chmod 600 $SSL_DIR/magic-template.key
chmod 644 $SSL_DIR/magic-template.crt

echo "Self-signed SSL certificate and key have been generated:"
echo "- Certificate: $SSL_DIR/magic-template.crt"
echo "- Key: $SSL_DIR/magic-template.key"
echo
echo "NOTE: This is a self-signed certificate for development/testing."
echo "For production, please replace with a proper SSL certificate from a trusted CA."
echo
echo "For ${DOMAIN}, it's recommended to use Let's Encrypt to obtain a trusted certificate." 
#!/bin/bash
# Deploy all backend files to production

echo "Deploying backend files..."

pscp -P 22 -pw 'Inspiron1999#' -r /c/react/backend/* nhs13h5k0x0j@208.109.62.140:/home/nhs13h5k0x0j/public_html/backend/

echo "✅ Backend deployment complete"

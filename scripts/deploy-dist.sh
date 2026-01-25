#!/bin/bash
# Deploy dist folder to production
scp -r -P 22 /c/react/dist/* nhs13h5k0x0j@208.109.62.140:/home/nhs13h5k0x0j/public_html/
echo "Deploy complete"

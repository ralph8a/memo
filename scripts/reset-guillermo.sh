#!/bin/bash
mysql -u nhs13h5k_krause -p'Inspiron1999#' -D nhs13h5k_krause -e "UPDATE users SET password_hash='\$2b\$10\$ef4tONbmKEGOhjLsoNKjguso./.O5uF2E5xw8eMjtpf1Dyka0vT8G' WHERE email='guillermo.krause@ksinsurancee.com'; SELECT email,user_type,status FROM users WHERE email='guillermo.krause@ksinsurancee.com';"

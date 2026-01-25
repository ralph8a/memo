#!/bin/bash
mysql -N -B -u nhs13h5k_krause -p'Inspiron1999#' -D nhs13h5k_krause -e "SELECT email, password_hash, status FROM users WHERE email='guillermo.krause@ksinsurancee.com';"

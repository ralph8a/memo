#!/bin/bash
mysql -N -B -u nhs13h5k_krause -p'Inspiron1999#' -D nhs13h5k_krause -e "SELECT COUNT(*) FROM policies WHERE client_id=2;"

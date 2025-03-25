#!/bin/bash

for dim in 192 512; do
  inkscape --export-area-page --export-type='png' --export-width=$dim --export-height=$dim --export-filename=envelope-$dim.png envelope.svg
done
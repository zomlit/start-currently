#!/bin/bash
url="$1"
if grep -qi microsoft /proc/version; then
  # Running in WSL, use powershell.exe to open URL in Windows
  powershell.exe -Command "Start-Process '$url'"
else
  # Native Linux
  code --open-url "$url"
fi 
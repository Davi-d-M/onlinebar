#!/bin/bash
echo "[OB_OS] Initiating Deep Cache Purge..."
rm -rf .next
echo "[OB_OS] Cache Expunged. Restarting Dev Server..."
npm run dev

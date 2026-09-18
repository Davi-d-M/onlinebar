#!/bin/bash
echo "[OB_OS] DEEP PURGE INITIALIZED..."
echo "1/2 Removing .next build cache..."
rm -rf .next
echo "2/2 Removing webpack cache..."
rm -rf node_modules/.cache
echo "[OB_OS] GRID EXPUNGED. RESTARTING TERMINAL..."
npm run dev

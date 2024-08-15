#!/usr/bin/env bash
cd $(dirname "$0")
sqlite3 ../banco.db < db.sql

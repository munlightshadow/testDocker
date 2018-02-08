#!/bin/sh

cd /app

consul kv put redis/test hello
consul kv get redis/test

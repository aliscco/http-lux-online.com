#!/bin/bash

git config --global user.name "${GH_NAME}"
git config --global user.email "${GH_EMAIL}"
echo "machine github.com login ${GH_NAME} password ${GH_TOKEN}" > ~/.netrc
cd website && npm install && GIT_USER="${GH_NAME}" npm run publish-gh-pages
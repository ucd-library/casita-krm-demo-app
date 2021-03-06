#! /bin/bash

set -e

# PROJECT_ID=digital-ucdavis-edu
PROJECT_ID=casita-298223
CONTAINER_NAME=casita-krm-demo-app
DEPLOYMENT_NAME=casita-krm-demo-app
IMAGE=gcr.io/$PROJECT_ID/$CONTAINER_NAME

gcloud config set project $PROJECT_ID

gcloud builds submit --tag $IMAGE

gcloud beta run deploy $DEPLOYMENT_NAME \
  --image $IMAGE \
  --platform managed \
  --memory=1Gi \
  --set-env-vars=APP_ENV=prod
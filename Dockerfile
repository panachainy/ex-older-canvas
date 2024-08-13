## One stage worked.

FROM node:16-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PATH /opt/app/node_modules/.bin:$PATH

WORKDIR /opt/app

## way 1
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

COPY ./ .

RUN yarn install
RUN yarn build

RUN apk add font-noto-thai font-noto

EXPOSE 1337

CMD ["yarn", "start"]

# This is example for strapi4 that we use in previous project

# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker
FROM mcr.microsoft.com/playwright:v1.52.0-noble

# Install dependencies so they're available in the container.
WORKDIR /usr/src/app
COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn

USER pwuser
RUN mkdir -p /home/pwuser/.fonts \
    && wget https://github.com/cadsondemak/Sarabun/archive/master.tar.gz -O- | tar xvz -C ~/.fonts --strip-components=2 --wildcards '*.ttf'
CMD yarn start
COPY ./src/ ./src/
COPY ./.fonts.conf /home/pwuser/
ENV CONSOLA_LEVEL=4
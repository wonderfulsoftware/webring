FROM cypress/included:6.3.0

# The Cypress Docker image does not contain Thai fonts, which prevents Thai text from rendering correctly, so download it.
RUN mkdir -p ~/.fonts && wget https://github.com/cadsondemak/Sarabun/archive/master.tar.gz -O- | tar xvz -C ~/.fonts --strip-components=2 --wildcards '*.ttf'
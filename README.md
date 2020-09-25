# html-metadata-parser

_HTML Metadata Parser_

> Parser rules from [mozilla/page-metadata-parser](https://github.com/mozilla/page-metadata-parser).

## Installation

````bash
npm install @dkh-dev/html-metadata-parser
````

## Examples

````javascript
'use strict'

const { parse } = require('@dkh-dev/html-metadata-parser')

const url = 'https://github.com/'
const html = `
<!DOCTYPE html>
<html>

<head>
  <title>GitHub</title>
  <meta name="description" content="GitHub is where people build software.">
</head>

<!-- ... -->

</html>`

const main = async () => {
  const metadata = await parse(url, html)

  console.log(metadata)
  // => {
  //      url: 'https://github.com/',
  //      icon: 'https://github.com/favicon.ico',
  //      provider: 'github.com',
  //      title: 'GitHub',
  //      description: 'GitHub is where people build software.'
  //    }
}

main()
````

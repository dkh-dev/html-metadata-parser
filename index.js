'use strict'

const sax = require('sax')

// metadata parser

// rules

const METADATA_TAGS = [
  'title',
  'meta',
  'link',
]
const STOPPING_TAGS = [
  'body',
  'div',
  'main',
  'header',
  'section',
]

const CONTENT_ATTRIBUTE = {
  title: 'text',
  meta: 'content',
  link: 'href',
}

const URL_FIELDS = [
  'icon',
  'image',
]


const compile = rules => (
  Object
    .entries(rules)
    .map(([ field, rule ]) => {
      const rules = Object
        .entries(rule)
        .map(([ tag, queries ]) => queries.map(query => {
          const entries = query ? Object.entries(query) : [ [ null ] ]
          const [ [ attribute, value ] ] = entries

          return { tag, attribute, value }
        }))
        .flat()

      return [ field, rules ]
    })
)

// based on mozilla/page-metadata-parser
const rules = compile({
  url: {
    meta: [
      { property: 'og:url' },
    ],
    link: [
      { rel: 'canonical' },
    ],
  },
  title: {
    meta: [
      { property: 'og:title' },
      { name: 'twitter:title' },
      { property: 'twitter:title' },
      { name: 'hdl' },
    ],
    title: [
      null,
    ],
  },
  description: {
    meta: [
      { property: 'og:description' },
      { name: 'description' },
    ],
  },
  icon: {
    link: [
      { rel: 'apple-touch-icon' },
      { rel: 'apple-touch-icon-precomposed' },
      { rel: 'icon' },
      { rel: 'fluid-icon' },
      { rel: 'shortcut icon' },
      { rel: 'mask-icon' },
    ],
  },
  image: {
    meta: [
      { property: 'og:image:secure_url' },
      { property: 'og:image:url' },
      { property: 'og:image' },
      { name: 'twitter:image' },
      { property: 'twitter:image' },
      { name: 'thumbnail' },
    ],
  },
  keywords: {
    meta: [
      { name: 'keywords' },
    ],
  },
  provider: {
    meta: [
      { property: 'og:site_name' },
    ],
  },
})

// parser

const absolute = (url, base) => {
  try {
    const { href } = new URL(url, base)

    return href
  } catch (error) {
    return url
  }
}

const provider = url => {
  const { host } = new URL(url)

  return host.startsWith('www.') ? host.substr(4) : host
}

const matches = ({ tag, attribute, value }) => ({ name, attributes }) => (
  tag === name && (attributes[ attribute ] === value || attribute === null)
)

const extract = (tags, url, base) => {
  const entries = rules.map(([ field, rules ]) => {
    for (const rule of rules) {
      const tag = tags.find(matches(rule))

      if (!tag) {
        continue
      }

      const name = CONTENT_ATTRIBUTE[ tag.name ]
      const value = tag.attributes[ name ]
      const content = URL_FIELDS.includes(field) ? absolute(value, base) : value

      return [ field, content ]
    }

    return null
  })
  const metadata = Object.fromEntries(entries.filter(Boolean))

  return {
    url,
    icon: absolute('favicon.ico', base),
    provider: provider(url),
    ...metadata,
  }
}

const parse = (url, html) => new Promise(resolve => {
  const parser = sax.parser(false, { lowercase: true, position: false })
  const tags = []
  let base = url

  parser.onerror = () => {
    parser.error = null

    parser.resume()
  }

  parser.onend = () => {
    parser.onerror = null
    parser.onopentag = null
    parser.onopentagstart = null
    parser.ontext = null
    parser.onend = null

    resolve(extract(tags, url, base))
  }

  parser.onopentag = tag => {
    const { name } = tag

    if (name === 'base') {
      base = tag.attributes.href

      return
    }

    if (METADATA_TAGS.includes(name)) {
      return void tags.push(tag)
    }

    if (STOPPING_TAGS.includes(name)) {
      return void parser.onend()
    }
  }

  // the 'ontext' event listener should be registered only for the <title> tag
  const ontext = text => {
    const { tag } = parser

    parser.ontext = null

    tag.attributes.text = text.trim().replace(/\s+/g, ' ')
  }

  parser.onopentagstart = tag => {
    if (tag.name !== 'title') {
      return
    }

    parser.onopentagstart = null
    parser.ontext = ontext
  }

  parser.write(html).close()
})


module.exports = {
  rules,
  extract,
  parse,
}

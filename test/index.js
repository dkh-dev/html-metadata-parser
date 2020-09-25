'use strict'

const { readFileSync } = require('fs')
const test = require('tape')
const { parse } = require('..')


const read = name => readFileSync(`${ __dirname }/${ name }`, 'utf8')


test('tests', async t => {
  t.deepEqual(
    await parse('https://github.com/dangkyokhoang/', 'invalid html'),
    {
      url: 'https://github.com/dangkyokhoang/',
      icon: `https://github.com/dangkyokhoang/favicon.ico`,
      provider: 'github.com',
    },
    'default values',
  )

  t.deepEqual(
    await parse('https://github.com/dangkyokhoang/', read('github.html')),
    {
      url: 'https://github.com/dangkyokhoang',
      icon: 'https://github.githubassets.com/favicons/favicon.svg',
      image: `https://avatars1.githubusercontent.com/u/14311741?s=400&u=139986803de13195eb3fdb73a09ab8a8a192b7c5&v=4`,
      title: 'dangkyokhoang - Overview',
      description: `dangkyokhoang has 4 repositories available. Follow their code on GitHub.`,
      provider: 'GitHub',
    },
    'parses github profile metadata',
  )

  t.deepEqual(
    await parse('https://www.bing.com/', read('bing.html')),
    {
      url: 'https://www.bing.com/?form=HPFBBK&ssd=20200924_0700&mkt=en-WW',
      icon: 'https://www.bing.com/sa/simg/bing_p_rr_teal_min.ico',
      image: 'https://www.bing.com/th?id=OHR.Almabtrieb_ROW4328676685_tmb.jpg&rf=',
      title: `Today's Homepage`,
      description: `See what's on the Bing homepage today!`,
      provider: 'Bing',
    },
  )

  t.deepEqual(
    await parse('http://localhost/', read('localhost.html')),
    {
      url: 'http://localhost/',
      icon: 'http://localhost/favicon.ico',
      provider: 'localhost',
      title: 'Localhost',
    },
    'resolves relative paths',
  )

  t.deepEqual(
    await parse('http://localhost/', read('localhost-github.html')),
    {
      url: 'http://localhost/',
      icon: 'https://github.com/favicon.ico',
      provider: 'localhost',
      title: 'Localhost',
    },
    'uses document base to resolve relative paths',
  )

  t.end()
})

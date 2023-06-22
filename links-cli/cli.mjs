#!/usr/bin/env node
// @ts-check
import chalk from 'chalk'
import PocketBase, { BaseAuthStore } from 'pocketbase'
import ora from 'ora'
import { v4 as uuid } from 'uuid'
import { ArgumentParser } from 'argparse'
import { $ } from 'execa'
import fs from 'fs/promises'
import os from 'os'
import { input } from '@inquirer/prompts'

process.env.NODE_NO_WARNINGS = "1"

/**
* @param {number} t in seconds
*/
function delay(t) {
  return new Promise(r => setTimeout(r, t * 1000))
}

const rcfilepath = `${os.homedir()}/.linksrc`

async function readConfig() {
  let host = "http://localhost:8090"
  let clientid = "<replaceme>"
  let isRCPresent = false

  try {
    const check = await fs.stat(rcfilepath)
    isRCPresent = check.isFile()
  } catch { }

  if (!isRCPresent) {
    try {
      await fs.writeFile(rcfilepath, `host=${host}\nclientid=${clientid}\n`)
    } catch {
      console.log('could not create rc')
    }
  } else {
    const data = await fs.readFile(rcfilepath)
    /** @type{any} **/
    const str = data.toString().trim().split('\n').map(x => x.split('=')).reduce((k, x) => {
      k[x[0]] = x[1]
      return k
    }, {})
    host = str.host
    clientid = str.clientid
  }

  const client = new PocketBase(host)
  const result = await client.collection('pubtokens').getList(1, 1, { clientid })
  return { token: (result.items[0] || {}).authid, host }
}


/**
* @returns {Promise<{ client: PocketBase, user: import('pocketbase').Record }>}
*/
async function getClient() {
  const { token, host } = await readConfig()
  // @ts-ignore
  const bauth = new BaseAuthStore()
  bauth.save(token, null)
  let user = null
  let client = new PocketBase(host, bauth)

  if (client.authStore.isValid) {
    user = (await client.collection('users').getList(1, 1)).items[0]
    return { client, user }
  }

  const hint = await waitTilAuthenticated(client, host)
  bauth.save(hint, null)
  client = new PocketBase(host, bauth)
  user = (await client.collection('users').getList(1, 1)).items[0]


  return { client, user }
}


/**
* @param {PocketBase} client
* @param {string} host
* @returns {Promise<null | string>} hint
*/
async function waitTilAuthenticated(client, host) {
  const clientid = uuid()
  const { stdout: hostname } = await $`hostname`
  console.log(`\nPlease give access to this cli, with id "${clientid}"`, `\nto give access to this machine: ${hostname}\n`)
  const timeout = 60
  let i = 0
  let hint = {}

  const spinner = ora('waiting, you have 1 min.').start()

  while (i <= timeout && !hint.authid) {
    await delay(1)
    const pubtoken = await client.collection('pubtokens').getList(1, 1, { clientid })
    hint = (pubtoken.items[0] || {})
    i += 1
  }
  spinner.stop()

  const nextclientid = uuid()

  try {
    await client.collection('pubtokens').delete(hint.id, { clientid })
  } catch {
    console.log('could not delete')
  }

  try {
    await client.collection('pubtokens').create({
      clientid: nextclientid,
      authid: hint.authid,
      name: hostname,
      user: hint.user,
      active: true,
    }, { clientid: nextclientid })

    await fs.writeFile(rcfilepath, `host=${host}\nclientid=${nextclientid}\n`)
  } catch {
    console.log('could not create')
  }

  return hint.authid
}


async function main() {
  const parser = new ArgumentParser({ description: 'Links cli' })
  parser.add_argument('-s', { dest: 'search', help: 'search your links' })
  parser.add_argument('--new', { dest: 'newlink', help: 'add a new link', action: 'store_true' })
  let args = parser.parse_args()

  if (!args.newlink && !args.search) {
    parser.print_help()
    process.exit(0)
  }

  console.log("")
  const { client, user } = await getClient()

  if (!client.authStore.isValid) {
    console.log('timeout!', 'could not authenticate')
    process.exit(1)
  }

  if (args.newlink) {
    const newlink = await input({ message: 'Enter your link:' })
    const details = await scrappeUrl(newlink)
    for (const key of Object.keys(details)) {
      console.log(`${chalk.blue(key)}:`, details[key])
    }
    
    const tagstr = await input({ message: 'Enter tags [,]:' })
    const tags = tagstr.split(',').filter(Boolean).concat([newlink.split('/')[2]]).concat(details.tags)
    
    console.log('create new link', newlink, 'with tags:', tags)
    const spinner = ora('creating new link').start()

    await client.collection('links').create({ url: newlink, author: user.id, tags })
    spinner.succeed("Created!")
  }

  if (args.search) {
    const spinner = ora(`searching links with "${args.search}"`).start()
    /** @type{import('pocketbase').ListResult<import('pocketbase').Record> | null} */
    let links = null
    if (args.search.includes('tag:')) {
      const tag = args.search.slice(4)
      links = await client.collection('links').getList(1, 10, { filter: `tags:each ~ "${tag}"` })
    } else {
      links = await client.collection('links').getList(1, 10, { filter: `url ~ "${args.search}" || desc ~ "${args.search}" ` })
    }
    spinner.succeed("Results:\n")
    for (const link of links.items) {
      console.log('---')
      console.log(chalk.yellow(link.title||link.desc))
      console.log(chalk.blue(link.url))
      console.log(chalk.red(link.tags.map(t => '#'+t).join(' ')))
    }
    console.log('---')

  }

  console.log("")
}

/**
* @param {string} url
*/
async function scrappeUrl(url) {
  const res = await fetch(url)
  const text = await res.text()
  const metaTags = getMetaTags(text)
  const keywords = metaTags.filter((text) => text.includes('keywords'))
  const descriptions = metaTags.filter((text) => text.includes('description'))
  const images = metaTags.filter((text) => text.includes(':image"'))

  // console.log({ images, descriptions })
  const [desc] = getMetaTagContents(descriptions[0] || '')
  const [image] = getMetaTagContents(images[0] || '')
  const [tags] = getMetaTagContents(keywords[0] || '')
  const [title] = getTitle(text)

  return { desc, image, title, tags: (tags||'').split(',').map(x => x.trim()).filter(Boolean) }
}


/**
* @param {string} html
*/
function getMetaTagContents(html) {
  const regex = /<meta[^>]*content="([^"]*)"[^>]*>/gi
  const matches = []
  let match

  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1])
  }

  return matches
}

/**
  * @param {string} html
  */
function getTitle(html) {
  const regex = /<title>([^<]+)<\/title>/gi
  const matches = []
  let match

  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1])
  }

  return matches
}

/**
  * @param {string} html
  */
function getMetaTags(html) {
  const regex = /<meta[^>]*>/gi
  const matches = []
  let match

  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[0])
  }

  return matches
}


await main()

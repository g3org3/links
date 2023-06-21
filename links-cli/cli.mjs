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
  parser.add_argument('-n', { dest: 'newlink', help: 'add a new link' })
  parser.add_argument('-s', { dest: 'search', help: 'search for links' })
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
    console.log('create new link', args.newlink)
    const spinner = ora('creating new link').start()
    await client.collection('links').create({ url: args.newlink, author: user.id })
    spinner.succeed("Created!")
  }

  if (args.search) {
    const spinner = ora(`searching links with "${args.search}"`).start()
    const links = await client.collection('links').getList(1, 10, { filter: `url ~ "${args.search}" || desc ~ "${args.search}" ` })
    spinner.succeed("Results:\n")
    for (const link of links.items) {
      console.log('---')
      console.log(chalk.blue(link.url))
      console.log(chalk.yellow(link.desc))
    }
    console.log('---')

  }

  console.log("")
}


await main()

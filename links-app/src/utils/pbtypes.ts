/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase'
import type { RecordService, RecordListOptions, RecordFullListOptions } from 'pocketbase'

export enum Collections {
  Links = 'links',
  Snapshots = 'snapshots',
  Sprints = 'sprints',
  Tickets = 'tickets',
  Users = 'users',
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString
  created: IsoDateString
  updated: IsoDateString
  collectionId: string
  collectionName: Collections
  expand?: T
}

export type AuthSystemFields<T = never> = {
  email: string
  emailVisibility: boolean
  username: string
  verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type LinksRecord<Ttags = unknown> = {
  author?: RecordIdString
  desc?: string
  field?: string
  tags?: null | Ttags
  title?: string
  url?: string
}

export type SnapshotsRecord = {
  fetchedat?: IsoDateString
  sprint?: RecordIdString
}

export type SprintsRecord = {
  name?: string
}

export type TicketsRecord<Tlabels = unknown, Tparents = unknown> = {
  description?: string
  epic?: string
  fetchedat?: IsoDateString
  key?: string
  labels?: null | Tlabels
  owner?: string
  parents?: null | Tparents
  points?: number
  summary?: string
}

export type UsersRecord = {
  avatar?: string
  name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type LinksResponse<Ttags = unknown, Texpand = unknown> = Required<LinksRecord<Ttags>> &
  BaseSystemFields<Texpand>
export type SnapshotsResponse<Texpand = unknown> = Required<SnapshotsRecord> & BaseSystemFields<Texpand>
export type SprintsResponse<Texpand = unknown> = Required<SprintsRecord> & BaseSystemFields<Texpand>
export type TicketsResponse<Tlabels = unknown, Tparents = unknown, Texpand = unknown> = Required<
  TicketsRecord<Tlabels, Tparents>
> &
  BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  links: LinksRecord
  snapshots: SnapshotsRecord
  sprints: SprintsRecord
  tickets: TicketsRecord
  users: UsersRecord
}

export type CollectionResponses = {
  links: LinksResponse
  snapshots: SnapshotsResponse
  sprints: SprintsResponse
  tickets: TicketsResponse
  users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'links'): RecordService<LinksResponse>
  collection(idOrName: 'snapshots'): RecordService<SnapshotsResponse>
  collection(idOrName: 'sprints'): RecordService<SprintsResponse>
  collection(idOrName: 'tickets'): RecordService<TicketsResponse>
  collection(idOrName: 'users'): RecordService<UsersResponse>
}

// Generated Schemas

export const linksSchema = z.object({
  title: z.string().nullish(),
  tags: z.object().nullish(),
  author: z.string().nullish(),
  desc: z.string().nullish(),
  field: z.string().url().nullish(),
  url: z.string().url().nullish(),
})

export const snapshotsSchema = z.object({
  fetchedat: z.string().min().max().nullish(),
  sprint: z.string().nullish(),
})

export const sprintsSchema = z.object({
  name: z.string().nullish(),
})

export const ticketsSchema = z.object({
  key: z.string().nullish(),
  summary: z.string().nullish(),
  description: z.string().nullish(),
  epic: z.string().nullish(),
  points: z.number().nullish(),
  owner: z.string().nullish(),
  labels: z.object().nullish(),
  parents: z.object().nullish(),
  fetchedat: z.string().min().max().nullish(),
})

export const usersSchema = z.object({
  name: z.string().nullish(),
  avatar: z.string().nullish(),
})

// Generated Hooks

export async function useGetAllLinks(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Links).getFullList<LinksResponse>(options)
}

export async function useGetLinks(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Links).getList<LinksResponse>(page, perPage, options)
}

export async function useGetAllSnapshots(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Snapshots).getFullList<SnapshotsResponse>(options)
}

export async function useGetSnapshots(
  pb: PocketBase,
  page: number,
  perPage: number,
  options: RecordListOptions
) {
  return await pb.collection(Collections.Snapshots).getList<SnapshotsResponse>(page, perPage, options)
}

export async function useGetAllSprints(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Sprints).getFullList<SprintsResponse>(options)
}

export async function useGetSprints(
  pb: PocketBase,
  page: number,
  perPage: number,
  options: RecordListOptions
) {
  return await pb.collection(Collections.Sprints).getList<SprintsResponse>(page, perPage, options)
}

export async function useGetAllTickets(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Tickets).getFullList<TicketsResponse>(options)
}

export async function useGetTickets(
  pb: PocketBase,
  page: number,
  perPage: number,
  options: RecordListOptions
) {
  return await pb.collection(Collections.Tickets).getList<TicketsResponse>(page, perPage, options)
}

export async function useGetAllUsers(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Users).getFullList<UsersResponse>(options)
}

export async function useGetUsers(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Users).getList<UsersResponse>(page, perPage, options)
}

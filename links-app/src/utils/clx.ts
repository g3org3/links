export const clx = (cond: Record<string, boolean>, clss: string) => {
  return [clss].concat(Object.keys(cond).filter((key) => cond[key])).join(' ')
}

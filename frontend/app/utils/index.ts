export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const isBrowser = typeof window !== "undefined"

export const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ')
}

export const truncate = (str: string, maxLength: number) => {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}
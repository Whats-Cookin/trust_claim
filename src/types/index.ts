declare global {
  interface Window {
    ethereum?: any
  }

  interface BackEndModel {
    aliases: any
    schemaCeramicId: string
  }
}

export {}

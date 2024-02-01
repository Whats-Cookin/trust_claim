type VaultConfig = {
  impersonate: string[]
}

type SismoConnectConfig = {
  appId: string
  vault?: VaultConfig
  displayRawResponse?: boolean
  sismoApiUrl?: string
  vaultAppBaseUrl?: string
}

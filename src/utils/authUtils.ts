export const checkAuth = () => {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const ethAddress = localStorage.getItem('ethAddress')
  const did = localStorage.getItem('did')
  return !!((did && ethAddress) || (accessToken && refreshToken))
}

import { EnvType } from "./env.type";

export const ENV: EnvType = Object.freeze({
  IS_DEV: true,
  PLAY_CALL_MUSIC: false,
  CC_URL_PREFIX: 'https://dev.mobapi-k8s.fincube.uz',
  API_URL_PREFIX: 'https://dev.mobapi-k8s.fincube.uz',
  ASTERISK_WS_HOST: 'call.apexbank.corp',
  ASTERISK_WS_PORT: '8089',
  SIP_GO_OFFLINE_NUMBER: '*78',
  SIP_GO_ONLINE_NUMBER: '*79',
})
